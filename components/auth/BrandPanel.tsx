import { BRAND, BRAND_HIGHLIGHTS } from "@/lib/brand";
import { BrandLogo } from "./BrandLogo";
import styles from "./BrandPanel.module.css";

function CheckIcon() {
  return (
    <svg className={styles.checkIcon} viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="m5 10.5 3.2 3.2L15 6.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Decorative left-hand panel; hidden on small screens via CSS. */
export function BrandPanel() {
  return (
    <aside className={styles.panel}>
      <BrandLogo tone="light" />

      <div className={styles.content}>
        <h2 className={styles.headline}>{BRAND.TAGLINE}</h2>
        <p className={styles.description}>{BRAND.DESCRIPTION}</p>

        <ul className={styles.highlights}>
          {BRAND_HIGHLIGHTS.map((highlight) => (
            <li key={highlight.title} className={styles.highlight}>
              <span className={styles.iconWrapper}>
                <CheckIcon />
              </span>
              <div>
                <strong className={styles.highlightTitle}>{highlight.title}</strong>
                <span className={styles.highlightDescription}>{highlight.description}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className={styles.footnote}>{BRAND.PANEL_FOOTNOTE}</p>
    </aside>
  );
}