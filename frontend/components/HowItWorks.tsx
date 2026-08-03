"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import styles from "./HowItWorks.module.css";

const STEPS = [
  {
    idx: "01",
    title: "Capturez",
    desc: "Prenez la feuille en photo ou importez un fichier JPEG/PNG existant.",
    icon: (
      <>
        <rect x="3" y="7" width="18" height="13" rx="1.5" stroke="#7CA982" strokeWidth="1.5" />
        <path d="M8 7 9.2 4.5h5.6L16 7" stroke="#7CA982" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="12" cy="13.5" r="3.5" stroke="#7CA982" strokeWidth="1.5" />
      </>
    ),
  },
  {
    idx: "02",
    title: "Analysez",
    desc: "Un modèle par transfer learning (MobileNetV2, entraîné sur PlantVillage) classe l'image en quelques centaines de millisecondes.",
    icon: (
      <>
        <circle cx="12" cy="5" r="1.8" stroke="#7CA982" strokeWidth="1.5" />
        <circle cx="5" cy="14" r="1.8" stroke="#7CA982" strokeWidth="1.5" />
        <circle cx="19" cy="14" r="1.8" stroke="#7CA982" strokeWidth="1.5" />
        <circle cx="12" cy="20" r="1.8" stroke="#7CA982" strokeWidth="1.5" />
        <path
          d="M12 6.8 6.2 12.6M12 6.8l5.8 5.8M6.6 15.3l4.6 3.4M17.4 15.3l-4.6 3.4"
          stroke="#7CA982"
          strokeWidth="1.3"
        />
      </>
    ),
  },
  {
    idx: "03",
    title: "Recevez le diagnostic",
    desc: "Maladie détectée, score de confiance et top-3 des hypothèses si le résultat est ambigu. Aucune recommandation de traitement automatisée.",
    icon: (
      <>
        <path
          d="M12 21C7 21 3 17 3 11c0-4 3-8 9-9 6 1 9 5 9 9 0 6-4 10-9 10Z"
          stroke="#7CA982"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M8.5 12.5 11 15l4.5-6" stroke="#7CA982" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
];

export default function HowItWorks() {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const [visible, setVisible] = useState<boolean[]>(() => STEPS.map(() => false));
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reduceMotion || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const i = refs.current.indexOf(entry.target as HTMLDivElement);
            setTimeout(() => {
              setVisible((prev) => {
                const next = [...prev];
                next[i] = true;
                return next;
              });
            }, i * 120);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    refs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [reduceMotion]);

  return (
    <div className={styles.how} id="how-it-works">
      <div className={styles.head}>
        <p className={styles.eyebrow}>Comment ça marche</p>
        <h2>Trois étapes, aucune option cachée — ce que le système fait, sans plus.</h2>
      </div>
      <div className={styles.steps}>
        {STEPS.map((s, i) => (
          <div
            key={s.idx}
            ref={(el) => {
              refs.current[i] = el;
            }}
            className={`${styles.step} ${visible[i] || reduceMotion ? styles.inView : ""}`}
          >
            <div className={styles.idx}>{s.idx}</div>
            <svg className={styles.icon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              {s.icon}
            </svg>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
