"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  Users, 
  Settings,
  Plus
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

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}></div>
          <span className={styles.logoText}>Ethara AI</span>
        </div>
      </div>

      <nav className={styles.nav}>
        <div className={styles.section}>
          <p className={styles.sectionLabel}>Overview</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
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
            <button className={styles.addBtn} title="New Project">
              <Plus size={14} />
            </button>
          </div>
          {/* Recent projects could be fetched here */}
          <div className={styles.emptyState}>No recent projects</div>
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
