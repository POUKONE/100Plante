"""Phase 3 (cahier des charges section 8) — transfer learning MobileNetV2.

Stratégie en deux temps (section 6.1) :
  1. Feature extraction : le corps convolutif de MobileNetV2 (pré-entraîné sur
     ImageNet) est gelé, seule la tête de classification (38 sorties) est entraînée.
  2. Fine-tuning : les dernières couches de MobileNetV2 sont dégelées et
     réentraînées avec un taux d'apprentissage beaucoup plus faible, une fois la
     tête stabilisée — pour affiner les features vers le domaine "feuilles de
     plantes" sans détruire ce qui a été appris sur ImageNet.

DÉCISION (prise après analyse du split, cf. scripts/prepare_data.py) : déséquilibre
fort entre classes (min=106 images pour Potato___healthy, max=3854 pour
Orange___Haunglongbing_(Citrus_greening), ratio ~36x). Mitigation retenue :
  a. `class_weight` Keras calculé sur data/train (compute_class_weight('balanced')),
     passé à model.fit(..., class_weight=...).
  b. Suivi du F1 macro (pas seulement l'accuracy) pendant l'entraînement et à
     l'évaluation (voir scripts/evaluate.py) — c'est aussi le critère
     d'acceptation section 10.
Augmentation ciblée sur les classes rares écartée pour l'instant : la classe la
plus petite a quand même 106 images, jugé suffisant pour du transfer learning
sans complexifier le pipeline.

Le prétraitement (resize 224x224, normalisation en [-1, 1]) est appliqué dans le
modèle lui-même (couche Rescaling), pour rester identique à app/ml/preprocess.py
utilisé à l'inférence — un écart ici casserait silencieusement la précision en
production.

Usage :
    python scripts/train_transfer_learning.py
    python scripts/train_transfer_learning.py --epochs-head 8 --epochs-finetune 8 --fine-tune-layers 30
"""

import argparse
import sys
from pathlib import Path

import numpy as np

BACKEND_DIR = Path(__file__).resolve().parent.parent
DEFAULT_DATA_DIR = BACKEND_DIR / "data"
DEFAULT_MODEL_PATH = BACKEND_DIR / "models" / "leaf_disease_model.keras"
CHECKPOINT_DIR = BACKEND_DIR / "models" / "checkpoints"
TENSORBOARD_DIR = BACKEND_DIR / "models" / "tensorboard_logs"

sys.path.insert(0, str(BACKEND_DIR))  # pour pouvoir importer app.ml.labels

IMAGE_SIZE = (224, 224)
BATCH_SIZE = 32
SEED = 42  # reproductibilité, cf. section 6.3


def _build_datasets(data_dir: Path):
    import tensorflow as tf

    from app.ml.labels import CLASSES

    train_ds = tf.keras.utils.image_dataset_from_directory(
        data_dir / "train",
        label_mode="categorical",
        image_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
        shuffle=True,
        seed=SEED,
    )
    val_ds = tf.keras.utils.image_dataset_from_directory(
        data_dir / "val",
        label_mode="categorical",
        image_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
        shuffle=False,
    )

    expected = [c.label for c in CLASSES]
    if train_ds.class_names != expected:
        raise SystemExit(
            "L'ordre des classes détecté sur disque ne correspond pas à app/ml/labels.py "
            "— l'API servirait des labels faux si on continuait.\n"
            f"Disque : {train_ds.class_names}\nlabels.py : {expected}"
        )

    train_ds = train_ds.prefetch(tf.data.AUTOTUNE)
    val_ds = val_ds.prefetch(tf.data.AUTOTUNE)
    return train_ds, val_ds


def _compute_class_weight(data_dir: Path) -> dict[int, float]:
    from sklearn.utils.class_weight import compute_class_weight

    class_dirs = sorted(p for p in (data_dir / "train").iterdir() if p.is_dir())
    labels = np.concatenate(
        [np.full(len(list(d.glob("*.jpg"))), i) for i, d in enumerate(class_dirs)]
    )
    weights = compute_class_weight("balanced", classes=np.unique(labels), y=labels)
    return dict(enumerate(weights))


