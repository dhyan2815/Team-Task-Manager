import React from "react";
import styles from "./Button.module.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  isLoading,
  className = "",
  ...props
}: ButtonProps) => {
  const buttonClass = `${styles.button} ${styles[variant]} ${styles[size]} ${className}`;

  return (
    <button className={buttonClass} disabled={isLoading || props.disabled} {...props}>
      {isLoading ? "Loading..." : children}
    </button>
  );
};
