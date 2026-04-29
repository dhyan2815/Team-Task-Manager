# Team Task Manager — Full-Stack Implementation Plan (FINAL)

## Overview

A premium, production-grade **Team Task Manager** with role-based access control (Admin/Member), project & task management, Kanban board with drag-and-drop, dashboard analytics, and REST APIs backed by PostgreSQL. Deployed live on **Railway**.

**Design DNA:** Notion-inspired warm minimalism — white canvas, Inter typography, whisper borders, multi-layer soft shadows. Framer Motion supplies spring animations and kinetic micro-interactions.

---

## Decisions Locked In

| # | Decision | Resolution |
|---|---|---|
| 1 | Kanban drag persistence | **Optimistic UI** — update instantly, API call in background, rollback on error |
| 2 | Real-time updates | **30-second polling** on the Kanban board page |
| 3 | Design theme | **Notion light** — warm white palette, Framer Design used for animations only |
| 4 | Avatars | **Initials-based colored avatars** — deterministic color from name hash, no file uploads |
| 5 | Password reset | **Out of scope** — login page shows "Contact your admin to reset your password" |

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Vanilla CSS Modules + CSS Custom Properties (Notion tokens) |
| Animations | Framer Motion |
| Backend | Next.js API Routes (REST) |
| Database | PostgreSQL (Railway plugin) |
| ORM | Prisma |
| Auth | NextAuth.js v5 (Credentials provider, JWT sessions) |
| Validation | Zod (shared API + form) |
| Icons | Lucide React |
| Charts | Recharts |
| Deploy | Railway |

---

## ⚙️ Prerequisites & Credentials Setup (Manual Steps)

> [!IMPORTANT]
> Complete **all steps in this section before running any code**. These require manual intervention — no automation can do this for you.

### Step 1 — Node.js & Git

Ensure you have the following installed locally:
- **Node.js** ≥ 18.17 → `node -v`
- **Git** → `git -v`
- **pnpm** (recommended) → `npm install -g pnpm`

---

### Step 2 — GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Create a **public** repository named `team-task-manager` (required for submission)
3. Copy the remote URL (e.g. `https://github.com/<your-username>/team-task-manager.git`)
4. After scaffolding the project locally, run:
   ```bash
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

---

### Step 3 — Railway Account & Project

1. Go to [railway.app](https://railway.app) → Sign up / Log in with GitHub
2. Click **New Project** → **Deploy from GitHub repo** → select `team-task-manager`
3. Once the project is created, click **Add Plugin** → choose **PostgreSQL**
4. Railway will provision a Postgres instance. Go to the **PostgreSQL plugin → Variables tab** and copy:
   - `DATABASE_URL` (format: `postgresql://user:pass@host:port/dbname`)

> [!NOTE]
> You will paste this `DATABASE_URL` into your `.env.local` file (Step 5). Railway also injects it automatically into your deployed environment.

---

### Step 4 — Generate NextAuth Secret

Run this in your terminal to generate a cryptographically secure secret:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output — this becomes your `NEXTAUTH_SECRET`.

---

### Step 5 — Environment Variables

Create a `.env.local` file in the project root with the following content. **Never commit this file.**

```env
# ─── Database ───────────────────────────────────────────
# Paste the DATABASE_URL from Railway PostgreSQL plugin
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DBNAME"

# ─── NextAuth ───────────────────────────────────────────
# Paste the output of the crypto command from Step 4
NEXTAUTH_SECRET="your-generated-secret-here"

# Local development URL (change to Railway URL after deploy)
NEXTAUTH_URL="http://localhost:3000"

# ─── App ────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

After deployment, update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` in Railway's **Variables** tab to your live Railway domain (e.g. `https://team-task-manager.up.railway.app`).

---

### Step 6 — Railway Environment Variables (Production)

In Railway → your project → **Variables tab**, add:

| Key | Value |
|---|---|
| `DATABASE_URL` | Auto-injected by PostgreSQL plugin ✅ |
| `NEXTAUTH_SECRET` | Paste your generated secret |
| `NEXTAUTH_URL` | `https://<your-app>.up.railway.app` |
| `NEXT_PUBLIC_APP_URL` | `https://<your-app>.up.railway.app` |

---

