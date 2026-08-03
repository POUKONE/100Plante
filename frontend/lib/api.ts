export interface ClassPrediction {
  label: string;
  species: string;
  condition: string;
  confidence: number;
}

export interface PredictionResponse {
  predicted: ClassPrediction;
  top_k: ClassPrediction[];
  low_confidence: boolean;
  inference_time_ms: number;
  is_placeholder: boolean;
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function predictImage(file: File): Promise<PredictionResponse> {
  const formData = new FormData();
  formData.append("file", file);

  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/predict`, {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new ApiError(0, "Impossible de joindre le serveur d'analyse. Vérifiez qu'il est démarré.");
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(response.status, body?.detail ?? "Erreur inattendue lors de l'analyse.");
  }

  return response.json();
}
