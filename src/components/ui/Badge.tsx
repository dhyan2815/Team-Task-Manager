import React from "react";
import styles from "./Badge.module.css";

type BadgeVariant = "todo" | "in-progress" | "in-review" | "done" | "low" | "medium" | "high" | "urgent" | "outline" | "default";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
}

export const Badge = ({ children, variant = "medium" }: BadgeProps) => {
  return (
    <span className={`${styles.badge} ${styles[variant]}`}>
      {children}
    </span>
  );
};
