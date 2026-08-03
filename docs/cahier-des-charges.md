# Cahier des charges — Système de détection de maladies sur feuilles de plantes par transfer learning

> Copie de travail extraite de `Cahier_des_charges_Detection_Maladies_Feuilles.docx` (v1.1, 2 août 2026), conservée ici pour que les décisions techniques du projet restent traçables à côté du code.

## 1. Contexte et enjeux

Les maladies foliaires représentent une cause majeure de pertes de rendement agricole à l'échelle mondiale. Leur détection précoce, aujourd'hui réalisée le plus souvent par observation visuelle d'un agronome ou de l'agriculteur, est lente, coûteuse à grande échelle, et sujette à l'erreur humaine, en particulier dans les zones à faible accès à l'expertise phytosanitaire.

L'objectif du projet est de développer un système de classification automatique capable d'identifier, à partir d'une simple photo de feuille, la présence et le type d'une maladie, afin de permettre une intervention plus rapide et mieux ciblée.

Le projet s'appuie sur le jeu de données public PlantVillage.

## 2. Objectifs

- Objectif général : classer l'état sanitaire d'une feuille (saine ou maladie spécifique) via transfer learning.
- Exactitude globale > 90 % sur jeu de test indépendant.
- Niveau de confiance + top-3 des classes probables par prédiction.
- Modèle léger (< 20 Mo indicatif après conversion) pour mobile/embarqué.
- Interface de démonstration simple.
- Documentation des limites (notamment en conditions réelles de terrain).

## 3. Périmètre

**Inclus** : classification multi-classes sur les 38 classes PlantVillage (14 espèces), transfer learning depuis ImageNet, évaluation quantitative, interface de démo, documentation.

**Hors périmètre** : cultures hors PlantVillage, déploiement flotte de capteurs/drones, recommandation de traitement automatisée, collecte de nouvelles données terrain.

## 4. Données

- Source : PlantVillage (Kaggle / TensorFlow Datasets), ~54 300 images RGB, 38 classes, 14 espèces (pomme, myrtille, cerise, raisin, orange, pêche, poivron, pomme de terre, framboise, soja, courge, fraise, tomate).
- Split : 70 % train / 15 % validation / 15 % test, stratifié par classe.
- Resize à la résolution du modèle de base (ex. 224×224), normalisation selon le modèle de base.
- Augmentation : rotation, flip horizontal, luminosité, zoom léger.
- Analyse du déséquilibre de classes pour ajuster la fonction de perte si besoin.

## 5. Exigences fonctionnelles

- Entrée : image JPEG ou PNG.
- Sortie : classe prédite (espèce + état sanitaire) + score de confiance.
- Top-3 des classes si confiance de la prédiction principale faible (seuil indicatif < 70 %).
- Interface de démo pour traiter une image unique.
- Rapport d'évaluation exportable (métriques + matrice de confusion) après entraînement.

## 6. Exigences techniques (modèle)

- **Architecture** : transfer learning sur modèle pré-entraîné ImageNet (MobileNetV2 ou EfficientNetB0 recommandés), couches convolutives gelées puis fine-tuning partiel des dernières couches.
- **Framework** : TensorFlow / Keras.
- **Fonction de perte** : categorical cross-entropy.
- **Optimiseur** : Adam, taux d'apprentissage adaptatif.
- **Comparatif** : baseline scikit-learn (SVM ou random forest sur features extraites).
- **Environnement** : Python 3.10+, TensorFlow/Keras, scikit-learn ; GPU recommandé ; tracking d'expérimentations (ex. TensorBoard) ; versionnement code + modèles.
- **Performance** : inférence < 1 s/image sur poste standard ; export TensorFlow Lite si besoin mobile ; graines aléatoires fixées, dépendances documentées (reproductibilité).

## 7. Direction artistique et interface graphique

Cinq principes directeurs appliqués systématiquement à chaque page (accueil, démo, résultat) :

