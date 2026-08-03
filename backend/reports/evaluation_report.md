# Rapport d'évaluation — Leaf Disease Detection

Jeu de test : 8179 images, 38 classes (jamais vues pendant l'entraînement).

## Critères d'acceptation (cahier des charges, section 10)

| Critère | Statut | Détail |
|---|---|---|
| Accuracy test >= 90% | PASS | 0.9647 |
| F1 macro test >= 85% | PASS | 0.9566 |
| Bat strictement la baseline (accuracy ET F1 macro) | PASS | TL 0.9647/0.9566 vs baseline 0.8095/0.7358 |

## Comparaison transfer learning vs baseline (jeu de test)

| Modèle | Accuracy | F1 macro |
|---|---|---|
| Transfer learning (MobileNetV2) | 0.9647 | 0.9566 |
| Baseline (Random Forest) | 0.8095 | 0.7358 |

## Top confusions (hors diagonale)

| Classe réelle | Prédite à tort comme | Nombre de cas |
|---|---|---|
| Tomato___Spider_mites Two-spotted_spider_mite | Tomato___Target_Spot | 23 |
| Tomato___Spider_mites Two-spotted_spider_mite | Tomato___healthy | 19 |
| Tomato___Early_blight | Tomato___Target_Spot | 16 |
| Corn___Cercospora_leaf_spot Gray_leaf_spot | Corn___Northern_Leaf_Blight | 13 |
| Tomato___Tomato_Yellow_Leaf_Curl_Virus | Tomato___Bacterial_spot | 13 |
| Corn___Northern_Leaf_Blight | Corn___Cercospora_leaf_spot Gray_leaf_spot | 10 |
| Tomato___Target_Spot | Tomato___healthy | 8 |
| Tomato___Septoria_leaf_spot | Tomato___Bacterial_spot | 7 |
| Grape___Black_rot | Grape___Esca_(Black_Measles) | 6 |
| Tomato___Early_blight | Tomato___Septoria_leaf_spot | 6 |
| Tomato___Target_Spot | Tomato___Bacterial_spot | 6 |
| Potato___Late_blight | Potato___healthy | 5 |
| Tomato___Bacterial_spot | Tomato___Septoria_leaf_spot | 5 |
| Tomato___Septoria_leaf_spot | Tomato___Target_Spot | 5 |
| Potato___Late_blight | Tomato___Late_blight | 4 |

## Détail par classe

Voir `classification_report_transfer_learning.txt` (precision/recall/F1 par classe).

## Matrice de confusion

Voir `confusion_matrix.png` (axes en index de classe) et `confusion_matrix.csv` (mapping index -> classe dans app/ml/labels.py, ordre alphabétique).