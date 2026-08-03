# Backend — Leaf Disease Detection

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
pip install -r requirements-data.txt   # uniquement nécessaire pour le téléchargement
python scripts/download_data.py        # phase 1 : télécharge PlantVillage (~54 300 images)
python scripts/prepare_data.py    # phase 1 : split stratifié 70/15/15
python scripts/train_baseline.py            # phase 2 : à implémenter
python scripts/train_transfer_learning.py   # phase 3 : à implémenter
python scripts/evaluate.py                  # phase 4 : à implémenter
```

`download_data.py` et `prepare_data.py` sont fonctionnels. Les trois scripts
d'entraînement/évaluation sont des squelettes documentés (CLI + docstring détaillant
l'approche), à implémenter quand on attaquera ces phases.

## Tests

```bash
./.venv/bin/python -m pytest tests/ -v
```
