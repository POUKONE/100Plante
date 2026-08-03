# Backend — 100Plante

[![GitHub](https://img.shields.io/badge/GitHub-POUKONE%2F100Plante-181717?logo=github)](https://github.com/POUKONE/100Plante)

API FastAPI qui sert le modèle de classification de maladies foliaires (cahier des
charges : `../docs/cahier-des-charges.md`).

## Démarrer en local

```bash
cd backend
pyenv local 3.11.6          # déjà fait, présent dans .python-version
python -m venv .venv         # déjà fait
./.venv/bin/pip install -r requirements.txt
./.venv/bin/uvicorn app.main:app --reload --port 8000
```

Puis ouvrir `http://localhost:8000/docs` (Swagger généré automatiquement par FastAPI).

### Avec Docker

```bash
docker build -t 100plante-backend .
docker run -p 8000:8000 100plante-backend
```

Déploiement en production : voir la section **Déploiement** du
[README racine](../README.md#déploiement) (Render, config dans `../render.yaml`).

## Structure

```
app/
  core/config.py       Configuration centralisée (seuils, tailles d'image, CORS...)
  api/routes/          Endpoints HTTP (health, predict)
  ml/                  Labels des 38 classes, prétraitement, chargement/inférence du modèle
  schemas/             Modèles Pydantic (validation + doc OpenAPI automatique)
  main.py              Point d'entrée FastAPI
scripts/                Pipeline ML (téléchargement, split, entraînement, évaluation)
models/                 Modèles entraînés (non versionnés, gros fichiers)
data/                   Dataset PlantVillage (non versionné)
tests/                  Tests pytest de l'API
```

## Mode placeholder

Tant qu'aucun modèle entraîné n'existe à `models/leaf_disease_model.keras`, l'API
répond quand même sur `/api/predict`, mais avec une prédiction **factice**
(déterministe à partir d'un hash de l'image, pas un vrai modèle). Chaque réponse
porte `"is_placeholder": true` pour que le frontend puisse l'afficher clairement.
Cela permet de développer le frontend et de tester le contrat de l'API sans
attendre la fin de l'entraînement (phases 2/3 du cahier des charges).

Dès qu'un modèle réel est entraîné (`scripts/train_transfer_learning.py`) et
sauvegardé au bon emplacement, il est chargé automatiquement au démarrage et
`is_placeholder` passe à `false`.

## Pipeline de données et d'entraînement (phases 1 à 4)

```bash
pip install -r requirements-data.txt       # phase 1 : dépendances de téléchargement
python scripts/download_data.py            # phase 1 : télécharge PlantVillage (~54 300 images)
python scripts/prepare_data.py             # phase 1 : split stratifié 70/15/15

pip install -r requirements-baseline.txt   # phase 2 : dépendances de la baseline
python scripts/extract_baseline_features.py
python scripts/train_baseline.py           # phase 2 : Random Forest (couleur + HOG)

python scripts/train_transfer_learning.py  # phase 3 : MobileNetV2 (feature extraction + fine-tuning)

pip install -r requirements-eval.txt       # phase 4 : dépendances d'évaluation
python scripts/evaluate.py                 # phase 4 : métriques + matrice de confusion sur le jeu de test
```

Tous les scripts sont fonctionnels et ont été exécutés de bout en bout. Résultats
réels (jeu de test, 8 179 images jamais vues à l'entraînement) :

| Modèle | Accuracy | F1 macro |
|---|---|---|
| Baseline (Random Forest) | 80,95 % | 73,58 % |
| Transfer learning (MobileNetV2) | **96,47 %** | **95,66 %** |

Rapport détaillé (matrice de confusion, métriques par classe, confusions
principales) : [`reports/evaluation_report.md`](reports/evaluation_report.md).
Le modèle entraîné (`models/leaf_disease_model.keras`, 21 Mo) n'est pas versionné
dans git — relancer `train_transfer_learning.py` pour le regénérer.

## Tests

```bash
./.venv/bin/python -m pytest tests/ -v
```
