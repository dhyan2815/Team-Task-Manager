"use client";

import { motion } from "framer-motion";
import { 
  Kanban, 
  Users, 
  Zap, 
  Shield, 
  BarChart3, 
  Clock, 
  ArrowRight,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import styles from "./page.module.css";

const features = [
  {
    title: "Kanban Boards",
    description: "Visualize your workflow and move tasks through stages with a fluid, drag-and-drop interface.",
    icon: <Kanban size={24} />,
  },
  {
    title: "Team Collaboration",
    description: "Invite members to projects and assign roles. Keep everyone in sync with real-time updates.",
    icon: <Users size={24} />,
  },
  {
    title: "Real-time Sync",
    description: "Experience zero-latency updates. Your team sees changes as they happen, everywhere.",
    icon: <Zap size={24} />,
  },
  {
    title: "Role-Based Access",
    description: "Control who sees what. Granular permissions for admins and members keep your data safe.",
    icon: <Shield size={24} />,
  },
  {
    title: "Analytics & Insights",
    description: "Track project progress and team productivity with built-in dashboard metrics.",
    icon: <BarChart3 size={24} />,
  },
  {
    title: "Efficiency First",
    description: "Optimistic UI updates mean no waiting for loaders. Fast, snappy, and productive.",
    icon: <Clock size={24} />,
  },
];

export default function FeaturesPage() {
  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>
          <Sparkles className={styles.logoIcon} size={24} fill="currentColor" />
          <span>Ethara AI</span>
        </Link>
        <Link href="/login" className={styles.secondaryBtn}>
          Log in
        </Link>
      </nav>

      <main>
        <section className={styles.hero}>
          <motion.h1 
            className="section-heading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Everything you need to <br /> ship faster.
          </motion.h1>
          <motion.p 
            className="body-large"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Ethara AI combines powerful project management with a simplified 
            experience designed for high-performance teams.
          </motion.p>
        </section>

        <section className={styles.grid}>
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              className={styles.featureCard}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className={styles.iconWrapper}>
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </motion.div>
          ))}
        </section>

        <section className={styles.cta}>
          <div className={styles.ctaContent}>
            <h2 className="section-heading">Ready to boost your team's output?</h2>
            <Link href="/register" className={styles.primaryBtn}>
              Get Started for Free <ArrowRight size={18} style={{ marginLeft: "8px", verticalAlign: "middle" }} />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