1. **Neuropath** — navigation organique, parcours pensé comme un cheminement fluide et connecté (écho au fonctionnement du modèle).
2. **Edge** — approche spatiale : superposition de plans, profondeur, plein cadre, parallaxe léger ; l'image de la feuille est mise en scène comme élément central.
3. **Ultra Design** — rigueur pixel-perfect : grille stricte, échelle typographique, alignement au pixel, cohérence des composants, palette limitée.
4. **Hyperkit** — vitesse absolue : chargement quasi instantané, assets optimisés, retour visuel sans latence perçue.
5. **Motion TM** — motion qui déclenche l'action : animations/micro-vidéos aux moments clés (dépôt image, analyse, révélation diagnostic), avec objectif fonctionnel explicite.

Application par page :

| Page | Principes dominants | Application concrète |
|---|---|---|
| Accueil | Edge, Motion TM | Mise en scène spatiale, séquence vidéo courte vers "Tester une photo" |
| Interface de démo | Neuropath, Hyperkit | Parcours import → analyse → résultat en flux continu, sans latence perçue |
| Résultat / diagnostic | Ultra Design, Motion TM | Présentation pixel-parfaite du score et du top-3, animation de révélation |

Livraison design : maquettes haute fidélité, design system documenté (composants, tokens, typographie, grille), prototype interactif ou HTML/CSS statique, test de performance validant Hyperkit.

## 8. Méthodologie et jalons

| Phase | Contenu | Durée indicative |
|---|---|---|
| 1. Cadrage et préparation des données | Analyse exploratoire, nettoyage, split, pipeline d'augmentation | 1 semaine |
| 2. Baseline | scikit-learn sur features extraites ou petit CNN | 1 semaine |
| 3. Transfer learning | Feature extraction puis fine-tuning | 2 semaines |
| 4. Évaluation | Métriques détaillées, matrice de confusion, analyse d'erreurs | 1 semaine |
| 5. Direction artistique et démonstrateur | Maquettes 5 principes, intégration upload/résultat | 2 semaines |
| 6. Documentation et livraison | Rapport technique, guide d'utilisation, livrables | 1 semaine |

## 9. Livrables

- Code source (pipeline données, entraînement, évaluation).
- Modèle entraîné (SavedModel TensorFlow, export TFLite en option).
- Rapport d'évaluation détaillé.
- Maquettes haute fidélité + design system.
- Interface de démonstration intégrée.
- Documentation technique (architecture, hyperparamètres, réentraînement).

## 10. Critères d'acceptation

- Exactitude globale sur jeu de test ≥ 90 %.
- F1-score macro moyen ≥ 85 %.
- Le modèle surpasse strictement la baseline scikit-learn sur toutes les métriques suivies.
- Classification d'une image en < 3 s de bout en bout (chargement compris).
- Respect du design system Ultra Design sur tous les breakpoints définis.
- Temps de chargement initial < 1,5 s (exigence Hyperkit).
- Documentation permettant un réentraînement sans assistance.

## 11. Risques et limites identifiés

| Risque | Impact | Mitigation |
|---|---|---|
| Images PlantVillage en conditions labo (fond neutre) | Performance surestimée en conditions terrain | Tester sur échantillon "in the wild", documenter l'écart |
| Déséquilibre entre classes | Biais vers classes majoritaires | Pondération de la loss, augmentation ciblée, suivi F1 macro |
| Confusion entre maladies visuellement proches | Erreurs en frontière de classes | Analyse matrice de confusion, top-3 affiché |
| Surapprentissage lors du fine-tuning | Bonne perf train, mauvaise généralisation | Early stopping, dropout, augmentation, suivi validation |
| Ambition visuelle élevée (Ultra Design, Motion TM) | Retard sur la livraison de l'interface | Prioriser pages critiques, limiter animations complexes en 1ère itération |

## 12. Évolutions possibles (hors périmètre initial)

- Extension à de nouvelles espèces/maladies via collecte terrain.
- Déploiement mobile avec capture photo directe et fonctionnement hors connexion.
- Module de recommandation de traitement lié à un expert agronome.
- Détection/localisation de la zone atteinte (segmentation) en complément de la classification.

---
Sources dataset : PlantVillage (Kaggle / TensorFlow Datasets), ~54 300 images, 38 classes, 14 espèces.