### Step 7 — Prisma DB Migration (Production)

After first deploy, run the migration command once via Railway's **Shell** or add it to the build command:

```bash
npx prisma migrate deploy && npx prisma db seed
```

You can set this as Railway's **Start Command** for the first deploy:
```
npx prisma migrate deploy && node prisma/seed.js && node server.js
```

Then revert the start command to just `node server.js` for subsequent deploys.

---

## Database Schema (Prisma)

```prisma
model User {
  id             String          @id @default(cuid())
  name           String
  email          String          @unique
  password       String
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
  projectMembers ProjectMember[]
  tasksAssigned  Task[]          @relation("AssignedTo")
  tasksCreated   Task[]          @relation("CreatedBy")
}

model Project {
  id          String          @id @default(cuid())
  name        String
  description String?
  color       String          @default("#0075de")
  dueDate     DateTime?
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
  members     ProjectMember[]
  tasks       Task[]
}

model ProjectMember {
  id        String      @id @default(cuid())
  role      ProjectRole @default(MEMBER)
  joinedAt  DateTime    @default(now())
  userId    String
  projectId String
  user      User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  project   Project     @relation(fields: [projectId], references: [id], onDelete: Cascade)
  @@unique([userId, projectId])
}

enum ProjectRole { ADMIN  MEMBER }

model Task {
  id          String     @id @default(cuid())
  title       String
  description String?
  status      TaskStatus @default(TODO)
  priority    Priority   @default(MEDIUM)
  dueDate     DateTime?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  projectId   String
  assigneeId  String?
  createdById String
  project     Project    @relation(fields: [projectId], references: [id], onDelete: Cascade)
  assignee    User?      @relation("AssignedTo", fields: [assigneeId], references: [id], onDelete: SetNull)
  createdBy   User       @relation("CreatedBy", fields: [createdById], references: [id])
}

enum TaskStatus { TODO  IN_PROGRESS  IN_REVIEW  DONE }
enum Priority  { LOW   MEDIUM       HIGH       URGENT }
```

**Relationships:**
- `User ↔ Project` → many-to-many via `ProjectMember` (carries `role`)
- `Project → Task` → one-to-many (cascade delete)
- `User → Task` → assignee (nullable) + creator

---

## REST API Endpoints

