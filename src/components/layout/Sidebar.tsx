"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  Users, 
  Settings,
  Plus,
  Sparkles
} from "lucide-react";
import styles from "./Sidebar.module.css";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Tasks", href: "/tasks", icon: CheckSquare },
  { label: "Members", href: "/members", icon: Users },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch("/api/projects");
        if (res.ok) {
          const data = await res.json();
          setProjects(data.slice(0, 5)); // Only show top 5
        }
      } catch (error) {
        console.error("Failed to fetch projects for sidebar", error);
      }
    }
    fetchProjects();
  }, [pathname]); // Refresh when navigating

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <Sparkles className={styles.logoIcon} size={20} fill="currentColor" />
          <span className={styles.logoText}>Ethara AI</span>
        </div>
      </div>

      <nav className={styles.nav}>
        <div className={styles.section}>
          <p className={styles.sectionLabel}>Overview</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${isActive ? styles.active : ""}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionLabel}>Projects</p>
            <Link href="/projects" className={styles.addBtn} title="All Projects">
              <Plus size={14} />
            </Link>
          </div>
          <div className={styles.projectList}>
            {projects.length > 0 ? (
              projects.map((p) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className={`${styles.projectLink} ${pathname.includes(p.id) ? styles.active : ""}`}
                >
                  <div className={styles.dot} style={{ backgroundColor: p.color }} />
                  <span>{p.name}</span>
                </Link>
              ))
            ) : (
              <div className={styles.emptyState}>No projects</div>
            )}
          </div>
        </div>
      </nav>

      <div className={styles.footer}>
        <Link 
          href="/settings" 
          className={`${styles.navLink} ${pathname === "/settings" ? styles.active : ""}`}
        >
          <Settings size={18} />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
};
