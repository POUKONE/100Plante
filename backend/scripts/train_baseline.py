"""Phase 2 (cahier des charges section 8) — baseline scikit-learn.

Entraîne un classifieur simple (random forest par défaut, SVM en option) sur les
features extraites par scripts/extract_baseline_features.py, pour fixer un seuil
de référence que le modèle de transfer learning (phase 3) devra strictement
dépasser (critère d'acceptation section 10).

Pondération : `class_weight="balanced"` pour compenser le déséquilibre de classes
identifié dans data/prepare_data.py (même logique que pour le modèle principal,
voir la décision documentée dans train_transfer_learning.py).

Prérequis :
    python scripts/extract_baseline_features.py

Usage :
    python scripts/train_baseline.py                        # random forest (recommandé, rapide)
    python scripts/train_baseline.py --model svm             # SVM RBF (beaucoup plus lent sur ~38k images)
"""

import argparse
import json
import time
from pathlib import Path

import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, f1_score
from sklearn.svm import SVC

BACKEND_DIR = Path(__file__).resolve().parent.parent
FEATURES_DIR = BACKEND_DIR / "data" / "features"
DEFAULT_OUTPUT_DIR = BACKEND_DIR / "models" / "baseline"


def load_split(split: str) -> tuple[np.ndarray, np.ndarray]:
    features_path = FEATURES_DIR / f"{split}_features.npy"
    if not features_path.exists():
        raise SystemExit(f"{features_path} introuvable — lancer d'abord scripts/extract_baseline_features.py")
    features = np.load(features_path)
    labels = np.load(FEATURES_DIR / f"{split}_labels.npy")
    return features, labels


def build_model(name: str):
    if name == "random_forest":
        return RandomForestClassifier(
            n_estimators=200,
            class_weight="balanced",
            n_jobs=-1,
            random_state=42,
        )
    if name == "svm":
        return SVC(kernel="rbf", C=10, class_weight="balanced", random_state=42)
    raise ValueError(f"Modèle inconnu : {name}")


def train_baseline(output_dir: Path, model_name: str) -> None:
    X_train, y_train = load_split("train")
    X_val, y_val = load_split("val")
    class_names = (FEATURES_DIR / "train_classes.txt").read_text().splitlines()

    print(f"Entraînement {model_name} sur {X_train.shape[0]} images, {X_train.shape[1]} features/image...")
    model = build_model(model_name)

    start = time.perf_counter()
    model.fit(X_train, y_train)
    print(f"Entraînement terminé en {time.perf_counter() - start:.0f}s\n")

    y_pred = model.predict(X_val)
    accuracy = accuracy_score(y_val, y_pred)
    f1_macro = f1_score(y_val, y_pred, average="macro")

    print(f"Accuracy (val) : {accuracy:.4f}")
    print(f"F1 macro (val) : {f1_macro:.4f}\n")
    print(classification_report(y_val, y_pred, target_names=class_names, zero_division=0))

    output_dir.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, output_dir / f"{model_name}.joblib")
    (output_dir / f"{model_name}_metrics.json").write_text(
        json.dumps({"model": model_name, "accuracy": accuracy, "f1_macro": f1_macro}, indent=2)
    )
    print(f"Modèle et métriques sauvegardés dans {output_dir}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    parser.add_argument("--model", choices=["random_forest", "svm"], default="random_forest")
    args = parser.parse_args()
    train_baseline(args.output_dir, args.model)
