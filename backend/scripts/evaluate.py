"""Phase 4 (cahier des charges section 8) — évaluation détaillée sur le jeu de test.

C'est la seule fois où data/test est utilisé : ni l'entraînement (train), ni
l'early stopping (val) ne l'ont jamais vu, donc les métriques ici sont une mesure
honnête de la performance réelle du modèle.

Produit dans --report-dir (backend/reports/ par défaut) :
  - evaluation_report.md : rapport lisible, avec le statut de chaque critère
    d'acceptation (section 10)
  - confusion_matrix.png : matrice de confusion du modèle de transfer learning
  - confusion_matrix.csv, classification_report_transfer_learning.txt
  - metrics.json : accuracy/F1 macro des deux modèles sur le jeu de test

La baseline scikit-learn est ré-entraînée à la volée à partir des features déjà
extraites (data/features/, voir scripts/extract_baseline_features.py) puis évaluée
sur le même jeu de test que le modèle principal, pour une comparaison rigoureuse
(le fichier baseline sauvegardé a été supprimé lors du ménage disque — le
ré-entraînement prend ~2 min et est déterministe, cf. train_baseline.py).

Usage :
    python scripts/evaluate.py
"""

import argparse
import json
import sys
import time
from pathlib import Path

import numpy as np

BACKEND_DIR = Path(__file__).resolve().parent.parent
DEFAULT_DATA_DIR = BACKEND_DIR / "data"
DEFAULT_MODEL_PATH = BACKEND_DIR / "models" / "leaf_disease_model.keras"
DEFAULT_REPORT_DIR = BACKEND_DIR / "reports"

IMAGE_SIZE = (224, 224)
BATCH_SIZE = 32
TOP_N_CONFUSIONS = 15

sys.path.insert(0, str(BACKEND_DIR))  # pour importer app.ml.labels
sys.path.insert(0, str(Path(__file__).parent))  # pour importer train_baseline


def _evaluate_transfer_learning(data_dir: Path, model_path: Path, class_names: list[str]):
    import tensorflow as tf

    if not model_path.exists():
        raise SystemExit(f"{model_path} introuvable — lancer d'abord scripts/train_transfer_learning.py")

    test_ds = tf.keras.utils.image_dataset_from_directory(
        data_dir / "test",
        label_mode="int",
        image_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
        shuffle=False,
    )
    if test_ds.class_names != class_names:
        raise SystemExit("L'ordre des classes de data/test ne correspond pas à app/ml/labels.py")

    model = tf.keras.models.load_model(model_path)

    y_true = np.concatenate([y.numpy() for _, y in test_ds])
    start = time.perf_counter()
    y_pred_probs = model.predict(test_ds, verbose=0)
    elapsed = time.perf_counter() - start

    y_pred = y_pred_probs.argmax(axis=1)
    n_images = len(y_true)
    print(f"Transfer learning : {n_images} images évaluées en {elapsed:.1f}s ({elapsed / n_images * 1000:.1f} ms/image en batch)")
    return y_true, y_pred


def _evaluate_baseline(class_names: list[str]):
    import train_baseline

    X_train, y_train = train_baseline.load_split("train")
    X_test, y_test = train_baseline.load_split("test")

    print(f"Baseline : ré-entraînement random_forest sur {X_train.shape[0]} images...")
    model = train_baseline.build_model("random_forest")
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    return y_test, y_pred


def _confusion_matrix_plot(cm: np.ndarray, output_path: Path) -> None:
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    fig, ax = plt.subplots(figsize=(12, 10))
    im = ax.imshow(cm, cmap="viridis")
    ax.set_xlabel("Classe prédite (index)")
    ax.set_ylabel("Classe réelle (index)")
    ax.set_title("Matrice de confusion — transfer learning (jeu de test)")
    fig.colorbar(im, ax=ax, label="Nombre d'images")
    fig.tight_layout()
    fig.savefig(output_path, dpi=150)
    plt.close(fig)


def _top_confusions(cm: np.ndarray, class_names: list[str], top_n: int) -> list[dict]:
    confusions = []
    for true_idx in range(cm.shape[0]):
        for pred_idx in range(cm.shape[1]):
            if true_idx == pred_idx:
                continue
            count = int(cm[true_idx, pred_idx])
            if count > 0:
                confusions.append(
                    {"true": class_names[true_idx], "predicted": class_names[pred_idx], "count": count}
                )
    confusions.sort(key=lambda c: c["count"], reverse=True)
    return confusions[:top_n]


