/**
 * Fiabilité réelle du modèle par classe, mesurée sur le jeu de test (8 179
 * photos jamais vues à l'entraînement — voir backend/reports/evaluation_report.md
 * et classification_report_transfer_learning.txt, phase 4 du cahier des charges).
 *
 * Sert à rendre le diagnostic interprétable par quelqu'un qui ne connaît pas le
 * machine learning : au lieu d'un score de confiance brut sur CETTE photo, on
 * donne aussi la fiabilité mesurée du système sur CETTE classe en général, et on
 * signale explicitement les confusions connues (issues de la matrice de
 * confusion réelle) plutôt que de laisser un pourcentage secondaire inexpliqué.
 */

const TEST_SET_SIZE = 8179;

interface ClassMetrics {
  precision: number;
  recall: number;
  f1: number;
}

// precision/recall/f1 = résultats réels de scripts/evaluate.py (phase 4).
const METRICS: Record<string, ClassMetrics> = {
  Apple___Apple_scab: { precision: 0.92, recall: 0.99, f1: 0.95 },
  Apple___Black_rot: { precision: 0.97, recall: 1.0, f1: 0.98 },
  Apple___Cedar_apple_rust: { precision: 1.0, recall: 0.98, f1: 0.99 },
  Apple___healthy: { precision: 1.0, recall: 1.0, f1: 1.0 },
  Blueberry___healthy: { precision: 1.0, recall: 1.0, f1: 1.0 },
  Cherry___Powdery_mildew: { precision: 1.0, recall: 0.97, f1: 0.99 },
  Cherry___healthy: { precision: 1.0, recall: 0.99, f1: 1.0 },
  "Corn___Cercospora_leaf_spot Gray_leaf_spot": { precision: 0.82, recall: 0.83, f1: 0.83 },
  Corn___Common_rust: { precision: 0.98, recall: 0.98, f1: 0.98 },
  Corn___Northern_Leaf_Blight: { precision: 0.91, recall: 0.92, f1: 0.91 },
  Corn___healthy: { precision: 0.99, recall: 1.0, f1: 1.0 },
  Grape___Black_rot: { precision: 0.98, recall: 0.97, f1: 0.97 },
  "Grape___Esca_(Black_Measles)": { precision: 0.97, recall: 0.99, f1: 0.98 },
  "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": { precision: 0.98, recall: 1.0, f1: 0.99 },
  Grape___healthy: { precision: 1.0, recall: 1.0, f1: 1.0 },
  "Orange___Haunglongbing_(Citrus_greening)": { precision: 1.0, recall: 1.0, f1: 1.0 },
  Peach___Bacterial_spot: { precision: 1.0, recall: 0.99, f1: 0.99 },
  Peach___healthy: { precision: 1.0, recall: 1.0, f1: 1.0 },
  "Pepper,_bell___Bacterial_spot": { precision: 0.99, recall: 0.97, f1: 0.98 },
  "Pepper,_bell___healthy": { precision: 0.96, recall: 0.99, f1: 0.98 },
  Potato___Early_blight: { precision: 0.98, recall: 0.99, f1: 0.98 },
  Potato___Late_blight: { precision: 0.96, recall: 0.92, f1: 0.94 },
  Potato___healthy: { precision: 0.81, recall: 0.92, f1: 0.86 },
  Raspberry___healthy: { precision: 0.98, recall: 1.0, f1: 0.99 },
  Soybean___healthy: { precision: 0.99, recall: 0.99, f1: 0.99 },
  Squash___Powdery_mildew: { precision: 0.99, recall: 1.0, f1: 1.0 },
  Strawberry___Leaf_scorch: { precision: 1.0, recall: 0.99, f1: 0.99 },
  Strawberry___healthy: { precision: 1.0, recall: 1.0, f1: 1.0 },
  Tomato___Bacterial_spot: { precision: 0.9, recall: 0.96, f1: 0.93 },
  Tomato___Early_blight: { precision: 0.92, recall: 0.73, f1: 0.81 },
  Tomato___Late_blight: { precision: 0.96, recall: 0.92, f1: 0.94 },
  Tomato___Leaf_Mold: { precision: 0.9, recall: 0.95, f1: 0.93 },
  Tomato___Septoria_leaf_spot: { precision: 0.94, recall: 0.92, f1: 0.93 },
  "Tomato___Spider_mites Two-spotted_spider_mite": { precision: 0.92, recall: 0.81, f1: 0.86 },
  Tomato___Target_Spot: { precision: 0.76, recall: 0.9, f1: 0.82 },
  Tomato___Tomato_Yellow_Leaf_Curl_Virus: { precision: 1.0, recall: 0.97, f1: 0.98 },
  Tomato___Tomato_mosaic_virus: { precision: 0.98, recall: 0.89, f1: 0.94 },
  Tomato___healthy: { precision: 0.87, recall: 0.99, f1: 0.93 },
};

