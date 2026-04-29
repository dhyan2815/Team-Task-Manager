"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Users, Calendar } from "lucide-react";
import styles from "./page.module.css";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch("/api/projects");
        const data = await res.json();
        setProjects(data);
      } catch (error) {
        console.error("Failed to fetch projects", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProjects();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className="section-heading">Projects</h1>
          <p className="body-text" style={{ color: "var(--color-text-secondary)" }}>
            Manage and track all your team's projects.
          </p>
        </div>
        <Button>
          <Plus size={18} style={{ marginRight: "0.5rem" }} />
          New Project
        </Button>
      </div>

      {isLoading ? (
        <div>Loading projects...</div>
      ) : (
        <div className={styles.grid}>
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className={styles.projectCard}>
                <div className={styles.projectHeader}>
                  <div 
                    className={styles.colorDot} 
                    style={{ backgroundColor: project.color }}
                  ></div>
                  <h3 className="card-title">{project.name}</h3>
                </div>
                <p className="caption" style={{ color: "var(--color-text-secondary)", marginBottom: "1.5rem", minHeight: "2.8em" }}>
                  {project.description || "No description provided."}
                </p>
                <div className={styles.projectFooter}>
                  <div className={styles.meta}>
                    <Users size={14} />
                    <span>{project._count.members} members</span>
                  </div>
                  <div className={styles.meta}>
                    <Calendar size={14} />
                    <span>{project.dueDate ? new Date(project.dueDate).toLocaleDateString() : "No due date"}</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
