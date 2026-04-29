import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { z } from "zod";

const CreateProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).default("#0075de"),
  dueDate: z.string().datetime().optional().nullable(),
});

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const projects = await prisma.project.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        _count: {
          select: { tasks: true, members: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("GET_PROJECTS_ERROR", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validatedData = CreateProjectSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validatedData.error.flatten() },
        { status: 400 }
      );
    }

    const { name, description, color, dueDate } = validatedData.data;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        color,
        dueDate: dueDate ? new Date(dueDate) : null,
        members: {
          create: {
            userId: session.user.id,
            role: "ADMIN",
          },
        },
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("POST_PROJECT_ERROR", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
