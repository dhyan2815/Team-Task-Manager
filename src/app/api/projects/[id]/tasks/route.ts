import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { z } from "zod";

const CreateTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]).default("TODO"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  dueDate: z.string().datetime().optional().nullable(),
  assigneeId: z.string().optional().nullable(),
});

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");

  try {
    const tasks = await prisma.task.findMany({
      where: {
        projectId: params.id,
        ...(status && { status: status as any }),
        ...(priority && { priority: priority as any }),
      },
      include: {
        assignee: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("GET_TASKS_ERROR", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validatedData = CreateTaskSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validatedData.error.flatten() },
        { status: 400 }
      );
    }

    const task = await prisma.task.create({
      data: {
        ...validatedData.data,
        dueDate: validatedData.data.dueDate ? new Date(validatedData.data.dueDate) : null,
        projectId: params.id,
        createdById: session.user.id,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("POST_TASK_ERROR", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
