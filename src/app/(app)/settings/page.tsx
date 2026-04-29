"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Settings as SettingsIcon, User, Shield, Bell } from "lucide-react";
import styles from "./page.module.css";
import { useSession } from "next-auth/react";
import { AccessDenied } from "@/components/ui/AccessDenied";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // In a real app, we might check a global role or fetch user settings
    // For now, let's assume we can determine if they have admin privileges
  }, []);

  if (status === "loading") return <div>Loading settings...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className="section-heading">Settings</h1>
        <p className="body-text" style={{ color: "var(--color-text-secondary)" }}>
          Manage your account and application preferences.
        </p>
      </div>

      <div className={styles.grid}>
        <Card title="Account Settings" className={styles.card}>
          <div className={styles.item}>
            <div className={styles.icon}><User size={20} /></div>
            <div className={styles.info}>
              <p className="body-text" style={{ fontWeight: 600 }}>Profile Information</p>
              <p className="caption" style={{ color: "var(--color-text-muted)" }}>{session?.user?.name} ({session?.user?.email})</p>
            </div>
            <Button variant="secondary" size="sm">Edit</Button>
          </div>
          <div className={styles.item}>
            <div className={styles.icon}><Bell size={20} /></div>
            <div className={styles.info}>
              <p className="body-text" style={{ fontWeight: 600 }}>Notifications</p>
              <p className="caption" style={{ color: "var(--color-text-muted)" }}>Manage how you receive updates.</p>
            </div>
            <Button variant="secondary" size="sm">Configure</Button>
          </div>
        </Card>

        <Card title="Security" className={styles.card}>
          <div className={styles.item}>
            <div className={styles.icon}><Shield size={20} /></div>
            <div className={styles.info}>
              <p className="body-text" style={{ fontWeight: 600 }}>Password</p>
              <p className="caption" style={{ color: "var(--color-text-muted)" }}>Last changed 3 months ago.</p>
            </div>
            <Button variant="secondary" size="sm">Update</Button>
          </div>
        </Card>

        <Card title="Workspace (Admin Only)" className={styles.card}>
          <p className="caption" style={{ marginBottom: "1rem" }}>
            These settings are only available to workspace administrators.
          </p>
          <div style={{ opacity: 0.5, pointerEvents: "none" }}>
            <div className={styles.item}>
              <div className={styles.info}>
                <p className="body-text" style={{ fontWeight: 600 }}>Workspace Name</p>
                <p className="caption">Ethara AI Official</p>
              </div>
              <Button variant="secondary" size="sm" disabled>Change</Button>
            </div>
          </div>
          <div style={{ marginTop: "1rem" }}>
             <p className="caption" style={{ color: "var(--color-warning)" }}>
               You are currently logged in as a <strong>Member</strong>. Upgrade to Admin to manage workspace settings.
             </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
