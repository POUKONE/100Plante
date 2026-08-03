import { useRef, useSyncExternalStore } from "react";
import type { PredictionResponse } from "./api";

const KEY = "leaf-disease-detection:last-result";

export interface StoredResult {
  imageDataUrl: string;
  prediction: PredictionResponse;
}

export function saveResult(result: StoredResult) {
  sessionStorage.setItem(KEY, JSON.stringify(result));
}

export function loadResult(): StoredResult | null {
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredResult;
  } catch {
    return null;
  }
}

export function clearResult() {
  sessionStorage.removeItem(KEY);
}

function subscribeNoop() {
  return () => {};
}

function getServerSnapshot() {
  return undefined;
}

/**
 * Lit le résultat stocké côté client uniquement (sessionStorage n'existe pas
 * côté serveur). Utilise useSyncExternalStore — pas un effect + setState —
 * pour éviter tout flash de contenu ou avertissement d'hydratation : c'est le
 * mécanisme recommandé par React pour lire une source externe au montage.
 * La valeur est mise en cache par instance (le composant est remonté à chaque
 * navigation vers /resultat, donc une nouvelle lecture a bien lieu à chaque visite).
 */
export function useStoredResult(): StoredResult | null | undefined {
  const cache = useRef<{ value: StoredResult | null } | null>(null);
  return useSyncExternalStore(
    subscribeNoop,
    () => {
      if (cache.current === null) {
        cache.current = { value: loadResult() };
      }
      return cache.current.value;
    },
    getServerSnapshot
  );
}