def evaluate(data_dir: Path, model_path: Path, report_dir: Path) -> None:
    from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, f1_score

    from app.ml.labels import CLASSES

    class_names = [c.label for c in CLASSES]
    report_dir.mkdir(parents=True, exist_ok=True)

    y_true_tl, y_pred_tl = _evaluate_transfer_learning(data_dir, model_path, class_names)
    y_true_bl, y_pred_bl = _evaluate_baseline(class_names)

    metrics = {}
    for name, y_true, y_pred in [("transfer_learning", y_true_tl, y_pred_tl), ("baseline", y_true_bl, y_pred_bl)]:
        metrics[name] = {
            "accuracy": accuracy_score(y_true, y_pred),
            "f1_macro": f1_score(y_true, y_pred, average="macro"),
        }

    report_txt = classification_report(y_true_tl, y_pred_tl, target_names=class_names, zero_division=0)
    (report_dir / "classification_report_transfer_learning.txt").write_text(report_txt)

    cm = confusion_matrix(y_true_tl, y_pred_tl)
    np.savetxt(report_dir / "confusion_matrix.csv", cm, fmt="%d", delimiter=",")
    _confusion_matrix_plot(cm, report_dir / "confusion_matrix.png")
    top_confusions = _top_confusions(cm, class_names, TOP_N_CONFUSIONS)

    (report_dir / "metrics.json").write_text(json.dumps(metrics, indent=2))

    # --- Critères d'acceptation, section 10 ---
    tl = metrics["transfer_learning"]
    bl = metrics["baseline"]
    criteria = [
        ("Accuracy test >= 90%", tl["accuracy"] >= 0.90, f"{tl['accuracy']:.4f}"),
        ("F1 macro test >= 85%", tl["f1_macro"] >= 0.85, f"{tl['f1_macro']:.4f}"),
        (
            "Bat strictement la baseline (accuracy ET F1 macro)",
            tl["accuracy"] > bl["accuracy"] and tl["f1_macro"] > bl["f1_macro"],
            f"TL {tl['accuracy']:.4f}/{tl['f1_macro']:.4f} vs baseline {bl['accuracy']:.4f}/{bl['f1_macro']:.4f}",
        ),
    ]

    lines = [
        "# Rapport d'évaluation — Leaf Disease Detection",
        "",
        f"Jeu de test : {len(y_true_tl)} images, {len(class_names)} classes (jamais vues pendant l'entraînement).",
        "",
        "## Critères d'acceptation (cahier des charges, section 10)",
        "",
        "| Critère | Statut | Détail |",
        "|---|---|---|",
    ]
    for label, passed, detail in criteria:
        status = "PASS" if passed else "FAIL"
        lines.append(f"| {label} | {status} | {detail} |")

    lines += [
        "",
        "## Comparaison transfer learning vs baseline (jeu de test)",
        "",
        "| Modèle | Accuracy | F1 macro |",
        "|---|---|---|",
        f"| Transfer learning (MobileNetV2) | {tl['accuracy']:.4f} | {tl['f1_macro']:.4f} |",
        f"| Baseline (Random Forest) | {bl['accuracy']:.4f} | {bl['f1_macro']:.4f} |",
        "",
        "## Top confusions (hors diagonale)",
        "",
        "| Classe réelle | Prédite à tort comme | Nombre de cas |",
        "|---|---|---|",
    ]
    for c in top_confusions:
        lines.append(f"| {c['true']} | {c['predicted']} | {c['count']} |")

    lines += [
        "",
        "## Détail par classe",
        "",
        "Voir `classification_report_transfer_learning.txt` (precision/recall/F1 par classe).",
        "",
        "## Matrice de confusion",
        "",
        "Voir `confusion_matrix.png` (axes en index de classe) et `confusion_matrix.csv` "
        "(mapping index -> classe dans app/ml/labels.py, ordre alphabétique).",
    ]
    (report_dir / "evaluation_report.md").write_text("\n".join(lines))

    print("\n" + "\n".join(lines))
    print(f"\nRapport complet écrit dans {report_dir}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data-dir", type=Path, default=DEFAULT_DATA_DIR)
    parser.add_argument("--model-path", type=Path, default=DEFAULT_MODEL_PATH)
    parser.add_argument("--report-dir", type=Path, default=DEFAULT_REPORT_DIR)
    args = parser.parse_args()
    evaluate(args.data_dir, args.model_path, args.report_dir)
