"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import styles from "./page.module.css";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isRegistered = searchParams.get("registered") === "true";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error("Invalid email or password");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="card-title" style={{ textAlign: "center", marginBottom: "0.5rem" }}>
        Welcome back
      </h1>
      <p className="caption" style={{ textAlign: "center", color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>
        Sign in to your account.
      </p>

      {isRegistered && (
        <p className={styles.success} style={{ marginBottom: "1rem" }}>
          Registration successful! Please sign in.
        </p>
      )}

      <form onSubmit={onSubmit} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="email" className="caption">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className={styles.input}
            placeholder="name@example.com"
          />
        </div>
        <div className={styles.field}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <label htmlFor="password" className="caption">Password</label>
            <span className="caption" style={{ color: "var(--color-text-muted)", cursor: "help" }} title="Contact admin to reset password">
              Forgot?
            </span>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            required
            className={styles.input}
            placeholder="••••••••"
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <Button type="submit" isLoading={isLoading} style={{ width: "100%", marginTop: "0.5rem" }}>
          Sign In
        </Button>
      </form>

      <div className={styles.footer}>
        <span className="caption">Don't have an account? </span>
        <Link href="/register" className="caption" style={{ color: "var(--color-primary)", fontWeight: 600 }}>
          Sign Up
        </Link>
      </div>

      <div style={{ marginTop: "2rem", textAlign: "center", borderTop: "1px solid var(--color-border)", paddingTop: "1rem" }}>
        <p className="caption" style={{ color: "var(--color-text-muted)" }}>
          Contact admin to reset password
        </p>
      </div>
    </motion.div>
  );
}