### Auth
| Method | Endpoint | Auth |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/[...nextauth]` | Public |

### Users
| Method | Endpoint | Auth |
|---|---|---|
| GET | `/api/users/me` | Session |
| PATCH | `/api/users/me` | Session |

### Projects
| Method | Endpoint | Role |
|---|---|---|
| GET | `/api/projects` | Any member |
| POST | `/api/projects` | Any auth user |
| GET | `/api/projects/:id` | Project member |
| PATCH | `/api/projects/:id` | Admin |
| DELETE | `/api/projects/:id` | Admin |

### Members
| Method | Endpoint | Role |
|---|---|---|
| GET | `/api/projects/:id/members` | Member |
| POST | `/api/projects/:id/members` | Admin |
| PATCH | `/api/projects/:id/members/:uid` | Admin |
| DELETE | `/api/projects/:id/members/:uid` | Admin |

### Tasks
| Method | Endpoint | Role |
|---|---|---|
| GET | `/api/projects/:id/tasks` | Member (with filters) |
| POST | `/api/projects/:id/tasks` | Member |
| GET | `/api/projects/:id/tasks/:tid` | Member |
| PATCH | `/api/projects/:id/tasks/:tid` | Admin or Assignee |
| DELETE | `/api/projects/:id/tasks/:tid` | Admin |

**Task query params:** `?status=` `?priority=` `?assigneeId=` `?overdue=true` `?search=` `?sort=` `?order=`

### Dashboard
| Method | Endpoint | Auth |
|---|---|---|
| GET | `/api/dashboard` | Session |

---

## RBAC Matrix

| Action | Admin | Member |
|---|---|---|
| Create/Delete/Edit project | ✅ | ❌ |
| Invite / Remove members | ✅ | ❌ |
| Change member roles | ✅ | ❌ |
| Create task | ✅ | ✅ |
| Assign task | ✅ | ❌ |
| Update task status | ✅ | ✅ (own tasks only) |
| Delete task | ✅ | ❌ |
| View dashboard | ✅ | ✅ (own scope) |

> Role is **project-scoped**: same user can be Admin on Project A and Member on Project B.

---

## Validation (Zod)

All schemas live in `lib/validations/` and are shared by API routes + React Hook Form:

```ts
// lib/validations/task.ts
export const CreateTaskSchema = z.object({
  title:       z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  status:      z.nativeEnum(TaskStatus).default("TODO"),
  priority:    z.nativeEnum(Priority).default("MEDIUM"),
  dueDate:     z.string().datetime().optional().nullable(),
  assigneeId:  z.string().cuid().optional().nullable(),
});
```

Standard error response:
```json
{ "error": "Validation failed", "issues": [{ "field": "title", "message": "Required" }] }
```

HTTP codes: `400` validation · `401` unauthenticated · `403` forbidden · `404` not found · `409` conflict · `500` server error

---

## Design System (CSS Tokens)

```css
:root {
  --color-bg:            #ffffff;
  --color-bg-alt:        #f6f5f4;
  --color-text:          rgba(0,0,0,0.95);
  --color-text-secondary:#615d59;
  --color-text-muted:    #a39e98;
  --color-border:        rgba(0,0,0,0.1);
  --color-primary:       #0075de;
  --color-primary-hover: #005bab;
  --color-focus:         #097fe8;
  --color-success:       #1aae39;
  --color-warning:       #dd5b00;
  --color-danger:        #e53e3e;

  --shadow-card: rgba(0,0,0,0.04) 0px 4px 18px,
                 rgba(0,0,0,0.027) 0px 2.025px 7.85px,
                 rgba(0,0,0,0.02) 0px 0.8px 2.93px,
                 rgba(0,0,0,0.01) 0px 0.175px 1.04px;
  --shadow-deep: rgba(0,0,0,0.01) 0px 1px 3px,
                 rgba(0,0,0,0.02) 0px 3px 7px,
                 rgba(0,0,0,0.04) 0px 14px 28px,
                 rgba(0,0,0,0.05) 0px 23px 52px;

  --radius-xs:   4px;
  --radius-sm:   8px;
  --radius-md:   12px;
  --radius-lg:   16px;
  --radius-pill: 9999px;
}
```

**Typography** — Inter Variable (Google Fonts):
- Display `64px` wt 700 ls `-2px`
- Section heading `48px` wt 700 ls `-1.5px`
- Card title `22px` wt 700 ls `-0.25px`
- Body `16px` wt 400 lh `1.5`
- Caption `14px` wt 500
- Badge `12px` wt 600 ls `0.125px`

**Framer Motion patterns:**
```tsx
// Page enter
{ initial:{opacity:0,y:16}, animate:{opacity:1,y:0}, transition:{duration:0.3,ease:"easeOut"} }

// Card stagger (index = card position)
{ transition:{ delay: index * 0.04, duration:0.25 } }

// Modal spring
{ initial:{opacity:0,scale:0.96}, animate:{opacity:1,scale:1},
  exit:{opacity:0,scale:0.96}, transition:{type:"spring",stiffness:400,damping:30} }

// Optimistic drag (Framer Motion drag + layout animations)
// useOptimistic hook for status rollback
```

---

## Page Structure

```
app/
├── (auth)/
│   ├── login/page.tsx          Login form + "Contact admin to reset password"
│   └── register/page.tsx       Register form
└── (app)/
    ├── layout.tsx              Sidebar + Topbar shell
    ├── dashboard/page.tsx      Metrics, charts, my tasks, overdue
    ├── projects/
    │   ├── page.tsx            Project grid
    │   ├── new/page.tsx        Create project
    │   └── [id]/
    │       ├── page.tsx        Kanban board (30s polling)
    │       ├── tasks/page.tsx  Task list + filters
    │       ├── members/page.tsx Member management
    │       └── settings/page.tsx Edit / danger zone (Admin only)
    └── profile/page.tsx        User settings
