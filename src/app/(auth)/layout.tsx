import React from "react";
import styles from "./layout.module.css";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}></div>
            <span className={styles.logoText}>Ethara AI</span>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
