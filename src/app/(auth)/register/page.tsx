"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import styles from "./page.module.css";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Something went wrong");
      }

      router.push("/login?registered=true");
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
        Create an account
      </h1>
      <p className="caption" style={{ textAlign: "center", color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>
        Start managing your team today.
      </p>

      <form onSubmit={onSubmit} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="name" className="caption">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className={styles.input}
            placeholder="John Doe"
          />
        </div>
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
          <label htmlFor="password" className="caption">Password</label>
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
          Sign Up
        </Button>
      </form>

      <div className={styles.footer}>
        <span className="caption">Already have an account? </span>
        <Link href="/login" className="caption" style={{ color: "var(--color-primary)", fontWeight: 600 }}>
          Sign In
        </Link>
      </div>
    </motion.div>
  );
}
