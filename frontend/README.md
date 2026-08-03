# Frontend — 100Plante

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
