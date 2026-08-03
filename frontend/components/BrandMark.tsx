import Link from "next/link";
import styles from "./BrandMark.module.css";

export default function BrandMark() {
  return (
    <Link href="/" className={styles.brand}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 21C7 21 3 17 3 11c0-4 3-8 9-9 6 1 9 5 9 9 0 6-4 10-9 10Z"
          stroke="#7CA982"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M12 21V6" stroke="#7CA982" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <span className={styles.brandAccent}>100</span>Plante
    </Link>
  );
}
