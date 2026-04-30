# Ethara AI — Team Task Manager

A full-stack task management app built for teams that need to stay organized without the bloat. Think Notion meets Jira, but without the learning curve.

---

## What this actually is

Ethara AI is a collaborative project management tool. You create projects, invite people to them, and track work through a Kanban board. Everyone on your team can see what's in progress, what's done, and what's been sitting in "To Do" since last week.

There's a built-in activity feed so nothing gets lost quietly. If someone creates, updates, or deletes something — it shows up on the dashboard.

---

## Who it's for

Teams that find Trello too simple but Jira too overwhelming. It works well for:

- Small dev teams shipping a product
- Freelancers managing multiple clients
- Startup teams with 2–20 people who need structure without spending time on setup

If you're tracking work in a shared Notion doc or a Google Sheet, this is the natural next step.

---

## What you get out of it

**Kanban board with drag-and-drop** — move tasks between columns (To Do, In Progress, In Review, Done) and the status updates instantly. No refresh needed.

**Role-based access** — when you create a project, you're the Admin. You can invite others as Members. Admins can edit projects, manage members, and delete tasks. Members can create and move their own tasks.

**Dashboard** — shows your active tasks, total counts, and a live feed of what your team has been up to.

**Activity log** — every meaningful action (task created, project updated, member added) gets logged automatically so there's a record.

**Search** — filter tasks across the board or globally from the top bar.

---

## A real example

Say you're running a small team building a landing page redesign. You create a project called "Website Relaunch" and set the color to red so it's easy to spot in the sidebar.

You invite your designer (she becomes a Member) and your content writer (also a Member). You're the Admin.

You add tasks: *"Design hero section"*, *"Write copy for features page"*, *"QA on mobile"*. You assign the design task to your designer and the copy task to your writer.

Your designer drags "Design hero section" into In Progress when she starts. Later she moves it to In Review. You check the dashboard in the morning — there's the activity: *"Sarah updated task: Design hero section"* with a timestamp.

When everything's in Done, you close the project. The whole workflow from kickoff to completion happened inside one tool without a single Slack thread of "hey, what's the status on X?"

---

## How to run it locally

**Requirements:** Node.js 18+, a PostgreSQL database (Railway works great)

```bash
# Clone and install
git clone <your-repo-url>
cd ethara-ai
npm install
```

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DBNAME"
NEXTAUTH_SECRET="your-generated-secret"
NEXTAUTH_URL="http://localhost:3000"
```

To generate a secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Then run migrations and seed some demo data:

```bash
npx prisma migrate deploy
npx prisma db seed
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You can register a new account or use the seed credentials:

- **Admin:** `admin@ethara.ai` / `password123`
- **Member:** `member@ethara.ai` / `password123`

---

## Project structure

```
src/
├── app/
│   ├── (auth)/         # Login and Register pages
│   ├── (app)/          # Dashboard, Projects, Tasks, Members, Settings
│   ├── api/            # REST API routes
│   └── features/       # Public-facing features page
├── components/
│   ├── layout/         # Sidebar, Topbar, Shell
│   └── ui/             # Button, Card, Badge, Modal, AccessDenied
├── lib/
│   ├── auth.ts         # NextAuth config
│   ├── db.ts           # Prisma client
│   ├── activity.ts     # Activity logging helper
│   └── validations/    # Zod schemas
prisma/
├── schema.prisma       # Database models
└── seed.mjs            # Demo data
```

---

## Tech used

| What | Why |
|---|---|
| Next.js 14 (App Router) | Full-stack framework, handles routing and API |
| PostgreSQL + Prisma | Reliable relational DB with type-safe queries |
| NextAuth v5 | Authentication with JWT sessions |
| Framer Motion | Smooth animations without the setup overhead |
| Zod | Schema validation on both the API and form level |

---

## End state

The goal of this project is a team that can spin it up, invite their people, and start shipping work the same day. There's no onboarding wizard, no empty dashboards with upsell prompts, and no required credit card. You register, create a project, and you're working.

It's not trying to replace enterprise tools. It's trying to be the thing you actually use.
