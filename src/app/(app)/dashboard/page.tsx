"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  BarChart3,
} from "lucide-react";
import styles from "./page.module.css";

interface DashboardTask {
  id: string;
  title: string;
  status: string;
  dueDate: string | null;
  project: {
    name: string;
    color: string;
  };
}

interface DashboardStats {
  taskCounts: Record<string, number>;
  overdueTasks: DashboardTask[];
  recentTasks: DashboardTask[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className="section-heading">Dashboard</h1>
          <p className="body-text" style={{ color: "var(--color-text-secondary)" }}>
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  const taskCounts = stats?.taskCounts || {};
  const totalTasks = Object.values(taskCounts).reduce((a: number, b: number) => a + b, 0);

  const formatDate = (dateString: string | null) => {
    if (!dateString || !isClient) return "";
    return new Date(dateString).toLocaleDateString();
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const getStatusVariant = (status: string): any => {
    return status.toLowerCase().replace(/_/g, "-");
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className="section-heading">Dashboard</h1>
        <p className="body-text" style={{ color: "var(--color-text-secondary)" }}>
          Welcome back! Here's what's happening with your projects.
        </p>
      </div>

      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <div className={styles.statIcon} style={{ color: "var(--color-primary)" }}>
            <BarChart3 size={24} />
          </div>
          <div className={styles.statInfo}>
            <p className="caption" style={{ color: "var(--color-text-muted)" }}>Total Tasks</p>
            <p className="section-heading" style={{ fontSize: "24px" }}>{totalTasks}</p>
          </div>
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statIcon} style={{ color: "var(--color-warning)" }}>
            <Clock size={24} />
          </div>
          <div className={styles.statInfo}>
            <p className="caption" style={{ color: "var(--color-text-muted)" }}>In Progress</p>
            <p className="section-heading" style={{ fontSize: "24px" }}>{taskCounts["IN_PROGRESS"] || 0}</p>
          </div>
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statIcon} style={{ color: "var(--color-success)" }}>
            <CheckCircle2 size={24} />
          </div>
          <div className={styles.statInfo}>
            <p className="caption" style={{ color: "var(--color-text-muted)" }}>Completed</p>
            <p className="section-heading" style={{ fontSize: "24px" }}>{taskCounts["DONE"] || 0}</p>
          </div>
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statIcon} style={{ color: "var(--color-danger)" }}>
            <AlertCircle size={24} />
          </div>
          <div className={styles.statInfo}>
            <p className="caption" style={{ color: "var(--color-text-muted)" }}>Overdue</p>
            <p className="section-heading" style={{ fontSize: "24px" }}>{stats?.overdueTasks?.length || 0}</p>
          </div>
        </Card>
      </div>

      <div className={styles.mainGrid}>
        <Card title="Overdue Tasks" className={styles.listCard}>
          {stats && stats.overdueTasks.length > 0 ? (
            <div className={styles.taskList}>
              {stats.overdueTasks.map((task: DashboardTask) => (
                <div key={task.id} className={styles.taskItem}>
                  <div className={styles.taskTitle}>
                    <p className="body-text" style={{ fontWeight: 600 }}>{task.title}</p>
                    <p className="caption" style={{ color: "var(--color-text-muted)" }}>{task.project.name}</p>
                  </div>
                  <Badge variant="urgent">
                    {formatDate(task.dueDate)}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="caption" style={{ color: "var(--color-text-muted)", textAlign: "center", padding: "2rem" }}>
              No overdue tasks. Good job!
            </p>
          )}
        </Card>

        <Card title="Recent Activity" className={styles.listCard}>
          {stats && stats.recentTasks.length > 0 ? (
            <div className={styles.taskList}>
              {stats.recentTasks.map((task: DashboardTask) => (
                <div key={task.id} className={styles.taskItem}>
                  <div className={styles.taskTitle}>
                    <p className="body-text" style={{ fontWeight: 600 }}>{task.title}</p>
                    <p className="caption" style={{ color: "var(--color-text-muted)" }}>{task.project.name}</p>
                  </div>
                  <Badge variant={getStatusVariant(task.status)}>
                    {formatStatus(task.status)}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="caption" style={{ color: "var(--color-text-muted)", textAlign: "center", padding: "2rem" }}>
              No recent activity.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
