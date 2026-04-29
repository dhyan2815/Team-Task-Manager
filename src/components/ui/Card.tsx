import React from "react";
import styles from "./Card.module.css";

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  headerAction?: React.ReactNode;
}

export const Card = ({ children, title, className = "", headerAction }: CardProps) => {
  return (
    <div className={`${styles.card} ${className}`}>
      {(title || headerAction) && (
        <div className={styles.header}>
          {title && <h3 className="card-title" style={{ fontSize: "16px" }}>{title}</h3>}
          {headerAction}
        </div>
      )}
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
};
