import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import SpecimenDeck from "@/components/SpecimenDeck";
import HowItWorks from "@/components/HowItWorks";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <>
      <div className={styles.header}>
        <BrandMark />
        <nav className={styles.navLinks}>
          <a href="#how-it-works">Comment ça marche</a>
        </nav>
      </div>

      <div className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Détection de maladies foliaires</p>
          <h1>
            Repérez une maladie sur une feuille <em>avant qu&apos;elle ne se propage.</em>
          </h1>
          <p className={styles.lede}>
            Importez une photo, l&apos;analyse s&apos;appuie sur un modèle entraîné par transfer
            learning sur 54 300 images de référence — diagnostic et niveau de confiance en
            quelques secondes, sur 38 maladies et 14 espèces cultivées.
          </p>
          <div className={styles.heroActions}>
            <Link href="/demo" className={styles.btnPrimary}>
              Tester une photo
            </Link>
            <a href="#how-it-works" className={styles.btnLink}>
              Voir la méthodologie →
            </a>
          </div>
        </div>

        <SpecimenDeck />
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <div className={styles.n}>96,47&nbsp;%</div>
          <div className={styles.l}>Exactitude sur jeu de test</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.n}>38</div>
          <div className={styles.l}>Maladies &amp; états reconnus</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.n}>14</div>
          <div className={styles.l}>Espèces cultivées couvertes</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.n}>54&nbsp;300</div>
          <div className={styles.l}>Images d&apos;entraînement (PlantVillage)</div>
        </div>
      </div>

      <HowItWorks />
    </>
  );
}
