# Ethara AI — Team Task Manager

**Ethara AI** is a premium, full-stack project management solution designed for teams that demand clarity without complexity. Built with a Notion-inspired aesthetic and high-performance animations, it provides a seamless experience for tracking tasks, managing teams, and monitoring project health.

---

## ✨ Key Features

### 🔐 Authentication & Security
- Secure **NextAuth.js v5** integration.
- Protected routes and session management.
- Dynamic login and registration flows with Framer Motion transitions.

### 📊 Intelligent Dashboard
- **Real-time Statistics:** Instant overview of total projects, active tasks, and overdue items.
- **My Active Tasks:** Focused view of tasks assigned to or created by the user.
- **Live Activity Feed:** A comprehensive log of all workspace actions (Task creation, updates, deletions) to keep the team synced.

### 📋 Project & Kanban Management
- **Interactive Boards:** Drag-and-drop task management across "To Do", "In Progress", "In Review", and "Done".
- **Optimistic UI:** State updates instantly in the UI while syncing with the database in the background.
- **Task Granularity:** Edit task details, assign members, and set priorities.

### 👥 Team Collaboration & Roles
- **Admin Role:** Project creators have full control over project settings, member invitations, and task management.
- **Member Role:** Collaborators can create, update, and track tasks within the project.
- **Workspace Visibility:** View and manage team members within specific projects.

### 🔍 Global Search & Filtering
- Powerful search functionality to find tasks and projects across the entire workspace instantly.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL (Hosted on Railway)
- **ORM:** Prisma
- **Auth:** NextAuth.js v5 (Beta)
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Styling:** Modern Vanilla CSS (Notion-inspired)
- **Validation:** Zod

---

## 📐 Database Schema & Relationships

The application uses a relational PostgreSQL schema designed for high performance and data integrity:

- **User:** Stores profile information and handles authentication.
- **Project:** The primary container for work, linked to an Admin.
- **ProjectMember:** A junction table managing the relationship between Users and Projects, defining the `ADMIN` or `MEMBER` roles.
- **Task:** Individual work items linked to a project, including status, priority, and assignment data.
- **Activity:** A comprehensive audit log tracking user actions across the application for transparency.

---

## ⚙️ Local Development Setup

### Prerequisites
- Node.js 18+
- A PostgreSQL database instance

### 1. Clone & Install
```bash
git clone https://github.com/dhyan2815/Team-Task-Manager.git
cd Team-Task-Manager
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
DATABASE_URL="your-postgresql-url"
NEXTAUTH_SECRET="your-random-secret"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Database Initialization
```bash
npx prisma migrate deploy
npx prisma db seed
```

### 4. Run the App
```bash
npm run dev
```

---

## 🚀 Deployment (Railway)

Ethara AI is optimized for deployment on **Railway**:

1. **Connect Repository:** Link your GitHub repo to a new Railway project.
2. **Database:** Add a PostgreSQL plugin. Railway will automatically inject the `DATABASE_URL`.
3. **Environment Variables:** Ensure `NEXTAUTH_SECRET` and `NEXTAUTH_URL` (your production URL) are set in the Railway dashboard.
4. **Build & Deploy:** Railway detects the Next.js project and handles the build process automatically.

---

## 🧠 Development Approach

- **User Experience First:** Leveraged `Framer Motion` for micro-animations and `Vanilla CSS` for a bespoke, premium look that avoids the generic "UI kit" feel.
- **Performance:** Implemented optimistic updates for Kanban drag-and-drop to ensure zero-latency feedback for users.
- **Scalability:** Built with a modular folder structure and clean API separation to allow for easy feature expansion.
- **Reliability:** Comprehensive validation using Zod on both the client and server ensures data consistency.

---

*Built with ❤️ by [Your Name/Team Name]*
