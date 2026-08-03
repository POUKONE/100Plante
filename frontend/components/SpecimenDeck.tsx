"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import styles from "./SpecimenDeck.module.css";

interface Specimen {
  src: string;
  label: string;
  state: "healthy" | "disease";
  top: string;
  left: string;
  w: number;
  rot: number;
  depth: number;
}

// Les 14 espèces couvertes par le modèle (cahier des charges section 4.1) — pour
// qu'on sache d'un coup d'œil sur quelles plantes l'appli est utilisable.
const SPECIMENS: Specimen[] = [
  { src: "/samples/tomato-healthy.jpg", label: "Tomate — Sain", state: "healthy", top: "2%", left: "4%", w: 120, rot: -6, depth: 0.4 },
  { src: "/samples/grape-black-rot.jpg", label: "Vigne — Black rot", state: "disease", top: "0%", left: "30%", w: 140, rot: 4, depth: 0.7 },
  { src: "/samples/corn-common-rust.jpg", label: "Maïs — Rouille", state: "disease", top: "4%", left: "56%", w: 100, rot: 7, depth: 0.35 },
  { src: "/samples/blueberry-healthy.jpg", label: "Myrtillier — Sain", state: "healthy", top: "8%", left: "80%", w: 85, rot: -5, depth: 0.3 },
  { src: "/samples/apple-healthy.jpg", label: "Pommier — Sain", state: "healthy", top: "24%", left: "16%", w: 104, rot: 5, depth: 0.3 },
  { src: "/samples/squash-powdery-mildew.jpg", label: "Courge — Oïdium", state: "disease", top: "20%", left: "42%", w: 118, rot: -3, depth: 0.65 },
  { src: "/samples/pepper-bell-healthy.jpg", label: "Poivron — Sain", state: "healthy", top: "26%", left: "66%", w: 95, rot: 6, depth: 0.45 },
  { src: "/samples/strawberry-healthy.jpg", label: "Fraisier — Sain", state: "healthy", top: "46%", left: "4%", w: 112, rot: -4, depth: 0.5 },
  { src: "/samples/cherry-healthy.jpg", label: "Cerisier — Sain", state: "healthy", top: "44%", left: "28%", w: 90, rot: 8, depth: 0.4 },
  { src: "/samples/orange-greening.jpg", label: "Oranger — Greening", state: "disease", top: "48%", left: "54%", w: 130, rot: -2, depth: 0.85 },
  { src: "/samples/raspberry-healthy.jpg", label: "Framboisier — Sain", state: "healthy", top: "42%", left: "78%", w: 88, rot: 4, depth: 0.3 },
  { src: "/samples/potato-early-blight.jpg", label: "Pomme de terre — Mildiou", state: "disease", top: "68%", left: "14%", w: 115, rot: -8, depth: 0.6 },
  { src: "/samples/soybean-healthy.jpg", label: "Soja — Sain", state: "healthy", top: "66%", left: "40%", w: 100, rot: 3, depth: 0.5 },
  { src: "/samples/peach-bacterial-spot.jpg", label: "Pêcher — Tache bactérienne", state: "disease", top: "70%", left: "62%", w: 96, rot: -5, depth: 0.55 },
];

export default function SpecimenDeck() {
  const deckRef = useRef<HTMLDivElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [revealedIndex, setRevealedIndex] = useState<number | null>(null);

  // Parallaxe : chaque carte réagit à la souris selon sa profondeur (Edge).
  // Ignorée sans souris (mobile/tablette) : sur ces écrans le deck bascule de
  // toute façon en rangée défilante simple, sans positionnement en profondeur.
  useEffect(() => {
    if (reduceMotion) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const deck = deckRef.current;
    if (!deck) return;

    function handleMouseMove(e: MouseEvent) {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;
      deck!.querySelectorAll<HTMLElement>("[data-depth]").forEach((chip) => {
        const depth = parseFloat(chip.dataset.depth!);
        const rot = parseFloat(chip.dataset.rot!);
        chip.style.transform = `rotate(${rot}deg) translate(${dx * depth * 14}px, ${dy * depth * 14}px)`;
      });
    }

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, [reduceMotion]);

  // Séquence "scan → diagnostic" en boucle, une carte à la fois (Motion TM).
  // Si l'utilisateur préfère moins d'animations, on n'enclenche pas le cycle du
  // tout : le rendu ci-dessous affiche alors directement toutes les étiquettes.
  useEffect(() => {
    if (reduceMotion) return;
    const order = SPECIMENS.map((_, i) => i).sort(() => Math.random() - 0.5);
    let idx = 0;
    let revealTimeout: ReturnType<typeof setTimeout>;
    const interval = setInterval(() => {
      const current = order[idx % order.length];
      setActiveIndex(current);
      setRevealedIndex(null);
      revealTimeout = setTimeout(() => setRevealedIndex(current), 1500);
      idx++;
    }, 3400);
    return () => {
      clearInterval(interval);
      clearTimeout(revealTimeout);
    };
  }, [reduceMotion]);

  return (
    <div className={styles.deck} ref={deckRef}>
      {SPECIMENS.map((s, i) => (
        <div
          key={s.src}
          className={styles.chip}
          data-depth={s.depth}
          data-rot={s.rot}
          style={
            {
              "--chip-w": `${s.w}px`,
              "--chip-top": s.top,
              "--chip-left": s.left,
              "--chip-rot": `${s.rot}deg`,
              animationDelay: `${0.5 + i * 0.09}s`,
            } as React.CSSProperties
          }
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={s.src} alt={s.label} />
          <div className={`${styles.scanLine} ${activeIndex === i ? styles.scanning : ""}`} />
          <div
            className={`${styles.tag} ${
              revealedIndex === i || reduceMotion
                ? s.state === "healthy"
                  ? styles.tagHealthy
                  : styles.tagDisease
                : ""
            }`}
            style={{
              opacity: revealedIndex === i || reduceMotion ? 1 : 0,
            }}
          >
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}
