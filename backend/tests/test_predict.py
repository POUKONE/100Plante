import io

import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.main import app


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


def _fake_leaf_jpeg() -> bytes:
    image = Image.new("RGB", (300, 300), color=(34, 139, 34))
    buffer = io.BytesIO()
    image.save(buffer, format="JPEG")
    return buffer.getvalue()


def test_health_reports_consistent_model_state(client):
    # Volontairement pas d'assertion sur la valeur de is_placeholder : ce test doit
    # passer aussi bien sur un checkout sans modèle entraîné (mode placeholder) que
    # sur une machine où scripts/train_transfer_learning.py a déjà tourné.
    response = client.get("/api/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["num_classes"] == 38
    assert body["model_loaded"] is (not body["is_placeholder"])


def test_predict_returns_top_k_consistent_with_health(client):
    is_placeholder = client.get("/api/health").json()["is_placeholder"]

    files = {"file": ("leaf.jpg", _fake_leaf_jpeg(), "image/jpeg")}
    response = client.post("/api/predict", files=files)
    assert response.status_code == 200
    body = response.json()

    assert body["is_placeholder"] == is_placeholder
    assert len(body["top_k"]) == 3
    assert body["predicted"]["label"] == body["top_k"][0]["label"]
    # Le top-3 doit être trié par confiance décroissante.
    confidences = [c["confidence"] for c in body["top_k"]]
    assert confidences == sorted(confidences, reverse=True)
    assert all(0.0 <= c <= 1.0 for c in confidences)


def test_predict_same_image_gives_same_result(client):
    files = {"file": ("leaf.jpg", _fake_leaf_jpeg(), "image/jpeg")}
    first = client.post("/api/predict", files=files).json()
    second = client.post("/api/predict", files=files).json()
    assert first["predicted"]["label"] == second["predicted"]["label"]
    assert first["predicted"]["confidence"] == second["predicted"]["confidence"]


def test_predict_rejects_unsupported_content_type(client):
    files = {"file": ("leaf.txt", b"not an image", "text/plain")}
    response = client.post("/api/predict", files=files)
    assert response.status_code == 415


def test_predict_rejects_corrupt_image(client):
    files = {"file": ("leaf.jpg", b"\xff\xd8\xff\x00garbage", "image/jpeg")}
    response = client.post("/api/predict", files=files)
    assert response.status_code == 400
