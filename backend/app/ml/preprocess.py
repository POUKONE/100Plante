"""Prétraitement d'image partagé entre l'entraînement (scripts/) et l'inférence (API).

Garder ce module identique des deux côtés est important : un écart de resize
ou de normalisation entre entraînement et inférence dégrade silencieusement
la précision du modèle en production.
"""

import io

import numpy as np
from PIL import Image, UnidentifiedImageError


class InvalidImageError(ValueError):
    """Levée quand les octets reçus ne forment pas une image décodable."""


def load_image(raw_bytes: bytes) -> Image.Image:
    try:
        image = Image.open(io.BytesIO(raw_bytes))
        image.load()
    except (UnidentifiedImageError, OSError) as exc:
        raise InvalidImageError("Impossible de décoder l'image envoyée") from exc
    return image.convert("RGB")


def to_model_input(image: Image.Image, target_size: tuple[int, int]) -> np.ndarray:
    """Redimensionne une image PIL en batch de taille (1, H, W, 3), pixels en [0, 255].

    PAS de normalisation ici : le modèle entraîné (voir scripts/train_transfer_learning.py)
    embarque sa propre couche `Rescaling` en première couche, pour rester l'unique source
    de vérité sur la normalisation attendue (`image_dataset_from_directory`, utilisé à
    l'entraînement, produit aussi des pixels bruts en [0, 255]). Normaliser une deuxième
    fois ici appliquerait la transformation deux fois et corromprait silencieusement les
    prédictions — c'est exactement le bug qui a été détecté et corrigé ici.
    """
    resized = image.resize(target_size, Image.Resampling.BILINEAR)
    array = np.asarray(resized, dtype=np.float32)
    return np.expand_dims(array, axis=0)
