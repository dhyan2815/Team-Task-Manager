import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id;

    // 1. Task Counts
    const taskCounts = await prisma.task.groupBy({
      by: ["status"],
      where: {
        OR: [
          { assigneeId: userId },
          { createdById: userId }
        ]
      },
      _count: true,
    });

    // 2. Overdue Tasks Count
    const overdueTasksCount = await prisma.task.count({
      where: {
        assigneeId: userId,
        status: { not: "DONE" },
        dueDate: { lt: new Date() },
      }
    });

    // 3. Recent Tasks
    const recentTasks = await prisma.task.findMany({
      where: {
        OR: [
          { assigneeId: userId },
          { createdById: userId }
        ]
      },
      include: {
        project: { select: { name: true, color: true } }
      },
      orderBy: { updatedAt: "desc" },
      take: 20
    });

    // 4. Recent Activity logs
    const activities = await prisma.activity.findMany({
      where: {
        OR: [
          { userId },
          { project: { members: { some: { userId } } } }
        ]
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        user: { select: { name: true, email: true } },
        project: { select: { name: true, color: true } }
      }
    });

    return NextResponse.json({
      taskCounts: taskCounts.reduce((acc: Record<string, number>, curr: { status: string; _count: number }) => {
        acc[curr.status] = curr._count;
        return acc;
      }, {} as Record<string, number>),
      overdueTasksCount,
      recentTasks,
      activities,
    });
  } catch (error) {
    console.error("GET_DASHBOARD_ERROR", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
