"""Phase 2 (cahier des charges section 8) — extraction de features "classiques"
(sans deep learning) pour la baseline scikit-learn.

Deux familles de features, concaténées en un seul vecteur par image :
  - Histogramme de couleur RGB (32 bins par canal = 96 valeurs) : capture les
    changements de couleur caractéristiques de nombreuses maladies (jaunissement,
    taches brunes, nécroses...).
  - HOG (Histogram of Oriented Gradients, sur l'image en niveaux de gris) : capture
    la texture et les contours (forme des lésions, taches), complémentaire à la
    couleur seule.

Ces features sont volontairement construites "à la main" (pas de réseau de
neurones) pour que la baseline soit une comparaison réellement indépendante du
modèle de transfer learning (section 6.1).

Usage :
    python scripts/extract_baseline_features.py                  # train + val + test
    python scripts/extract_baseline_features.py --split train    # un seul split
"""

import argparse
import time
from pathlib import Path

import numpy as np
from PIL import Image
from skimage.color import rgb2gray
from skimage.feature import hog

BACKEND_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BACKEND_DIR / "data"
FEATURES_DIR = DATA_DIR / "features"

IMAGE_SIZE = (128, 128)
COLOR_BINS = 32


def extract_features(image: Image.Image) -> np.ndarray:
    resized = image.convert("RGB").resize(IMAGE_SIZE)
    array = np.asarray(resized) / 255.0

    color_hist = np.concatenate(
        [np.histogram(array[:, :, ch], bins=COLOR_BINS, range=(0, 1))[0] for ch in range(3)]
    ).astype(np.float32)
    color_hist /= color_hist.sum() + 1e-8  # normalisé : indépendant de la taille de l'image

    gray = rgb2gray(array)
    hog_features = hog(
        gray,
        orientations=9,
        pixels_per_cell=(16, 16),
        cells_per_block=(2, 2),
        feature_vector=True,
    ).astype(np.float32)

    return np.concatenate([color_hist, hog_features])


def extract_split(split: str) -> None:
    split_dir = DATA_DIR / split
    if not split_dir.exists():
        raise SystemExit(f"{split_dir} n'existe pas — lancer d'abord scripts/prepare_data.py")

    class_names = sorted(p.name for p in split_dir.iterdir() if p.is_dir())
    image_paths = [(i, p) for i, c in enumerate(class_names) for p in sorted((split_dir / c).glob("*.jpg"))]

    features = []
    labels = []
    start = time.perf_counter()

    for done, (class_idx, image_path) in enumerate(image_paths, start=1):
        image = Image.open(image_path)
        features.append(extract_features(image))
        labels.append(class_idx)
        if done % 2000 == 0 or done == len(image_paths):
            elapsed = time.perf_counter() - start
            rate = done / elapsed
            remaining = (len(image_paths) - done) / rate if rate > 0 else 0
            print(f"[{split}] {done}/{len(image_paths)} images ({elapsed:.0f}s écoulées, ~{remaining:.0f}s restantes)")

    FEATURES_DIR.mkdir(parents=True, exist_ok=True)
    feature_matrix = np.stack(features)
    np.save(FEATURES_DIR / f"{split}_features.npy", feature_matrix)
    np.save(FEATURES_DIR / f"{split}_labels.npy", np.array(labels, dtype=np.int64))
    (FEATURES_DIR / f"{split}_classes.txt").write_text("\n".join(class_names))

    print(
        f"[{split}] terminé : {feature_matrix.shape[0]} images, "
        f"{feature_matrix.shape[1]} features/image, {time.perf_counter() - start:.0f}s au total\n"
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--split", choices=["train", "val", "test"], default=None)
    args = parser.parse_args()
    for split in [args.split] if args.split else ["train", "val", "test"]:
        extract_split(split)
