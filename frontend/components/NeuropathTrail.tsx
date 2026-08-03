import styles from "./NeuropathTrail.module.css";

const STEPS = [
  { n: 1, label: "Import" },
  { n: 2, label: "Analyse" },
  { n: 3, label: "Résultat" },
] as const;

export default function NeuropathTrail({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className={styles.trail}>
      {STEPS.map((s, i) => (
        <div key={s.n} className={styles.segment}>
          <div
            className={`${styles.node} ${
              s.n < step ? styles.done : s.n === step ? styles.active : ""
            }`}
          >
            <span className={styles.dot} />
            <span className={styles.label}>{s.label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`${styles.line} ${s.n < step ? styles.lineDone : ""}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
