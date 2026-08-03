FROM python:3.11-slim

WORKDIR /app

# libgomp1 : requis par TensorFlow au runtime (calcul multi-thread)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY models/leaf_disease_model.keras ./models/leaf_disease_model.keras

EXPOSE 8000

# Render (et la plupart des PaaS) injectent PORT dynamiquement ; 8000 en repli
# pour un lancement local via `docker run`.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
