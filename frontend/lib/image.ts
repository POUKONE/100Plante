/**
 * Redimensionne une image côté client et la renvoie en data URL JPEG.
 * Utilisé pour l'aperçu et pour la faire transiter entre /demo et /resultat via
 * sessionStorage — l'original (potentiellement plusieurs Mo pour une photo prise
 * à l'appareil photo) dépasserait vite le quota de sessionStorage.
 */
export function downscaleImage(file: File, maxDim = 900): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Canvas 2D non disponible"));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Impossible de lire l'image"));
    };

    img.src = objectUrl;
  });
}
