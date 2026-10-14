import type { ReactNode } from "react";
import styles from "./AuthCard.module.css";

interface AuthCardProps {
  title: string;
  children: ReactNode;
}

/** Shared centered card layout for the sign-in and dashboard screens. */
export function AuthCard({ title, children }: AuthCardProps) {
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1 className={styles.title}>{title}</h1>
        {children}
      </section>
    </main>
  );
}