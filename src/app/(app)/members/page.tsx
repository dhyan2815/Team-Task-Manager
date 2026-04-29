"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AccessDenied } from "@/components/ui/AccessDenied";
import styles from "./page.module.css";

interface Member {
  id: string;
  name: string;
  email: string;
  role?: string;
  projectName?: string;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<{ status: number; message: string } | null>(null);

  useEffect(() => {
    async function fetchMembers() {
      try {
        const res = await fetch("/api/members");
        if (!res.ok) {
          const err = await res.json();
          setError({ status: res.status, message: err.error || "Failed to load members" });
          return;
        }
        const data = await res.json();
        setMembers(data);
      } catch (error) {
        console.error("Failed to fetch members", error);
        setError({ status: 500, message: "Something went wrong while loading members." });
      } finally {
        setIsLoading(false);
      }
    }
    fetchMembers();
  }, []);

  if (error) {
    return (
      <AccessDenied 
        title={error.status === 403 ? "Forbidden Access" : "Error Loading Members"} 
        message={error.message} 
      />
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className="section-heading">Team Members</h1>
        <p className="body-text" style={{ color: "var(--color-text-secondary)" }}>
          People you collaborate with across your projects.
        </p>
      </div>

      {isLoading ? (
        <div>Loading members...</div>
      ) : (
        <div className={styles.grid}>
          {members.length > 0 ? (
            members.map((member) => (
              <Card key={member.id} className={styles.memberCard}>
                <div className={styles.profile}>
                  <div className={styles.avatar}>
                    {member.name[0].toUpperCase()}
                  </div>
                  <div className={styles.info}>
                    <p className="body-text" style={{ fontWeight: 600 }}>{member.name}</p>
                    <p className="caption" style={{ color: "var(--color-text-muted)" }}>{member.email}</p>
                  </div>
                </div>
                {member.projectName && (
                  <div className={styles.projectInfo}>
                    <p className="caption">Project: <strong>{member.projectName}</strong></p>
                    <Badge variant={member.role === "ADMIN" ? "high" : "low"}>
                      {member.role}
                    </Badge>
                  </div>
                )}
              </Card>
            ))
          ) : (
            <div className={styles.emptyState}>
              <p>No collaborators found yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
