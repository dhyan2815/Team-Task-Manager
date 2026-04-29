"use client";

import { motion } from "framer-motion";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import styles from "./AccessDenied.module.css";

interface AccessDeniedProps {
  title?: string;
  message?: string;
}

export function AccessDenied({ 
  title = "Access Denied", 
  message = "You don't have permission to view this project or page. Please contact your administrator if you believe this is an error."
}: AccessDeniedProps) {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <motion.div 
        className={styles.card}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.iconWrapper}>
          <ShieldAlert size={48} className={styles.icon} />
        </div>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <Button onClick={() => router.back()} variant="secondary">
            <ArrowLeft size={18} style={{ marginRight: "0.5rem" }} />
            Go Back
          </Button>
          <Button onClick={() => router.push("/dashboard")}>
            Return Home
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
