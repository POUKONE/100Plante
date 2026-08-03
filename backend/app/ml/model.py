"""Chargement du modèle et inférence.

Tant que `settings.model_path` ne pointe vers aucun modèle entraîné (phases 2/3
du cahier des charges pas encore réalisées), la classe fonctionne en
"mode placeholder" : elle renvoie une distribution de probabilités déterministe
(dérivée d'un hash de l'image, pas aléatoire à chaque appel) sur les 38 classes,
avec la même forme de réponse qu'un vrai modèle. Cela permet de développer et
tester l'API et le frontend en parallèle de l'entraînement, sans jamais laisser
croire à un vrai diagnostic : `is_placeholder=True` est toujours renvoyé au client
tant qu'aucun modèle réel n'est chargé.
"""

import hashlib
import logging
import time

import numpy as np

from app.core.config import Settings
from app.ml.labels import CLASSES, NUM_CLASSES, ClassInfo
from app.ml.preprocess import load_image, to_model_input

logger = logging.getLogger(__name__)


class LeafDiseaseModel:
    def __init__(self, settings: Settings):
        self._settings = settings
        self._keras_model = None
        self.is_placeholder = True

    def load(self) -> None:
        if not self._settings.model_path.exists():
            logger.warning(
                "Aucun modèle entraîné trouvé à %s — l'API démarre en mode placeholder.",
                self._settings.model_path,
            )
            return

        import numpy as np
        import tensorflow as tf  # import différé : coûteux, inutile en mode placeholder

        self._keras_model = tf.keras.models.load_model(self._settings.model_path)
        self.is_placeholder = False
        logger.info("Modèle chargé depuis %s", self._settings.model_path)

        # "Warmup" : le premier appel à predict() déclenche la compilation du graphe
        # TensorFlow (~2s). On paie ce coût ici, au démarrage du serveur, plutôt que
        # de le faire subir au premier utilisateur (cible < 1s, section 6.3).
        dummy_input = np.zeros((1, *self._settings.image_size, 3), dtype="float32")
        self._keras_model.predict(dummy_input, verbose=0)
        logger.info("Warmup du modèle effectué")

    def predict(self, raw_bytes: bytes) -> tuple[list[tuple[ClassInfo, float]], float]:
        start = time.perf_counter()
        image = load_image(raw_bytes)
        batch = to_model_input(image, self._settings.image_size)

        if self.is_placeholder:
            probabilities = self._placeholder_probabilities(raw_bytes)
        else:
            probabilities = self._keras_model.predict(batch, verbose=0)[0]

        ranked_indices = np.argsort(probabilities)[::-1]
        ranked = [(CLASSES[i], float(probabilities[i])) for i in ranked_indices]

        inference_time_ms = (time.perf_counter() - start) * 1000
        return ranked, inference_time_ms

    @staticmethod
    def _placeholder_probabilities(raw_bytes: bytes) -> np.ndarray:
        """Distribution déterministe (même image -> même résultat), sans réseau de neurones."""
        seed = int(hashlib.sha256(raw_bytes).hexdigest(), 16) % (2**32)
        rng = np.random.default_rng(seed)
        logits = rng.normal(loc=0.0, scale=1.0, size=NUM_CLASSES)
        temperature = 0.35  # < 1 accentue l'écart entre classes, pour imiter une vraie prédiction
        exp = np.exp((logits - logits.max()) / temperature)
        return exp / exp.sum()
