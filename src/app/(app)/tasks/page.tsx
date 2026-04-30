"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { 
  CheckSquare, 
  Search, 
  Calendar, 
  User as UserIcon,
  Loader2,
  Filter
} from "lucide-react";
import { AccessDenied } from "@/components/ui/AccessDenied";
import styles from "./page.module.css";
import Link from "next/link";
import { motion } from "framer-motion";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  project: {
    id: string;
    name: string;
    color: string;
  };
  assignee?: {
    name: string;
    email: string;
  };
}

export default function TasksPage() {
  const searchParams = useSearchParams();
  const urlSearchQuery = searchParams.get("q") || "";
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<{ status: number; message: string } | null>(null);
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [filter, setFilter] = useState<"ALL" | "TODO" | "IN_PROGRESS" | "DONE">("ALL");

  const searchQuery = localSearchQuery || urlSearchQuery;

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch("/api/tasks");
        if (!res.ok) {
          const err = await res.json();
          setError({ status: res.status, message: err.error || "Failed to load tasks" });
          return;
        }
        const data = await res.json();
        setTasks(data);
      } catch (error) {
        console.error("Failed to fetch tasks", error);
        setError({ status: 500, message: "Something went wrong while loading your tasks." });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           t.project.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = filter === "ALL" || t.status === filter;
      
      return matchesSearch && matchesFilter;
    });
  }, [tasks, searchQuery, filter]);

  if (isLoading) {
    return (
      <div className={styles.loadingState}>
        <Loader2 className="animate-spin" size={32} />
        <p>Loading your tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <AccessDenied 
        title={error.status === 403 ? "Forbidden Access" : "Error Loading Tasks"} 
        message={error.message} 
      />
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>All Tasks</h1>
        <p className={styles.subtitle}>Manage and track everything across your projects.</p>
        
        <div className={styles.actions}>
          <div className={styles.search}>
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Search tasks or projects..." 
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
            />
          </div>
          
          <div className={styles.filters}>
            {(["ALL", "TODO", "IN_PROGRESS", "DONE"] as const).map((f) => (
              <button
                key={f}
                className={`${styles.filterBtn} ${filter === f ? styles.active : ""}`}
                onClick={() => setFilter(f)}
              >
                {f.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className={styles.emptyState}>
          <CheckSquare size={48} style={{ opacity: 0.2 }} />
          <p>{searchQuery || filter !== "ALL" ? "No tasks match your criteria." : "You don't have any tasks yet."}</p>
        </div>
      ) : (
        <motion.div 
          className={styles.grid}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, staggerChildren: 0.1 }}
        >
          {filteredTasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Link href={`/projects/${task.project.id}`}>
                <Card className={styles.taskCard}>
                  <div className={styles.taskHeader}>
                    <div className={styles.projectBadge}>
                      <div 
                        className={styles.projectDot} 
                        style={{ backgroundColor: task.project.color }} 
                      />
                      <span>{task.project.name}</span>
                    </div>
                    <Badge variant={task.status.toLowerCase() as any}>
                      {task.status.replace("_", " ")}
                    </Badge>
                  </div>
                  
                  <h3 className={styles.taskTitle}>{task.title}</h3>
                  {task.description && <p className={styles.taskDesc}>{task.description}</p>}
                  
                  <div className={styles.taskFooter}>
                    <div className={styles.meta}>
                      <Calendar size={14} />
                      <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}</span>
                    </div>
                    
                    {task.assignee && (
                      <div className={styles.assignee}>
                        <div className={styles.avatar}>
                          {task.assignee.name[0].toUpperCase()}
                        </div>
                        <span>{task.assignee.name}</span>
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
