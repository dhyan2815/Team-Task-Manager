"use client";

import { useSession, signOut } from "next-auth/react";
import { Search, LogOut } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import styles from "./Topbar.module.css";

export const Topbar = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams);
    if (e.target.value) {
      params.set('q', e.target.value);
    } else {
      params.delete('q');
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <header className={styles.topbar}>
      <div className={styles.searchContainer}>
        <Search size={16} className={styles.searchIcon} />
        <input 
          type="text" 
          placeholder="Search tasks, projects..." 
          className={styles.searchInput}
          defaultValue={searchParams.get('q') || ''}
          onChange={handleSearch}
        />
      </div>

      <div className={styles.actions}>
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
