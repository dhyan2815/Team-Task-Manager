import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <h1 className="display-hero">Manage your team's work in one place.</h1>
        <p className="body-large" style={{ color: "var(--color-text-secondary)", marginTop: "1rem" }}>
          The premium task manager for modern teams.
        </p>
        <div className={styles.actions}>
          <Link href="/register" className={styles.primaryBtn}>
            Get Started
          </Link>
          <Link href="/features" className={styles.secondaryBtn}>
            Learn More
          </Link>
        </div>
      </div>
    </main>
  );
}
