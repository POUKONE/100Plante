"""Phase 1 (cahier des charges section 8) — téléchargement du dataset PlantVillage.

Utilise TensorFlow Datasets (dataset 'plant_village', ~54 300 images, 38 classes),
qui ne nécessite pas de compte Kaggle : le téléchargement se fait depuis le
mirror public TFDS.

Usage :
    pip install tensorflow-datasets   # pas encore dans requirements.txt (gros téléchargement,
                                       # à faire volontairement au moment de lancer la phase 1)
    python scripts/download_data.py

Résultat : backend/data/raw/<Espece___Etat>/<n>.jpg (une image par fichier, classée par
dossier de classe pour être compatible avec `image_dataset_from_directory`).
"""

import argparse
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
DEFAULT_OUTPUT_DIR = BACKEND_DIR / "data" / "raw"

sys.path.insert(0, str(BACKEND_DIR))  # pour pouvoir importer app.ml.labels


def download_and_export(output_dir: Path) -> None:
    import tensorflow_datasets as tfds
    from PIL import Image

    from app.ml.labels import CLASSES

    output_dir.mkdir(parents=True, exist_ok=True)

    dataset, info = tfds.load("plant_village", split="train", with_info=True, as_supervised=True)
    tfds_class_names = info.features["label"].names

    counts = {label: 0 for label in tfds_class_names}
    for image_tensor, label_tensor in tfds.as_numpy(dataset):
        class_name = tfds_class_names[int(label_tensor)]
        class_dir = output_dir / class_name
        class_dir.mkdir(exist_ok=True)

        counts[class_name] += 1
        out_path = class_dir / f"{counts[class_name]:05d}.jpg"
        Image.fromarray(image_tensor).save(out_path, format="JPEG", quality=95)

    total = sum(counts.values())
    print(f"Téléchargement terminé : {total} images réparties sur {len(counts)} classes dans {output_dir}")

    known_labels = {c.label for c in CLASSES}
    unexpected = set(tfds_class_names) - known_labels
    if unexpected:
        print(
            "ATTENTION : classes TFDS absentes de app/ml/labels.py, à vérifier : "
            f"{sorted(unexpected)}"
        )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    args = parser.parse_args()
    download_and_export(args.output_dir)
