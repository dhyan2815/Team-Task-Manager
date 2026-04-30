"use client";

import React, { Suspense } from "react";
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
          <Suspense fallback={<div style={{ height: '64px', borderBottom: '1px solid var(--color-border)' }} />}>
            <Topbar />
          </Suspense>
          <div className={styles.content}>
            <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>Loading...</div>}>
              {children}
            </Suspense>
          </div>
        </div>
      </div>
    </SessionProvider>
  );
};
