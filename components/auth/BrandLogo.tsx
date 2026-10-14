import { BRAND } from "@/lib/brand";
import styles from "./BrandLogo.module.css";

interface BrandLogoProps {
  /** "light" for dark backgrounds, "dark" for light backgrounds. */
  tone: "light" | "dark";
}

/** Original placeholder mark. Replace the <svg> with your own logo file when ready. */
export function BrandLogo({ tone }: BrandLogoProps) {
  return (
    <div className={`${styles.root} ${tone === "light" ? styles.light : styles.dark}`}>
      <svg className={styles.mark} viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="#4f46e5" />
        <path d="M17.5 6 9 18h6l-1.5 8L23 14h-6z" fill="#ffffff" />
      </svg>
      <span>{BRAND.NAME}</span>
    </div>
  );
}