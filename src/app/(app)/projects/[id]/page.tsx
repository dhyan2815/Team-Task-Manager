"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { 
  Plus, 
  MoreHorizontal, 
  Calendar,
  User as UserIcon,
  Users,
  Search,
  Loader2,
  Edit2,
  Trash2
} from "lucide-react";
import { AccessDenied } from "@/components/ui/AccessDenied";
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
  members: { role: string }[];
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
  const [error, setError] = useState<{ status: number; message: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(`.${styles.moreBtn}`) && !target.closest(`.${styles.dropdownMenu}`)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM" as const,
    status: "TODO" as TaskStatus,
  });

  const fetchData = async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        fetch(`/api/projects/${projectId}/tasks`)
      ]);
      
      if (!projRes.ok) {
        const err = await projRes.json();
        setError({ status: projRes.status, message: err.error });
        return;
      }
      
      setProject(await projRes.json());
      if (tasksRes.ok) setTasks(await tasksRes.json());
    } catch (error) {
      console.error("Failed to fetch project data", error);
      setError({ status: 500, message: "Something went wrong while loading the project." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [projectId]);

  const updateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    const originalTasks = [...tasks];
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
      setTasks(originalTasks);
    }
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      if (editingTaskId) {
        const res = await fetch(`/api/tasks/${editingTaskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          const updatedTask = await res.json();
          setTasks((prev) => prev.map(t => t.id === editingTaskId ? { ...t, ...updatedTask } : t));
          setIsModalOpen(false);
          setEditingTaskId(null);
          setFormData({ title: "", description: "", priority: "MEDIUM", status: "TODO" });
        } else {
          const error = await res.json();
          alert(error.error || "Failed to update task");
        }
      } else {
        const res = await fetch(`/api/projects/${projectId}/tasks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          const newTask = await res.json();
          setTasks((prev) => [newTask, ...prev]);
          setIsModalOpen(false);
          setFormData({ title: "", description: "", priority: "MEDIUM", status: "TODO" });
        } else {
          const error = await res.json();
          alert(error.error || "Failed to create task");
        }
      }
    } catch (error) {
      console.error("Task save failed", error);
      alert("Something went wrong");
    } finally {
      setIsCreating(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/members`);
      if (res.ok) {
        const data = await res.json();
        setProjectMembers(data);
      }
    } catch (error) {
      console.error("Failed to fetch project members", error);
    }
  };

  useEffect(() => {
    if (isMembersModalOpen) {
      fetchMembers();
    }
  }, [isMembersModalOpen]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingMember(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newMemberEmail, role: "MEMBER" }),
      });
      if (res.ok) {
        setNewMemberEmail("");
        fetchMembers();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to add member");
      }
    } catch (error) {
      console.error("Failed to add member", error);
      alert("Something went wrong");
    } finally {
      setIsAddingMember(false);
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tasks, searchQuery]);

  const userRole = project?.members?.[0]?.role;
  const isAdmin = userRole === "ADMIN";

  if (isLoading) return <div className={styles.loading}>Loading project board...</div>;

  if (error) {
    return (
      <AccessDenied 
        title={error.status === 403 ? "Forbidden Access" : "Not Found"} 
        message={error.message} 
      />
    );
  }

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
          {isAdmin && (
            <Button variant="secondary" onClick={() => setIsMembersModalOpen(true)}>
              <Users size={18} />
              Members
            </Button>
          )}
          <Button onClick={() => {
            setEditingTaskId(null);
            setFormData({ title: "", description: "", priority: "MEDIUM", status: "TODO" });
            setIsModalOpen(true);
          }}>
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
                          <div className={styles.taskHeader} style={{ position: "relative" }}>
                            <Badge variant={task.priority.toLowerCase() as any}>
                              {task.priority}
                            </Badge>
                            <button 
                              className={styles.moreBtn}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenu(activeMenu === task.id ? null : task.id);
                              }}
                            >
                              <MoreHorizontal size={14} />
                            </button>
                            <AnimatePresence>
                              {activeMenu === task.id && (
                                <motion.div 
                                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                  transition={{ duration: 0.15 }}
                                  className={styles.dropdownMenu}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button 
                                    className={styles.dropdownItem}
                                    onClick={() => {
                                      setActiveMenu(null);
                                      setEditingTaskId(task.id);
                                      setFormData({
                                        title: task.title,
                                        description: task.description || "",
                                        priority: task.priority as any,
                                        status: task.status,
                                      });
                                      setIsModalOpen(true);
                                    }}
                                  >
                                    <Edit2 size={14} />
                                    Edit Task
                                  </button>
                                  <button 
                                    className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
                                    onClick={async () => {
                                      setActiveMenu(null);
                                      if (confirm("Are you sure you want to delete this task?")) {
                                        try {
                                          const res = await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
                                          if (res.ok) {
                                            setTasks(prev => prev.filter(t => t.id !== task.id));
                                          } else {
                                            alert("Failed to delete task.");
                                          }
                                        } catch (error) {
                                          console.error("Delete task failed", error);
                                        }
                                      }
                                    }}
                                  >
                                    <Trash2 size={14} />
                                    Delete Task
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTaskId(null);
          setFormData({ title: "", description: "", priority: "MEDIUM", status: "TODO" });
        }}
        title={editingTaskId ? "Edit Task" : "Add New Task"}
      >
        <form onSubmit={handleSaveTask} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="task-title">Task Title</label>
            <input
              id="task-title"
              type="text"
              required
              placeholder="e.g. Design landing page"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="task-desc">Description</label>
            <textarea
              id="task-desc"
              placeholder="Describe the task..."
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className={styles.row}>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label htmlFor="task-priority">Priority</label>
              <select
                id="task-priority"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label htmlFor="task-status">Status</label>
              <select
                id="task-status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="DONE">Done</option>
              </select>
            </div>
          </div>
          <div className={styles.formActions}>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => {
                setIsModalOpen(false);
                setEditingTaskId(null);
                setFormData({ title: "", description: "", priority: "MEDIUM", status: "TODO" });
              }}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? <Loader2 className="animate-spin" size={18} /> : (editingTaskId ? "Save Changes" : "Add Task")}
            </Button>
          </div>
        </form>
      </Modal>
      
      <Modal
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        title="Project Members"
      >
        <div className={styles.membersContent}>
          <form onSubmit={handleAddMember} className={styles.addMemberForm}>
            <input
              type="email"
              placeholder="Invite by email..."
              required
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              className={styles.memberInput}
            />
            <Button type="submit" disabled={isAddingMember}>
              Add
            </Button>
          </form>

          <div className={styles.membersList}>
            {projectMembers.map((m) => (
              <div key={m.id} className={styles.memberItem}>
                <div className={styles.memberAvatar}>
                  {m.user.name[0].toUpperCase()}
                </div>
                <div className={styles.memberInfo}>
                  <p className="body-text" style={{ fontSize: "14px", fontWeight: 600 }}>{m.user.name}</p>
                  <p className="caption" style={{ color: "var(--color-text-muted)" }}>{m.user.email}</p>
                </div>
                <Badge variant={m.role === "ADMIN" ? "high" : "low"}>
                  {m.role}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
