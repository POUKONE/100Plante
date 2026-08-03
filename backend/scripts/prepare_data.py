"""Phase 1 (cahier des charges section 4.3) — split stratifié train/val/test.

Prend les images classées par dossier dans backend/data/raw/<classe>/*.jpg
(produites par download_data.py) et les répartit en 70 % train / 15 % val / 15 % test,
stratifié par classe, dans backend/data/{train,val,test}/<classe>/*.jpg.

Le redimensionnement et la normalisation ne sont PAS faits ici : ils sont appliqués
à la volée pendant l'entraînement (voir app/ml/preprocess.py), pour garder les
fichiers sources intacts et pouvoir changer de résolution sans re-générer le split.

Usage :
    python scripts/prepare_data.py
"""

import argparse
import random
import shutil
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
DEFAULT_RAW_DIR = BACKEND_DIR / "data" / "raw"
DEFAULT_OUTPUT_DIR = BACKEND_DIR / "data"

TRAIN_RATIO = 0.70
VAL_RATIO = 0.15
# TEST_RATIO = 0.15 (le reste)
SEED = 42  # reproductibilité, cf. cahier des charges section 6.3


def split_dataset(raw_dir: Path, output_dir: Path) -> None:
    if not raw_dir.exists():
        raise SystemExit(f"{raw_dir} n'existe pas — lancer d'abord scripts/download_data.py")

    rng = random.Random(SEED)
    report: dict[str, dict[str, int]] = {}

    class_dirs = sorted(p for p in raw_dir.iterdir() if p.is_dir())
    for class_dir in class_dirs:
        images = sorted(class_dir.glob("*.jpg"))
        rng.shuffle(images)

        n = len(images)
        n_train = int(n * TRAIN_RATIO)
        n_val = int(n * VAL_RATIO)

        splits = {
            "train": images[:n_train],
            "val": images[n_train : n_train + n_val],
            "test": images[n_train + n_val :],
        }

        report[class_dir.name] = {}
        for split_name, split_images in splits.items():
            split_class_dir = output_dir / split_name / class_dir.name
            split_class_dir.mkdir(parents=True, exist_ok=True)
            for image_path in split_images:
                shutil.copy2(image_path, split_class_dir / image_path.name)
            report[class_dir.name][split_name] = len(split_images)

    _print_report(report)


def _print_report(report: dict[str, dict[str, int]]) -> None:
    print(f"{'Classe':<55} {'train':>7} {'val':>7} {'test':>7}")
    totals = {"train": 0, "val": 0, "test": 0}
    for class_name, counts in report.items():
        print(f"{class_name:<55} {counts['train']:>7} {counts['val']:>7} {counts['test']:>7}")
        for split_name in totals:
            totals[split_name] += counts[split_name]
    print("-" * 78)
    print(f"{'TOTAL':<55} {totals['train']:>7} {totals['val']:>7} {totals['test']:>7}")

    # Signal de déséquilibre de classes (cahier des charges section 4.3 / 11)
    train_counts = [counts["train"] for counts in report.values()]
    if train_counts and max(train_counts) > 3 * min(train_counts):
        print(
            "\nATTENTION : fort déséquilibre entre classes détecté "
            f"(min={min(train_counts)}, max={max(train_counts)}). "
            "Prévoir une pondération de la loss ou un suivi F1 macro (section 6.1 / 11)."
        )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--raw-dir", type=Path, default=DEFAULT_RAW_DIR)
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    args = parser.parse_args()
    split_dataset(args.raw_dir, args.output_dir)
