ETHARA AI - TEAM TASK MANAGER
==============================

Project Overview
----------------
Ethara AI is a full-stack project management solution built for teams. 
It features a Notion-inspired aesthetic, real-time activity tracking, and role-based access control.

1. Key Features
---------------
- Authentication: Secure Signup/Login using NextAuth v5.
- Project Management: Create projects, assign colors, and manage descriptions.
- Team Management: Invite members and assign roles (Admin/Member).
- Kanban Board: Interactive drag-and-drop task tracking with optimistic UI.
- Dashboard: Real-time statistics, active tasks list, and live activity feed.
- Role-Based Access: Restricted settings and deletion for Admins only.
- Task Tracking: Detailed task editing, assignment, and status updates.

2. Tech Stack
-------------
- Frontend: Next.js 14 (App Router), Framer Motion, Lucide Icons.
- Backend: Next.js API Routes, Prisma ORM.
- Database: PostgreSQL (Hosted on Railway).
- Auth: NextAuth.js v5.
- Styling: Custom Vanilla CSS.

3. Database Schema
------------------
- User: Authentication and profile.
- Project: Work containers.
- ProjectMember: Manages Admin/Member roles per project.
- Task: Individual work items with status and priority.
- Activity: Audit log for all team actions.

4. Local Setup Instructions
---------------------------
1. Clone the repo: git clone https://github.com/dhyan2815/Team-Task-Manager.git
2. Install dependencies: npm install
3. Configure .env:
   DATABASE_URL="your-postgresql-url"
   NEXTAUTH_SECRET="your-random-secret"
   NEXTAUTH_URL="http://localhost:3000"
4. Initialize Database:
   npx prisma migrate deploy
   npx prisma db seed
5. Run the app: npm run dev

5. Deployment (Railway)
-----------------------
1. Link GitHub repo to Railway.
2. Provision a PostgreSQL database.
3. Set environment variables (DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL).
4. Deploy.
