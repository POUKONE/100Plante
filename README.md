# 100Plante

[![GitHub](https://img.shields.io/badge/GitHub-POUKONE%2F100Plante-181717?logo=github)](https://github.com/POUKONE/100Plante)

Système de détection de maladies sur feuilles de plantes par transfer learning
(dataset PlantVillage, 38 classes, 14 espèces). Cahier des charges complet dans
[`docs/cahier-des-charges.md`](docs/cahier-des-charges.md).

## Structure du projet

- [`backend/`](backend/README.md) — API FastAPI (Python) : sert le modèle, expose
  `/api/predict` et `/api/health`, contient le pipeline de données et d'entraînement.
- [`frontend/`](frontend/README.md) — Next.js : pages accueil, démo (upload réel →
  appel API) et résultat, design system Ultra Design / Edge / Neuropath / Hyperkit / Motion TM.
- `docs/` — documentation projet.

## Démarrer en local

```bash
cd backend && ./.venv/bin/uvicorn app.main:app --reload --port 8000
```
```bash
cd frontend && npm run dev
```
Puis ouvrir `http://localhost:3000`.

## Où en est-on

- [x] Squelette backend FastAPI, opérationnel en mode placeholder (voir
      [`backend/README.md`](backend/README.md#mode-placeholder))
- [x] Téléchargement + préparation des données PlantVillage (54 303 images,
      38 classes, split 70/15/15 stratifié dans `backend/data/{train,val,test}`)
- [x] Baseline scikit-learn (Random Forest, features couleur+HOG) : accuracy
      80,74 %, F1 macro 72,98 % sur validation — seuil de référence à battre
      strictement par le transfer learning (section 10)
- [x] Modèle de transfer learning MobileNetV2 (`backend/models/leaf_disease_model.keras`,
      21 Mo) : accuracy 96,48 %, F1 macro 95,93 % sur validation. API en production
      réelle (`is_placeholder: false`), inférence ~50-260 ms/image.
- [x] Évaluation détaillée sur le jeu de test (`backend/reports/evaluation_report.md`) :
      accuracy 96,47 %, F1 macro 95,66 % — les 3 critères d'acceptation de la
      section 10 passent. Confusions principales documentées (maladies
      visuellement proches, ex. Tomato Early blight / Target Spot).
- [x] Frontend Next.js (`frontend/`) : accueil (Edge + Motion TM), démo (Neuropath +
      Hyperkit, upload réel relié à l'API), résultat (Ultra Design + Motion TM) —
      testé de bout en bout avec le vrai modèle entraîné
- [ ] Documentation de livraison
