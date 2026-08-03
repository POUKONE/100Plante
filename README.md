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

## Déploiement

**En ligne actuellement :**
- Backend (Fly.io) : https://100plante-backend.fly.dev
- Frontend (Vercel) : https://100-plante.vercel.app

**Backend sur [Fly.io](https://fly.io)** — Docker, config dans `backend/fly.toml` :

```bash
brew install flyctl
fly auth login
cd backend
fly apps create 100plante-backend   # une seule fois
fly deploy
fly scale count 1                   # une seule machine (pas de redondance) pour limiter le coût
fly secrets set CORS_ALLOW_ORIGINS="https://100-plante.vercel.app"
```

Nécessite une carte bancaire enregistrée sur le compte Fly (même pour les paliers
peu coûteux). `min_machines_running = 1` dans `fly.toml` garde la machine active en
continu, pour éviter de recharger TensorFlow à froid à chaque requête après une pause.

Un `render.yaml` est aussi conservé à la racine si Render est préféré un jour
(même Dockerfile, marche à l'identique) — non utilisé actuellement.

**Frontend sur [Vercel](https://vercel.com)** :

1. Importer le dépôt sur Vercel, définir **Root Directory = `frontend`**.
2. Variable d'environnement `NEXT_PUBLIC_API_URL` = l'URL du backend Fly.io.
3. Déployer, puis mettre à jour `CORS_ALLOW_ORIGINS` côté Fly.io avec l'URL Vercel
   obtenue (commande ci-dessus) — séparer par une virgule si plusieurs domaines
   (production + preview).

Dockerfile et image testés en local avant mise en ligne (build + `/api/health` +
`/api/predict` avec une vraie image, voir historique du dépôt).

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
- [x] Déployé en production : backend sur Fly.io, frontend sur Vercel, testé de
      bout en bout en ligne (upload réel → prédiction réelle → résultat)
- [ ] Documentation de livraison
