/**
 * Description informative des classes "maladie" de PlantVillage : agent
 * pathogène, symptômes observables et mode de propagation. Volontairement PAS
 * de recommandation de traitement — hors périmètre du cahier des charges
 * (section 3.2 : "le système identifie la maladie, il ne prescrit pas de
 * solution"). Clé = `label` brut renvoyé par l'API (voir backend/app/ml/labels.py).
 */
export interface DiseaseInfo {
  cause: string;
  symptoms: string;
  spread: string;
}

const DISEASE_INFO: Record<string, DiseaseInfo> = {
  Apple___Apple_scab: {
    cause: "Champignon (Venturia inaequalis)",
    symptoms: "Taches olive à brunes sur les feuilles et les fruits, qui peuvent noircir et se craqueler.",
    spread:
      "Le champignon hiverne dans les feuilles mortes tombées au sol et libère ses spores au printemps. Se propage par la pluie et le vent, favorisé par un temps humide et frais.",
  },
  Apple___Black_rot: {
    cause: "Champignon (Botryosphaeria obtusa)",
    symptoms: "Taches brunes circulaires sur les feuilles (\"frogeye leaf spot\") et pourriture noire concentrique sur les fruits.",
    spread:
      "Hiverne dans le bois mort et les fruits momifiés restés sur l'arbre ou au sol. Se propage par les éclaboussures de pluie au printemps.",
  },
  Apple___Cedar_apple_rust: {
    cause: "Champignon (Gymnosporangium juniperi-virginianae)",
    symptoms: "Taches jaune-orangé sur le dessus des feuilles.",
    spread:
      "A besoin de deux hôtes pour boucler son cycle : le pommier et un genévrier à proximité. Les spores voyagent sur plusieurs centaines de mètres portées par le vent.",
  },
  Cherry___Powdery_mildew: {
    cause: "Champignon (Podosphaera clandestina)",
    symptoms: "Feutrage blanc poudreux sur les jeunes feuilles et pousses, qui peuvent se recroqueviller.",
    spread: "Spores portées par le vent. Contrairement à beaucoup de champignons, se développe par temps sec et doux, sans pluie directe.",
  },
  "Corn___Cercospora_leaf_spot Gray_leaf_spot": {
    cause: "Champignon (Cercospora zeae-maydis)",
    symptoms: "Lésions rectangulaires gris-brun le long des nervures.",
    spread: "Hiverne dans les résidus de maïs laissés au sol. Favorisé par une humidité prolongée et des températures chaudes.",
  },
  Corn___Common_rust: {
    cause: "Champignon (Puccinia sorghi)",
    symptoms: "Pustules brun-rouille sur les deux faces des feuilles.",
    spread: "Spores transportées sur de longues distances par le vent, souvent depuis des régions plus chaudes.",
  },
  Corn___Northern_Leaf_Blight: {
    cause: "Champignon (Exserohilum turcicum)",
    symptoms: "Longues lésions elliptiques gris-vert à brun, en forme de cigare.",
    spread: "Hiverne dans les résidus de culture. Se propage par la pluie et le vent en conditions humides et modérément fraîches.",
  },
  Grape___Black_rot: {
    cause: "Champignon (Guignardia bidwellii)",
    symptoms: "Taches brunes circulaires bordées de noir sur les feuilles ; les fruits se momifient et noircissent.",
    spread: "Hiverne dans les fruits momifiés et les sarments. Se propage par les éclaboussures de pluie au printemps.",
  },
  "Grape___Esca_(Black_Measles)": {
    cause: "Complexe de champignons (Phaeomoniella, Phaeoacremonium...)",
    symptoms: "Décoloration en \"tigrure\" entre les nervures (bandes jaunes ou rouges), pouvant évoluer vers un dessèchement brutal du cep.",
    spread: "Infection par des champignons du bois via des plaies de taille. Les symptômes peuvent n'apparaître que des années après l'infection.",
  },
  "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": {
    cause: "Champignon (Pseudocercospora vitis)",
    symptoms: "Taches brun-rougeâtre irrégulières, pouvant fusionner et provoquer une chute prématurée des feuilles.",
    spread: "Favorisé par une humidité élevée et des températures chaudes. Se propage par éclaboussures d'eau.",
  },
  "Orange___Haunglongbing_(Citrus_greening)": {
    cause: "Bactérie (Candidatus Liberibacter)",
    symptoms: "Feuilles mouchetées de jaune de façon asymétrique, fruits petits et amers, déclin progressif de l'arbre.",
    spread:
      "Transmise exclusivement par un insecte piqueur, le psylle asiatique des agrumes — pas de transmission directe d'arbre à arbre sans ce vecteur. Maladie grave, sans traitement curatif connu à ce jour.",
  },
  Peach___Bacterial_spot: {
    cause: "Bactérie (Xanthomonas arboricola)",
    symptoms: "Petites taches anguleuses brun-violacé qui peuvent se perforer (\"shot hole\"), et lésions sur les fruits.",
    spread: "Se propage par la pluie battante et par les blessures (vent, grêle, insectes). Favorisée par un temps chaud et humide.",
  },
  "Pepper,_bell___Bacterial_spot": {
    cause: "Bactérie (Xanthomonas)",
    symptoms: "Petites taches brunes hydropiques sur les feuilles, pouvant se perforer, et croûtes sur les fruits.",
    spread: "Se transmet par les éclaboussures d'eau et les outils ; peut aussi être présente sur les semences dès le départ.",
  },
  Potato___Early_blight: {
    cause: "Champignon (Alternaria solani)",
    symptoms: "Taches brunes à anneaux concentriques (\"en cible\"), débutant sur les feuilles les plus âgées.",
    spread: "Hiverne dans les débris végétaux et le sol. Favorisé par l'alternance de périodes humides et chaudes.",
  },
  Potato___Late_blight: {
    cause: "Oomycète (Phytophthora infestans)",
    symptoms: "Taches brun-noir à contour flou, feutrage blanchâtre sous la feuille par temps humide.",
    spread:
      "Extrêmement contagieux : se propage en quelques jours par temps frais et humide, spores portées par le vent sur plusieurs kilomètres. Le même pathogène touche aussi la tomate.",
  },
  Squash___Powdery_mildew: {
    cause: "Champignons (Erysiphe / Podosphaera)",
    symptoms: "Feutrage blanc poudreux sur feuilles et tiges, qui finissent par jaunir et se dessécher.",
    spread: "Spores portées par le vent. Se développe même par temps sec, contrairement à la plupart des maladies fongiques.",
  },
  Strawberry___Leaf_scorch: {
    cause: "Champignon (Diplocarpon earlianum)",
    symptoms: "Petites taches pourpres qui fusionnent en larges zones brûlées brun-rougeâtre.",
    spread: "Hiverne sur les feuilles infectées restées en place. Favorisé par un temps humide et un feuillage dense mal aéré.",
  },
  Tomato___Bacterial_spot: {
    cause: "Bactérie (Xanthomonas)",
    symptoms: "Petites taches brunes anguleuses souvent entourées d'un halo jaune, lésions croûteuses sur les fruits.",
    spread: "Se transmet par la pluie, les outils, et peut provenir de semences contaminées dès le départ.",
  },
  Tomato___Early_blight: {
    cause: "Champignon (Alternaria solani)",
    symptoms: "Taches brunes à anneaux concentriques, débutant sur les feuilles basses.",
    spread: "Hiverne dans les débris végétaux et le sol. Favorisé par l'alternance de périodes chaudes et humides.",
  },
  Tomato___Late_blight: {
    cause: "Oomycète (Phytophthora infestans)",
    symptoms: "Grandes taches brun-noir huileuses, feutrage blanc sous la feuille par temps humide.",
    spread:
      "Très contagieux, se propage rapidement par temps frais et humide. Le même pathogène touche la pomme de terre : une parcelle voisine infectée est un risque direct.",
  },
  Tomato___Leaf_Mold: {
    cause: "Champignon (Passalora fulva)",
    symptoms: "Taches jaune pâle sur le dessus des feuilles, feutrage olive-brun caractéristique en dessous.",
    spread: "Favorisé par une forte humidité stagnante ; particulièrement fréquent sous serre ou tunnel mal ventilé.",
  },
  Tomato___Septoria_leaf_spot: {
    cause: "Champignon (Septoria lycopersici)",
    symptoms: "Nombreuses petites taches circulaires à centre gris clair et bordure sombre, sur les feuilles basses.",
    spread: "Hiverne dans les débris de culture au sol. Se propage par éclaboussures d'eau, débute toujours par le bas de la plante.",
  },
  "Tomato___Spider_mites Two-spotted_spider_mite": {
    cause: "Ravageur — acarien (Tetranychus urticae)",
    symptoms: "Piqûres donnant un aspect finement marbré et jaunâtre aux feuilles, fine toile visible en cas de forte infestation.",
    spread: "Ce n'est pas une infection mais un ravageur : il prolifère par temps chaud et sec, et se déplace par le vent et le contact entre plants.",
  },
  Tomato___Target_Spot: {
    cause: "Champignon (Corynespora cassiicola)",
    symptoms: "Taches brunes à anneaux concentriques, souvent plus larges qu'une alternariose, centre parfois perforé.",
    spread: "Hiverne dans les débris végétaux. Favorisé par une humidité élevée prolongée.",
  },
  Tomato___Tomato_Yellow_Leaf_Curl_Virus: {
    cause: "Virus (TYLCV)",
    symptoms: "Feuilles qui jaunissent, s'enroulent vers le haut et se recroquevillent ; croissance fortement ralentie.",
    spread:
      "Transmis exclusivement par un insecte piqueur, l'aleurode (mouche blanche) — pas de transmission directe de plante à plante sans ce vecteur.",
  },
  Tomato___Tomato_mosaic_virus: {
    cause: "Virus (ToMV)",
    symptoms: "Mosaïque de vert clair et foncé sur les feuilles, parfois déformées ou filiformes.",
    spread: "Extrêmement persistant et contagieux par simple contact (mains, outils, vêtements) ; peut survivre longtemps sur les surfaces.",
  },
};

/** Renvoie null pour les classes "sain" — aucune information de maladie à afficher. */
export function getDiseaseInfo(label: string): DiseaseInfo | null {
  return DISEASE_INFO[label] ?? null;
}
