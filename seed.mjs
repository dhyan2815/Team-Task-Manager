import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  const user1 = await prisma.user.upsert({
    where: { email: "admin@ethara.ai" },
    update: {},
    create: {
      email: "admin@ethara.ai",
      name: "Admin User",
      password: hashedPassword,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "member@ethara.ai" },
    update: {},
    create: {
      email: "member@ethara.ai",
      name: "Member User",
      password: hashedPassword,
    },
  });

  console.log("Users created:", { user1, user2 });

  const project = await prisma.project.create({
    data: {
      name: "Ethara Launch",
      description: "Initial rollout of the Ethara AI task manager.",
      color: "#0075de",
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      members: {
        create: [
          { userId: user1.id, role: "ADMIN" },
          { userId: user2.id, role: "MEMBER" },
        ],
      },
    },
  });

  console.log("Project created:", project);

  const tasks = await prisma.task.createMany({
    data: [
      {
        title: "Setup Prisma schema",
        description: "Define all models and relationships.",
        status: "DONE",
        priority: "HIGH",
        projectId: project.id,
        createdById: user1.id,
        assigneeId: user1.id,
      },
      {
        title: "Implement Authentication",
        description: "Set up NextAuth and registration flow.",
        status: "IN_PROGRESS",
        priority: "URGENT",
        projectId: project.id,
        createdById: user1.id,
        assigneeId: user2.id,
      },
      {
        title: "Design Dashboard UI",
        description: "Create Notion-inspired stats and charts.",
        status: "TODO",
        priority: "MEDIUM",
        projectId: project.id,
        createdById: user1.id,
      },
    ],
  });

  console.log("Tasks created count:", tasks.count);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