def _build_model(num_classes: int):
    import tensorflow as tf
    from tensorflow.keras import layers

    data_augmentation = tf.keras.Sequential(
        [
            layers.RandomFlip("horizontal"),
            layers.RandomRotation(0.15),
            layers.RandomZoom(0.1),
            layers.RandomBrightness(0.1),
        ],
        name="data_augmentation",
    )

    base_model = tf.keras.applications.MobileNetV2(
        input_shape=IMAGE_SIZE + (3,), include_top=False, weights="imagenet"
    )
    base_model.trainable = False

    inputs = tf.keras.Input(shape=IMAGE_SIZE + (3,))
    x = data_augmentation(inputs)
    x = layers.Rescaling(1.0 / 127.5, offset=-1.0)(x)  # identique à app/ml/preprocess.py
    x = base_model(x, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dropout(0.2)(x)
    outputs = layers.Dense(num_classes, activation="softmax")(x)

    model = tf.keras.Model(inputs, outputs)
    return model, base_model


def _callbacks(stage: str):
    import tensorflow as tf

    CHECKPOINT_DIR.mkdir(parents=True, exist_ok=True)
    return [
        tf.keras.callbacks.EarlyStopping(monitor="val_loss", patience=5, restore_best_weights=True),
        tf.keras.callbacks.ModelCheckpoint(
            CHECKPOINT_DIR / f"{stage}.keras", monitor="val_loss", save_best_only=True
        ),
        tf.keras.callbacks.TensorBoard(log_dir=TENSORBOARD_DIR / stage),
    ]


def train(
    data_dir: Path,
    model_path: Path,
    base_model_name: str,
    epochs_head: int,
    epochs_finetune: int,
    fine_tune_layers: int,
) -> None:
    if base_model_name != "mobilenetv2":
        raise NotImplementedError(
            "Seul mobilenetv2 est implémenté pour l'instant. EfficientNetB0 attend une "
            "normalisation d'entrée différente (pas de rescale en [-1, 1]) : basculer dessus "
            "nécessite d'adapter à la fois ce script ET app/ml/preprocess.py, sous peine "
            "d'incohérence entraînement/inférence."
        )

    import tensorflow as tf

    tf.keras.utils.set_random_seed(SEED)

    from app.ml.labels import NUM_CLASSES

    train_ds, val_ds = _build_datasets(data_dir)
    class_weight = _compute_class_weight(data_dir)
    model, base_model = _build_model(NUM_CLASSES)

    metrics = ["accuracy", tf.keras.metrics.F1Score(average="macro", name="f1_macro")]

    # --- Étape 1 : feature extraction (base gelée) ---
    print(f"\n=== Étape 1/2 : feature extraction ({epochs_head} epochs max, base gelée) ===")
    model.compile(optimizer=tf.keras.optimizers.Adam(1e-3), loss="categorical_crossentropy", metrics=metrics)
    model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=epochs_head,
        class_weight=class_weight,
        callbacks=_callbacks("head"),
    )

    # --- Étape 2 : fine-tuning des dernières couches ---
    print(f"\n=== Étape 2/2 : fine-tuning des {fine_tune_layers} dernières couches ({epochs_finetune} epochs max) ===")
    base_model.trainable = True
    for layer in base_model.layers[:-fine_tune_layers]:
        layer.trainable = False

    model.compile(optimizer=tf.keras.optimizers.Adam(1e-5), loss="categorical_crossentropy", metrics=metrics)
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=epochs_head + epochs_finetune,
        initial_epoch=epochs_head,
        class_weight=class_weight,
        callbacks=_callbacks("finetune"),
    )

    model_path.parent.mkdir(parents=True, exist_ok=True)
    model.save(model_path)

    final_val_loss, final_val_acc, final_val_f1 = model.evaluate(val_ds, verbose=0)
    print(f"\nModèle sauvegardé : {model_path}")
    print(f"Validation finale — accuracy: {final_val_acc:.4f}, F1 macro: {final_val_f1:.4f}")
    print(f"Rappel baseline (models/baseline/*_metrics.json) — accuracy: 0.8074, F1 macro: 0.7298")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data-dir", type=Path, default=DEFAULT_DATA_DIR)
    parser.add_argument("--model-path", type=Path, default=DEFAULT_MODEL_PATH)
    parser.add_argument("--base-model", choices=["mobilenetv2", "efficientnetb0"], default="mobilenetv2")
    parser.add_argument("--epochs-head", type=int, default=8)
    parser.add_argument("--epochs-finetune", type=int, default=8)
    parser.add_argument("--fine-tune-layers", type=int, default=30)
    args = parser.parse_args()
    train(
        args.data_dir,
        args.model_path,
        args.base_model,
        args.epochs_head,
        args.epochs_finetune,
        args.fine_tune_layers,
    )
