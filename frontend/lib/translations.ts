/**
 * Traduction des 38 classes PlantVillage (labels anglais renvoyés par l'API)
 * vers un affichage français. Clé = `label` brut (ex. "Apple___Apple_scab"),
 * stable côté API (voir backend/app/ml/labels.py).
 */
interface Translation {
  species: string;
  condition: string;
  healthy: boolean;
}

const TRANSLATIONS: Record<string, Translation> = {
  Apple___Apple_scab: { species: "Pommier", condition: "Tavelure", healthy: false },
  Apple___Black_rot: { species: "Pommier", condition: "Pourriture noire", healthy: false },
  Apple___Cedar_apple_rust: { species: "Pommier", condition: "Rouille grillagée", healthy: false },
  Apple___healthy: { species: "Pommier", condition: "Saine", healthy: true },
  Blueberry___healthy: { species: "Myrtillier", condition: "Saine", healthy: true },
  Cherry___Powdery_mildew: { species: "Cerisier", condition: "Oïdium", healthy: false },
  Cherry___healthy: { species: "Cerisier", condition: "Saine", healthy: true },
  "Corn___Cercospora_leaf_spot Gray_leaf_spot": { species: "Maïs", condition: "Cercosporiose", healthy: false },
  Corn___Common_rust: { species: "Maïs", condition: "Rouille commune", healthy: false },
  Corn___Northern_Leaf_Blight: { species: "Maïs", condition: "Helminthosporiose", healthy: false },
  Corn___healthy: { species: "Maïs", condition: "Sain", healthy: true },
  Grape___Black_rot: { species: "Vigne", condition: "Black rot", healthy: false },
  "Grape___Esca_(Black_Measles)": { species: "Vigne", condition: "Esca", healthy: false },
  "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": { species: "Vigne", condition: "Brûlure des feuilles", healthy: false },
  Grape___healthy: { species: "Vigne", condition: "Saine", healthy: true },
  "Orange___Haunglongbing_(Citrus_greening)": { species: "Oranger", condition: "Huanglongbing", healthy: false },
  Peach___Bacterial_spot: { species: "Pêcher", condition: "Tache bactérienne", healthy: false },
  Peach___healthy: { species: "Pêcher", condition: "Sain", healthy: true },
  "Pepper,_bell___Bacterial_spot": { species: "Poivron", condition: "Tache bactérienne", healthy: false },
  "Pepper,_bell___healthy": { species: "Poivron", condition: "Sain", healthy: true },
  Potato___Early_blight: { species: "Pomme de terre", condition: "Alternariose", healthy: false },
  Potato___Late_blight: { species: "Pomme de terre", condition: "Mildiou", healthy: false },
  Potato___healthy: { species: "Pomme de terre", condition: "Saine", healthy: true },
  Raspberry___healthy: { species: "Framboisier", condition: "Sain", healthy: true },
  Soybean___healthy: { species: "Soja", condition: "Sain", healthy: true },
  Squash___Powdery_mildew: { species: "Courge", condition: "Oïdium", healthy: false },
  Strawberry___Leaf_scorch: { species: "Fraisier", condition: "Brûlure des feuilles", healthy: false },
  Strawberry___healthy: { species: "Fraisier", condition: "Sain", healthy: true },
  Tomato___Bacterial_spot: { species: "Tomate", condition: "Tache bactérienne", healthy: false },
  Tomato___Early_blight: { species: "Tomate", condition: "Alternariose", healthy: false },
  Tomato___Late_blight: { species: "Tomate", condition: "Mildiou", healthy: false },
  Tomato___Leaf_Mold: { species: "Tomate", condition: "Moisissure foliaire", healthy: false },
  Tomato___Septoria_leaf_spot: { species: "Tomate", condition: "Septoriose", healthy: false },
  "Tomato___Spider_mites Two-spotted_spider_mite": { species: "Tomate", condition: "Acariens (tétranyque)", healthy: false },
  Tomato___Target_Spot: { species: "Tomate", condition: "Tache cible", healthy: false },
  Tomato___Tomato_Yellow_Leaf_Curl_Virus: { species: "Tomate", condition: "Virus des feuilles jaunes en cuillère", healthy: false },
  Tomato___Tomato_mosaic_virus: { species: "Tomate", condition: "Virus de la mosaïque", healthy: false },
  Tomato___healthy: { species: "Tomate", condition: "Saine", healthy: true },
};

export function translateLabel(label: string, fallbackSpecies: string, fallbackCondition: string): Translation {
  return (
    TRANSLATIONS[label] ?? {
      species: fallbackSpecies,
      condition: fallbackCondition,
      healthy: fallbackCondition.toLowerCase() === "healthy",
    }
  );
}
