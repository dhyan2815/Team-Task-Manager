"use client";

import React from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import styles from "./Shell.module.css";
import { SessionProvider } from "next-auth/react";

export const Shell = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <div className={styles.shell}>
        <Sidebar />
        <div className={styles.main}>
          <Topbar />
          <div className={styles.content}>
            {children}
          </div>
        </div>
      </div>
    </SessionProvider>
  );
};
