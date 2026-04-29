"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { 
  Plus, 
  MoreHorizontal, 
  Calendar,
  User as UserIcon,
  Search
} from "lucide-react";
import styles from "./page.module.css";

type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: string;
  dueDate: string | null;
  assignee?: {
    name: string;
    email: string;
  };
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string;
}

const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: "TODO", label: "To Do" },
  { id: "IN_PROGRESS", label: "In Progress" },
  { id: "IN_REVIEW", label: "In Review" },
  { id: "DONE", label: "Done" },
];

export default function ProjectBoardPage() {
  const params = useParams();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      try {
        const [projRes, tasksRes] = await Promise.all([
          fetch(`/api/projects/${projectId}`),
          fetch(`/api/projects/${projectId}/tasks`)
        ]);
        
        if (projRes.ok) setProject(await projRes.json());
        if (tasksRes.ok) setTasks(await tasksRes.json());
      } catch (error) {
        console.error("Failed to fetch project data", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();

    // 30s Polling
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [projectId]);

  // Optimistic Update
  const updateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    const originalTasks = [...tasks];
    
    // 1. Update UI Optimistically
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");
    } catch (error) {
      console.error("Failed to update task status", error);
      // 2. Rollback on error
      setTasks(originalTasks);
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tasks, searchQuery]);

  if (isLoading) return <div className={styles.loading}>Loading project board...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.projectInfo}>
          <div 
            className={styles.colorIndicator} 
            style={{ backgroundColor: project?.color }} 
          />
          <div>
            <h1 className="section-heading">{project?.name}</h1>
            <p className="caption" style={{ color: "var(--color-text-secondary)" }}>
              {project?.description || "No description"}
            </p>
          </div>
        </div>

        <div className={styles.boardActions}>
          <div className={styles.search}>
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Filter tasks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button>
            <Plus size={18} />
            Add Task
          </Button>
        </div>
      </div>

      <div className={styles.board}>
        {COLUMNS.map(column => (
          <div 
            key={column.id} 
            className={styles.column}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const taskId = e.dataTransfer.getData("taskId");
              if (taskId) updateTaskStatus(taskId, column.id);
            }}
          >
            <div className={styles.columnHeader}>
              <span className={styles.columnLabel}>{column.label}</span>
              <span className={styles.count}>
                {filteredTasks.filter(t => t.status === column.id).length}
              </span>
            </div>

            <div className={styles.taskList}>
              <AnimatePresence mode="popLayout">
                {filteredTasks
                  .filter(t => t.status === column.id)
                  .map(task => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
                      draggable
                      onDragStart={(e: any) => {
                        e.dataTransfer.setData("taskId", task.id);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      className={styles.taskCardWrapper}
                    >
                      <Card className={styles.taskCard}>
                        <div className={styles.taskContent}>
                          <div className={styles.taskHeader}>
                            <Badge variant={task.priority.toLowerCase() as any}>
                              {task.priority}
                            </Badge>
                            <button className={styles.moreBtn}>
                              <MoreHorizontal size={14} />
                            </button>
                          </div>
                          <h4 className={styles.taskTitle}>{task.title}</h4>
                          {task.description && (
                            <p className={styles.taskDesc}>{task.description}</p>
                          )}
                          <div className={styles.taskFooter}>
                            {task.dueDate && (
                              <div className={styles.meta}>
                                <Calendar size={12} />
                                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                              </div>
                            )}
                            {task.assignee && (
                              <div className={styles.assignee} title={task.assignee.name}>
                                {task.assignee.name[0].toUpperCase()}
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
