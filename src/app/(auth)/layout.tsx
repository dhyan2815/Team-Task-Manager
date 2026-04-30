import React, { Suspense } from "react";
import { Sparkles } from "lucide-react";
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
            <Sparkles className={styles.logoIcon} size={24} fill="currentColor" />
            <span className={styles.logoText}>Ethara AI</span>
          </div>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          {children}
        </Suspense>
      </div>
    </div>
  );
}
