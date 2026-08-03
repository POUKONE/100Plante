# Frontend — 100Plante

[![GitHub](https://img.shields.io/badge/GitHub-POUKONE%2F100Plante-181717?logo=github)](https://github.com/POUKONE/100Plante)

Interface Next.js (App Router, TypeScript) pour la démonstration du système de
détection de maladies foliaires (cahier des charges : `../docs/cahier-des-charges.md`,
section 7 — direction artistique).

## Démarrer en local

```bash
npm install   # déjà fait
npm run dev
```

Ouvrir `http://localhost:3000`. Le backend (`../backend`) doit tourner sur le port 8000
(configurable via `.env.local`, variable `NEXT_PUBLIC_API_URL`).

## Déploiement (Vercel)

Déployé en production : https://100-plante.vercel.app

Root Directory = `frontend` lors de l'import du dépôt, puis variable
d'environnement `NEXT_PUBLIC_API_URL` pointant vers le backend Fly.io. Détails
étape par étape : [README racine](../README.md#déploiement).

## Pages

- `/` — accueil (principes dominants : Edge, Motion TM)
- `/demo` — import (photo ou fichier) puis analyse réelle via l'API (Neuropath, Hyperkit)
- `/resultat` — diagnostic (Ultra Design, Motion TM), lit le dernier résultat
  stocké en `sessionStorage` par la page `/demo`

## Design system

Tokens de couleur/typographie dans `app/globals.css` (variables CSS) — palette
volontairement écartée des réflexes "produit IA" génériques : fond charbon à
dominante verte, accents vert mousse (sain) / ocre-rouille (maladie). Police IBM
Plex (Serif/Sans/Mono), auto-hébergée via `next/font/local` (`app/fonts.ts`,
fichiers dans `app/fonts/`).

Composants partagés : `components/BrandMark.tsx` (logo), `components/NeuropathTrail.tsx`
(fil de navigation Import → Analyse → Résultat, utilisé sur `/demo` et `/resultat`).

## Traductions

Les 38 classes PlantVillage sont renvoyées en anglais par l'API (labels bruts du
dataset). `lib/translations.ts` les traduit en français pour l'affichage — à
maintenir en synchronisme avec `../backend/app/ml/labels.py` si les classes changent.

## Diagnostic détaillé (page Résultat)

Au-delà du score de confiance brut, la page `/resultat` explique le diagnostic
avec des données issues de l'évaluation réelle du modèle (phase 4, voir
`../backend/reports/evaluation_report.md`) :

- `lib/diseaseInfo.ts` — cause et symptômes de chaque maladie (information
  générale uniquement, **pas de recommandation de traitement** — hors périmètre
  du cahier des charges, section 3.2).
- `lib/modelReliability.ts` — précision/rappel/F1 réels par classe (mesurés sur
  8 179 photos de test) traduits en langage clair ("fiabilité excellente/bonne/
  moyenne"), et confusions connues entre classes (issues de la matrice de
  confusion réelle) pour expliquer pourquoi une alternative apparaît dans le top-3.

Ces deux fichiers sont à régénérer si le modèle est réentraîné et que les
métriques ou confusions changent significativement (relancer
`../backend/scripts/evaluate.py` et reporter les nouveaux chiffres).