```

---

## File Tree

```
team-task-manager/
├── app/               (pages + API routes)
├── components/
│   ├── ui/            Button Badge Input Modal Tooltip Avatar
│   ├── layout/        Sidebar Topbar Shell
│   ├── dashboard/     MetricCard TaskChart OverdueList
│   ├── projects/      ProjectCard KanbanBoard KanbanColumn TaskCard
│   ├── tasks/         TaskForm TaskTable TaskFilters
│   └── members/       MemberCard InviteModal
├── lib/
│   ├── auth.ts        NextAuth config
│   ├── db.ts          Prisma singleton
│   ├── validations/   Zod schemas
│   └── utils.ts       cn() formatDate() avatarColor()
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── styles/globals.css
├── middleware.ts      Route protection
├── .env.local         ← never commit
├── .gitignore
├── railway.json
├── README.md
└── GEMINI.md
```

---

## Implementation Phases

### Phase 1 — Scaffold & Database (1.5 hrs)
- `npx create-next-app@latest ./` (TypeScript, App Router, no Tailwind)
- Install: `prisma @prisma/client next-auth bcryptjs zod framer-motion recharts lucide-react`
- Write `prisma/schema.prisma`, run `prisma migrate dev --name init`
- Write `prisma/seed.ts` (2 users, 2 projects, 10 tasks)
- Create `GEMINI.md`

### Phase 2 — Auth (1 hr)
- NextAuth v5 config: Credentials provider + bcrypt verify
- `POST /api/auth/register` with Zod + password hash
- `middleware.ts` protecting `(app)/*`
- Login + Register pages with Framer Motion page-enter animation
- "Contact admin to reset password" note on login

### Phase 3 — REST APIs (2 hrs)
- Projects CRUD
- Members CRUD (invite by email)
- Tasks CRUD (with full filter/sort query params)
- Dashboard aggregation
- Shared error handler utility

### Phase 4 — Design System & UI Components (1.5 hrs)
- `globals.css` CSS custom properties
- Base components: Button, Badge, Input, Modal, Avatar (initials), Tooltip
- Layout: Sidebar, Topbar, responsive shell
- Skeleton loaders in Notion style

### Phase 5 — App Pages (3 hrs)
- Dashboard: 4 metric cards + donut chart + line chart + overdue list
- Project grid
- **Kanban board**: Framer Motion drag-and-drop, optimistic status update, 30s polling
- Task list with filters + inline status update
- Members page (Admin RBAC controls)
- Project settings + delete danger zone
- Profile page

### Phase 6 — Polish (1 hr)
- Server-side RBAC guards on all mutation endpoints
- Client-side conditional rendering (hide Admin UI from Members)
- Empty states on all views
- Toast notifications (success/error)
- Reduced-motion support (`prefers-reduced-motion`)
- Mobile responsive (hamburger sidebar)

### Phase 7 — Deploy (1 hr)
- Push to GitHub public repo
- Railway: link repo + attach PostgreSQL plugin
- Set env vars in Railway Variables tab (see Prerequisites §6)
- First deploy: run `prisma migrate deploy && prisma db seed`
- Smoke test live URL

### Phase 8 — Submission (0.5 hr)
- Record 2–5 min demo video (Loom or OBS)
- Final README with live URL, GitHub link, setup steps, AI tools used
- Submit live URL + GitHub + README + video

---

## Verification Plan

### Build checks
```bash
npx tsc --noEmit          # zero TypeScript errors
npx prisma validate       # schema integrity
npm run build             # production build passes
```

### Manual QA
- [ ] Register → Login → Dashboard renders correctly
- [ ] Admin: create project → invite member by email → create + assign task
- [ ] Member: cannot create project, cannot delete others' tasks, can update own task status
- [ ] Kanban: drag card column-to-column → DB status updated (verify via task list)
- [ ] Optimistic rollback: simulate offline → drag card → confirm UI reverts
- [ ] 30s polling: update task in DB externally → board reflects after ≤30s
- [ ] Dashboard charts match actual task counts
- [ ] Overdue tasks show warning highlight and appear in overdue widget
- [ ] All forms show inline Zod validation errors on blur
- [ ] Mobile: sidebar collapses, all pages usable at 375px
- [ ] Live Railway URL accessible with seed data

---

## Submission Checklist
- [ ] Live Railway URL
- [ ] Public GitHub repository
- [ ] README.md / README.txt (setup, dev approach, AI tools, future improvements)
- [ ] Demo video 2–5 min (MP4 or Loom link)
