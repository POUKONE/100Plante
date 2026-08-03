"""Les 38 classes du dataset PlantVillage (14 espèces), dans l'ordre alphabétique
standard utilisé par la plupart des exports PlantVillage (Kaggle / TF Datasets).

Cet ordre DOIT correspondre exactement à l'ordre des classes vu par le modèle
pendant l'entraînement (celui produit par `tf.keras.utils.image_dataset_from_directory`
sur les dossiers triés alphabétiquement). Si l'ordre d'entraînement diffère,
ce fichier doit être régénéré à partir de `class_names` du dataset d'entraînement.
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class ClassInfo:
    label: str  # identifiant brut, ex. "Apple___Apple_scab"
    species: str  # ex. "Apple"
    condition: str  # ex. "Apple scab" ou "healthy"


def _parse(raw_label: str) -> ClassInfo:
    species_raw, condition_raw = raw_label.split("___")
    species = species_raw.replace("_", " ").strip()
    condition = condition_raw.replace("_", " ").strip()
    return ClassInfo(label=raw_label, species=species, condition=condition)


_RAW_LABELS: tuple[str, ...] = (
    "Apple___Apple_scab",
    "Apple___Black_rot",
    "Apple___Cedar_apple_rust",
    "Apple___healthy",
    "Blueberry___healthy",
    "Cherry___Powdery_mildew",
    "Cherry___healthy",
    "Corn___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn___Common_rust",
    "Corn___Northern_Leaf_Blight",
    "Corn___healthy",
    "Grape___Black_rot",
    "Grape___Esca_(Black_Measles)",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    "Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)",
    "Peach___Bacterial_spot",
    "Peach___healthy",
    "Pepper,_bell___Bacterial_spot",
    "Pepper,_bell___healthy",
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",
    "Raspberry___healthy",
    "Soybean___healthy",
    "Squash___Powdery_mildew",
    "Strawberry___Leaf_scorch",
    "Strawberry___healthy",
    "Tomato___Bacterial_spot",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite",
    "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy",
)

CLASSES: tuple[ClassInfo, ...] = tuple(_parse(label) for label in _RAW_LABELS)

NUM_CLASSES = len(CLASSES)

assert NUM_CLASSES == 38, f"Attendu 38 classes PlantVillage, obtenu {NUM_CLASSES}"
assert len({c.species for c in CLASSES}) == 14, "Attendu 14 espèces distinctes"
