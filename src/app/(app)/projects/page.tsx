"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Users, Calendar, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#0075de",
  });

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(data);
    } catch (error) {
      console.error("Failed to fetch projects", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const newProject = await res.json();
        setProjects((prev) => [newProject, ...prev]);
        setIsModalOpen(false);
        setFormData({ name: "", description: "", color: "#0075de" });
        // Optionally redirect or just refresh list
        fetchProjects(); // Refresh to get counts
      } else {
        const error = await res.json();
        alert(error.error || "Failed to create project");
      }
    } catch (error) {
      console.error("Project creation failed", error);
      alert("Something went wrong");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className="section-heading">Projects</h1>
          <p className="body-text" style={{ color: "var(--color-text-secondary)" }}>
            Manage and track all your team's projects.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={18} style={{ marginRight: "0.5rem" }} />
          New Project
        </Button>
      </div>

      {isLoading ? (
        <div className={styles.loadingState}>
          <Loader2 className="animate-spin" size={24} />
          <span>Loading projects...</span>
        </div>
      ) : (
        <div className={styles.grid}>
          {projects.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No projects found. Create your first project to get started!</p>
            </div>
          ) : (
            projects.map((project) => (
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
                      <span>{project._count?.members || 0} members</span>
                    </div>
                    <div className={styles.meta}>
                      <Calendar size={14} />
                      <span>{project.dueDate ? new Date(project.dueDate).toLocaleDateString() : "No due date"}</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))
          )}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Project"
      >
        <form onSubmit={handleCreateProject} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Project Name</label>
            <input
              id="name"
              type="text"
              required
              placeholder="e.g. Website Redesign"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="description">Description (Optional)</label>
            <textarea
              id="description"
              placeholder="What is this project about?"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="color">Theme Color</label>
            <div className={styles.colorPicker}>
              <input
                id="color"
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
              <span className="caption">{formData.color}</span>
            </div>
          </div>
          <div className={styles.formActions}>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => setIsModalOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? <Loader2 className="animate-spin" size={18} /> : "Create Project"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
