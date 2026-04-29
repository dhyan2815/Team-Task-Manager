"use client";

import { useSession, signOut } from "next-auth/react";
import { Bell, Search, LogOut, User } from "lucide-react";
import styles from "./Topbar.module.css";

export const Topbar = () => {
  const { data: session } = useSession();

  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <header className={styles.topbar}>
      <div className={styles.searchContainer}>
        <Search size={16} className={styles.searchIcon} />
        <input type="text" placeholder="Search tasks, projects..." className={styles.searchInput} />
      </div>

      <div className={styles.actions}>
        <button className={styles.iconBtn}>
          <Bell size={20} />
        </button>
        
        <div className={styles.profile}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.profileInfo}>
            <p className={styles.userName}>{session?.user?.name || "User"}</p>
            <p className={styles.userEmail}>{session?.user?.email}</p>
          </div>
          <button 
            className={styles.logoutBtn} 
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
