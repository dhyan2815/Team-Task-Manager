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

    // Fetch all tasks where the user is either the assignee, the creator, 
    // or part of the project (if they have access to the project)
    // For "My Tasks", we usually show tasks assigned to the user or created by them.
    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { assigneeId: userId },
          { createdById: userId },
          {
            project: {
              members: {
                some: {
                  userId: userId
                }
              }
            }
          }
        ]
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        assignee: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        updatedAt: "desc"
      }
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("GET_TASKS_ERROR", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
