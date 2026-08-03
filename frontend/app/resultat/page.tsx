"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import NeuropathTrail from "@/components/NeuropathTrail";
import { getDiseaseInfo } from "@/lib/diseaseInfo";
import { getKnownConfusionsAmong, getModelReliability } from "@/lib/modelReliability";
import { useStoredResult } from "@/lib/resultStore";
import { translateLabel } from "@/lib/translations";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import styles from "./page.module.css";

const RING_CIRCUMFERENCE = 2 * Math.PI * 40;

export default function ResultPage() {
  const stored = useStoredResult();
  const reduceMotion = usePrefersReducedMotion();
  const [ringOffset, setRingOffset] = useState(RING_CIRCUMFERENCE);
  const [displayedPct, setDisplayedPct] = useState(0);
  const barsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!stored) return;
    const confidence = stored.prediction.predicted.confidence;
    const targetOffset = RING_CIRCUMFERENCE * (1 - confidence);
    const targetPct = Math.round(confidence * 100);

    if (reduceMotion) {
      // Différé au tick suivant : un setState synchrone dans le corps de l'effect
      // est déconseillé (react-hooks/set-state-in-effect), et ici la mise à jour
      // doit de toute façon paraître instantanée pour un utilisateur en mode réduit.
      const id = setTimeout(() => {
        setRingOffset(targetOffset);
        setDisplayedPct(targetPct);
        barsRef.current?.querySelectorAll<HTMLElement>("[data-target]").forEach((bar) => {
          bar.style.width = bar.dataset.target ?? "0%";
        });
      }, 0);
      return () => clearTimeout(id);
    }

    const ringTimeout = setTimeout(() => setRingOffset(targetOffset), 60);

    const duration = 1400;
    const delay = 1100;
    const start = performance.now();
    let raf: number;
    function tick(now: number) {
      const elapsed = now - start - delay;
      if (elapsed < 0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayedPct(Math.round(targetPct * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    const barsTimeout = setTimeout(() => {
      barsRef.current?.querySelectorAll<HTMLElement>("[data-target]").forEach((bar) => {
        bar.style.width = bar.dataset.target ?? "0%";
      });
    }, 1300);

    return () => {
      clearTimeout(ringTimeout);
      clearTimeout(barsTimeout);
      cancelAnimationFrame(raf);
    };
  }, [stored, reduceMotion]);

  if (stored === undefined) {
    return null; // évite un flash de contenu avant lecture de sessionStorage
  }

  if (stored === null) {
    return (
      <>
        <div className={styles.header}>
          <BrandMark />
        </div>
        <main className={styles.emptyState}>
          <p className={styles.eyebrow}>Aucune analyse en cours</p>
          <h1>Importez d&apos;abord une photo pour obtenir un diagnostic.</h1>
          <Link href="/demo" className={styles.btnPrimary}>
            Aller à la démo →
          </Link>
        </main>
      </>
    );
  }

  const { imageDataUrl, prediction } = stored;
  const main = translateLabel(prediction.predicted.label, prediction.predicted.species, prediction.predicted.condition);
  const diseaseInfo = getDiseaseInfo(prediction.predicted.label);
  const reliability = getModelReliability(prediction.predicted.label);
  const confusedWithLabels = getKnownConfusionsAmong(
    prediction.predicted.label,
    prediction.top_k.map((c) => c.label)
  );
  const confusedWithNames = confusedWithLabels.map((label) => {
    const t = translateLabel(label, "", "");
    return `${t.species} — ${t.condition}`;
  });

  return (
    <>
      <div className={styles.header}>
        <BrandMark />
        <NeuropathTrail step={3} />
        <Link href="/demo" className={styles.backLink}>
          ← Nouvelle analyse
        </Link>
      </div>

      {prediction.is_placeholder && (
        <div className={styles.placeholderBanner}>
          Le modèle entraîné n&apos;est pas chargé côté serveur — ce résultat est un espace réservé,
          pas un vrai diagnostic.
        </div>
      )}

      <main className={styles.main}>
        <div className={styles.specimen}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageDataUrl} alt="Feuille analysée" />
        </div>

        <div className={styles.diagnosisCard}>
          <p className={`${styles.eyebrow} ${main.healthy ? styles.eyebrowHealthy : styles.eyebrowDisease}`}>
            {main.healthy ? "Feuille saine" : "Maladie détectée"}
          </p>
          <h1 className={styles.diagnosisName}>
            <span className={styles.species}>{main.species}</span>
            {main.condition}
          </h1>

          <div className={styles.diagnosisRow}>
            <div className={styles.confidenceRing}>
              <svg viewBox="0 0 92 92">
                <circle className={styles.ringTrack} cx="46" cy="46" r="40" />
                <circle
                  className={`${styles.ringValue} ${main.healthy ? styles.ringHealthy : styles.ringDisease}`}
                  cx="46"
                  cy="46"
                  r="40"
                  style={{
                    strokeDasharray: RING_CIRCUMFERENCE,
                    strokeDashoffset: ringOffset,
                  }}
                />
              </svg>
              <span className={styles.ringNumber}>{displayedPct}%</span>
            </div>
            <div className={styles.confidenceCopy}>
              <p className={styles.confidenceLabel}>Indice de confiance</p>
              <p>
                {prediction.low_confidence
                  ? "Score sous le seuil de fiabilité — comparez avec le top-3 ci-dessous avant de conclure."
                  : "Score net, au-dessus du seuil de 70 % — pas d'ambiguïté nécessitant une seconde photo."}
              </p>
              {reliability && (
                <p className={styles.reliabilityNote}>
                  Fiabilité {reliability.tier} pour ce type de diagnostic : sur {reliability.testSetSize.toLocaleString("fr-FR")}{" "}
                  photos de test jamais vues à l&apos;entraînement, quand le système annonce «&nbsp;{main.condition}
                  &nbsp;», il a raison dans {Math.round(reliability.precision * 100)}&nbsp;% des cas.
                </p>
              )}
            </div>
          </div>

          {confusedWithNames.length > 0 && (
            <div className={styles.confusionNote}>
              <p>
                <strong>À savoir :</strong> d&apos;après nos tests, «&nbsp;{main.condition}&nbsp;» est parfois confondue par
                le système avec {confusedWithNames.join(" et ")} — les symptômes se ressemblent visuellement. Si le
                diagnostic vous surprend, comparez avec le top-3 ci-dessous.
              </p>
            </div>
          )}

          {diseaseInfo && (
            <div className={styles.diseaseInfo}>
              <p className={styles.diseaseInfoLabel}>À propos de cette maladie</p>
              <p className={styles.diseaseInfoCause}>{diseaseInfo.cause}</p>
              <p className={styles.diseaseInfoDesc}>{diseaseInfo.description}</p>
              <p className={styles.diseaseInfoDisclaimer}>
                Information générale à titre indicatif — pas une recommandation de traitement.
              </p>
            </div>
          )}

          <div className={styles.topK} ref={barsRef}>
            {prediction.top_k.map((c, i) => {
              const t = translateLabel(c.label, c.species, c.condition);
              const pct = c.confidence * 100;
              return (
                <div key={c.label} className={styles.topKRow} data-primary={i === 0}>
                  <span className={styles.topKName}>
                    {t.species} — {t.condition}
                  </span>
                  <span className={styles.topKPct}>{pct.toFixed(1).replace(".", ",")} %</span>
                  <div className={styles.topKBarTrack}>
                    <div
                      className={styles.topKBarFill}
                      data-target={`${pct}%`}
                      data-primary={i === 0}
                      style={{ width: 0 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.actions}>
            <Link href="/demo" className={styles.btnPrimary}>
              Tester une nouvelle image
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