// Paires de classes que le modèle confond le plus souvent (hors diagonale de la
// matrice de confusion réelle, cf. evaluation_report.md — "Top confusions").
const CONFUSIONS: Record<string, string[]> = {
  "Tomato___Spider_mites Two-spotted_spider_mite": ["Tomato___Target_Spot", "Tomato___healthy"],
  Tomato___Target_Spot: [
    "Tomato___Spider_mites Two-spotted_spider_mite",
    "Tomato___Early_blight",
    "Tomato___healthy",
    "Tomato___Bacterial_spot",
    "Tomato___Septoria_leaf_spot",
  ],
  Tomato___healthy: ["Tomato___Spider_mites Two-spotted_spider_mite", "Tomato___Target_Spot"],
  Tomato___Early_blight: ["Tomato___Target_Spot", "Tomato___Septoria_leaf_spot"],
  "Corn___Cercospora_leaf_spot Gray_leaf_spot": ["Corn___Northern_Leaf_Blight"],
  Corn___Northern_Leaf_Blight: ["Corn___Cercospora_leaf_spot Gray_leaf_spot"],
  Tomato___Tomato_Yellow_Leaf_Curl_Virus: ["Tomato___Bacterial_spot"],
  Tomato___Bacterial_spot: ["Tomato___Tomato_Yellow_Leaf_Curl_Virus", "Tomato___Septoria_leaf_spot", "Tomato___Target_Spot"],
  Tomato___Septoria_leaf_spot: ["Tomato___Bacterial_spot", "Tomato___Early_blight", "Tomato___Target_Spot"],
  Grape___Black_rot: ["Grape___Esca_(Black_Measles)"],
  "Grape___Esca_(Black_Measles)": ["Grape___Black_rot"],
  Potato___Late_blight: ["Potato___healthy", "Tomato___Late_blight"],
  Potato___healthy: ["Potato___Late_blight"],
  Tomato___Late_blight: ["Potato___Late_blight"],
};

export type ReliabilityTier = "excellente" | "bonne" | "moyenne";

export interface ModelReliability {
  precision: number;
  recall: number;
  f1: number;
  tier: ReliabilityTier;
  testSetSize: number;
}

function tierFor(precision: number): ReliabilityTier {
  if (precision >= 0.97) return "excellente";
  if (precision >= 0.9) return "bonne";
  return "moyenne";
}

export function getModelReliability(label: string): ModelReliability | null {
  const metrics = METRICS[label];
  if (!metrics) return null;
  return { ...metrics, tier: tierFor(metrics.precision), testSetSize: TEST_SET_SIZE };
}

/** Parmi les labels donnés (typiquement le top-3), lesquels sont des confusions connues de `label`. */
export function getKnownConfusionsAmong(label: string, candidateLabels: string[]): string[] {
  const known = CONFUSIONS[label] ?? [];
  return candidateLabels.filter((c) => c !== label && known.includes(c));
}
