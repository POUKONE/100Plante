"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import BrandMark from "@/components/BrandMark";
import NeuropathTrail from "@/components/NeuropathTrail";
import { predictImage, ApiError, type PredictionResponse } from "@/lib/api";
import { downscaleImage } from "@/lib/image";
import { saveResult } from "@/lib/resultStore";
import styles from "./page.module.css";

type Stage = "import" | "analyzing" | "done" | "error";

const ANALYSIS_MESSAGES = ["Lecture de l'image…", "Extraction des caractéristiques…", "Classification en cours…"];

const EXAMPLES = [
  { src: "/samples/tomato-healthy.jpg", alt: "Exemple : feuille de tomate" },
  { src: "/samples/potato-early-blight.jpg", alt: "Exemple : feuille de pomme de terre" },
];

async function urlToFile(url: string, filename: string): Promise<File> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type });
}

export default function DemoPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("import");
  const [dragActive, setDragActive] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [errorText, setErrorText] = useState("");
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const messageTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (messageTimerRef.current) clearInterval(messageTimerRef.current);
    };
  }, []);

  const handleFile = useCallback(async (file: File) => {
    setStage("analyzing");
    setMessageIndex(0);
    setElapsedMs(0);

    const start = performance.now();
    timerRef.current = setInterval(() => setElapsedMs(performance.now() - start), 30);
    messageTimerRef.current = setInterval(() => {
      setMessageIndex((i) => (i + 1) % ANALYSIS_MESSAGES.length);
    }, 380);

    try {
      const [imageDataUrl, result] = await Promise.all([downscaleImage(file), predictImage(file)]);

      if (timerRef.current) clearInterval(timerRef.current);
      if (messageTimerRef.current) clearInterval(messageTimerRef.current);
      setElapsedMs(performance.now() - start);

      setPreviewSrc(imageDataUrl);
      setPrediction(result);
      saveResult({ imageDataUrl, prediction: result });
      setStage("done");
    } catch (err) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (messageTimerRef.current) clearInterval(messageTimerRef.current);
      setErrorText(err instanceof ApiError ? err.message : "Une erreur inattendue est survenue.");
      setStage("error");
    }
  }, []);

  function reset() {
    setStage("import");
    setPreviewSrc(null);
    setPrediction(null);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  const step = stage === "import" ? 1 : stage === "analyzing" ? 2 : stage === "done" ? 3 : 1;
  const title =
    stage === "import"
      ? "Importez une photo de feuille"
      : stage === "analyzing"
        ? "Analyse de l'échantillon"
        : stage === "done"
          ? "Diagnostic disponible"
          : "L'analyse a échoué";

  return (
    <>
      <div className={styles.header}>
        <BrandMark />
        <NeuropathTrail step={step as 1 | 2 | 3} />
      </div>

      <main className={styles.main}>
        <p className={styles.stageEyebrow}>
          {stage === "error" ? "Erreur" : `Étape ${Math.min(step, 3)} / 3`}
        </p>
        <h1 className={styles.stageTitle}>{title}</h1>

        {stage === "import" && (
          <div>
            <div
              className={`${styles.dropzone} ${dragActive ? styles.drag : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={onDrop}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 16V4m0 0L7 9m5-5 5 5"
                  stroke="#9BAB9C"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="#9BAB9C" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <div className={styles.primaryTxt}>Glissez une photo ici</div>
              <div className={styles.secondaryTxt}>
                JPEG ou PNG, 10 Mo max — l&apos;image est envoyée à l&apos;API d&apos;analyse, rien
                d&apos;autre n&apos;est conservé
              </div>
              <div className={styles.captureActions}>
                <button
                  type="button"
                  className={`${styles.captureBtn} ${styles.primary}`}
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1-2h7l1 2h2A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-9Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="12.5" r="3.2" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  Prendre une photo
                </button>
                <button
                  type="button"
                  className={`${styles.captureBtn} ${styles.secondary}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M4 7.5A1.5 1.5 0 0 1 5.5 6h4l1.5 2h7.5A1.5 1.5 0 0 1 20 9.5v7A1.5 1.5 0 0 1 18.5 18h-13A1.5 1.5 0 0 1 4 16.5v-9Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Choisir un fichier
                </button>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/jpeg,image/png"
              capture="environment"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />

            <div className={styles.examples}>
              <span>Ou essayer&nbsp;:</span>
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.src}
                  type="button"
                  className={styles.exampleThumb}
                  onClick={async () => handleFile(await urlToFile(ex.src, "exemple.jpg"))}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ex.src} alt={ex.alt} />
                </button>
              ))}
            </div>
          </div>
        )}

        {(stage === "analyzing" || stage === "done") && previewSrc && (
          <div>
            <div className={styles.previewFrame}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewSrc} alt="Photo importée" />
              {stage === "analyzing" && <div className={styles.scanLine} />}
              <div className={styles.scrim} />
            </div>

            {stage === "analyzing" && (
              <div className={styles.statusRow}>
                <div className={styles.statusLeft}>
                  <span className={styles.statusDot} />
                  <span className={styles.statusText}>{ANALYSIS_MESSAGES[messageIndex]}</span>
                </div>
                <span className={styles.statusTimer}>{Math.round(elapsedMs)} ms</span>
              </div>
            )}

            {stage === "done" && prediction && (
              <div className={styles.resultCta}>
                <span className={styles.msg}>
                  Diagnostic prêt —{" "}
                  <strong>
                    {prediction.low_confidence ? "confiance faible" : "confiance élevée"} (
                    {Math.round(prediction.predicted.confidence * 100)}
                    %)
                  </strong>
                </span>
                <button type="button" className={styles.btnPrimary} onClick={() => router.push("/resultat")}>
                  Voir le diagnostic →
                </button>
              </div>
            )}

            <button type="button" className={styles.btnReset} onClick={reset}>
              ← Recommencer avec une autre photo
            </button>
          </div>
        )}

        {stage === "error" && (
          <div className={styles.errorBox}>
            <p>{errorText}</p>
            <button type="button" className={styles.btnReset} onClick={reset}>
              ← Réessayer
            </button>
          </div>
        )}
      </main>
    </>
  );
}
