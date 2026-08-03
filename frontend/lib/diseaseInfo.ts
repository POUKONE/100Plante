/**
 * Description informative des 38 classes PlantVillage : cause et symptômes
 * observables. Volontairement PAS de recommandation de traitement — hors
 * périmètre du cahier des charges (section 3.2 : "le système identifie la
 * maladie, il ne prescrit pas de solution"). Clé = `label` brut renvoyé par
 * l'API (voir backend/app/ml/labels.py).
 */
export interface DiseaseInfo {
  cause: string;
  description: string;
}

const DISEASE_INFO: Record<string, DiseaseInfo> = {
  Apple___Apple_scab: {
    cause: "Champignon (Venturia inaequalis)",
    description:
      "Taches olive à brunes sur les feuilles et les fruits, qui peuvent noircir et se craqueler. Favorisée par un printemps humide et frais.",
  },
  Apple___Black_rot: {
    cause: "Champignon (Botryosphaeria obtusa)",
    description:
      "Taches brunes circulaires sur les feuilles (\"frogeye leaf spot\") et pourriture noire concentrique sur les fruits.",
  },
  Apple___Cedar_apple_rust: {
    cause: "Champignon (Gymnosporangium juniperi-virginianae)",
    description:
      "Taches jaune-orangé sur le dessus des feuilles. Le champignon a besoin d'un genévrier à proximité pour compléter son cycle.",
  },
  Cherry___Powdery_mildew: {
    cause: "Champignon (Podosphaera clandestina)",
    description: "Feutrage blanc poudreux sur les jeunes feuilles et pousses, qui peuvent se recroqueviller.",
  },
  "Corn___Cercospora_leaf_spot Gray_leaf_spot": {
    cause: "Champignon (Cercospora zeae-maydis)",
    description:
      "Lésions rectangulaires gris-brun le long des nervures, favorisées par une humidité prolongée.",
  },
  Corn___Common_rust: {
    cause: "Champignon (Puccinia sorghi)",
    description: "Pustules brun-rouille sur les deux faces des feuilles.",
  },
  Corn___Northern_Leaf_Blight: {
    cause: "Champignon (Exserohilum turcicum)",
    description: "Longues lésions elliptiques gris-vert à brun, en forme de cigare, sur les feuilles.",
  },
  Grape___Black_rot: {
    cause: "Champignon (Guignardia bidwellii)",
    description: "Taches brunes circulaires bordées de noir sur les feuilles ; les fruits se momifient et noircissent.",
  },
  "Grape___Esca_(Black_Measles)": {
    cause: "Complexe de champignons (Phaeomoniella, Phaeoacremonium...)",
    description:
      "Décoloration en \"tigrure\" entre les nervures (bandes jaunes ou rouges), pouvant évoluer vers un dessèchement brutal du cep.",
  },
  "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": {
    cause: "Champignon (Pseudocercospora vitis)",
    description: "Taches brun-rougeâtre irrégulières, pouvant fusionner et provoquer une chute prématurée des feuilles.",
  },
  "Orange___Haunglongbing_(Citrus_greening)": {
    cause: "Bactérie, transmise par un insecte piqueur (psylle asiatique des agrumes)",
    description:
      "Feuilles mouchetées de jaune de façon asymétrique, fruits petits et amers, déclin progressif de l'arbre. Maladie grave, sans traitement curatif connu à ce jour.",
  },
  Peach___Bacterial_spot: {
    cause: "Bactérie (Xanthomonas arboricola)",
    description: "Petites taches anguleuses brun-violacé qui peuvent se perforer (\"shot hole\"), et lésions sur les fruits.",
  },
  "Pepper,_bell___Bacterial_spot": {
    cause: "Bactérie (Xanthomonas)",
    description: "Petites taches brunes hydropiques sur les feuilles, pouvant se perforer, et croûtes sur les fruits.",
  },
  Potato___Early_blight: {
    cause: "Champignon (Alternaria solani)",
    description: "Taches brunes à anneaux concentriques (\"en cible\"), débutant sur les feuilles les plus âgées.",
  },
  Potato___Late_blight: {
    cause: "Oomycète (Phytophthora infestans)",
    description:
      "Taches brun-noir à contour flou, feutrage blanchâtre sous la feuille par temps humide. Progression très rapide.",
  },
  Squash___Powdery_mildew: {
    cause: "Champignons (Erysiphe / Podosphaera)",
    description: "Feutrage blanc poudreux sur feuilles et tiges, qui finissent par jaunir et se dessécher.",
  },
  Strawberry___Leaf_scorch: {
    cause: "Champignon (Diplocarpon earlianum)",
    description: "Petites taches pourpres qui fusionnent en larges zones brûlées brun-rougeâtre.",
  },
  Tomato___Bacterial_spot: {
    cause: "Bactérie (Xanthomonas)",
    description:
      "Petites taches brunes anguleuses souvent entourées d'un halo jaune, lésions croûteuses sur les fruits.",
  },
  Tomato___Early_blight: {
    cause: "Champignon (Alternaria solani)",
    description: "Taches brunes à anneaux concentriques, débutant sur les feuilles basses.",
  },
  Tomato___Late_blight: {
    cause: "Oomycète (Phytophthora infestans)",
    description:
      "Grandes taches brun-noir huileuses, feutrage blanc sous la feuille par temps humide. Propagation très rapide en conditions fraîches et humides.",
  },
  Tomato___Leaf_Mold: {
    cause: "Champignon (Passalora fulva)",
    description:
      "Taches jaune pâle sur le dessus des feuilles, feutrage olive-brun caractéristique en dessous. Favorisée par une forte humidité (serre).",
  },
  Tomato___Septoria_leaf_spot: {
    cause: "Champignon (Septoria lycopersici)",
    description: "Nombreuses petites taches circulaires à centre gris clair et bordure sombre, sur les feuilles basses.",
  },
  "Tomato___Spider_mites Two-spotted_spider_mite": {
    cause: "Ravageur — acarien (Tetranychus urticae)",
    description:
      "Piqûres donnant un aspect finement marbré et jaunâtre aux feuilles, fine toile visible en cas de forte infestation. Favorisé par un temps chaud et sec.",
  },
  Tomato___Target_Spot: {
    cause: "Champignon (Corynespora cassiicola)",
    description: "Taches brunes à anneaux concentriques, souvent plus larges qu'une alternariose, centre parfois perforé.",
  },
  Tomato___Tomato_Yellow_Leaf_Curl_Virus: {
    cause: "Virus, transmis par l'aleurode (mouche blanche)",
    description: "Feuilles qui jaunissent, s'enroulent vers le haut et se recroquevillent ; croissance fortement ralentie.",
  },
  Tomato___Tomato_mosaic_virus: {
    cause: "Virus (ToMV), très persistant",
    description: "Mosaïque de vert clair et foncé sur les feuilles, parfois déformées ou filiformes.",
  },
};

/** Renvoie null pour les classes "sain" — aucune information de maladie à afficher. */
export function getDiseaseInfo(label: string): DiseaseInfo | null {
  return DISEASE_INFO[label] ?? null;
}
