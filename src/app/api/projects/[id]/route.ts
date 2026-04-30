import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { logActivity } from "@/lib/activity";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { tasks: true, members: true },
        },
        members: {
          where: { userId: session.user.id },
          select: { role: true },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check if current user is actually a member
    if (project.members.length === 0) {
      return NextResponse.json({ error: "Access denied. You are not a member of this project." }, { status: 403 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("GET_PROJECT_BY_ID_ERROR", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const requester = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: session.user.id,
          projectId: params.id,
        },
      },
    });

    if (!requester || requester.role !== "ADMIN") {
      return NextResponse.json({ error: "Only admins can edit projects" }, { status: 403 });
    }

    const body = await req.json();
    const project = await prisma.project.update({
      where: { id: params.id },
      data: body,
    });

    await logActivity(session.user.id, "updated project", "Project", project.name, project.id);

    return NextResponse.json(project);
  } catch (error) {
    console.error("PATCH_PROJECT_ERROR", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const requester = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: session.user.id,
          projectId: params.id,
        },
      },
    });

    if (!requester || requester.role !== "ADMIN") {
      return NextResponse.json({ error: "Only admins can delete projects" }, { status: 403 });
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    await prisma.project.delete({
      where: { id: params.id },
    });

    await logActivity(session.user.id, "deleted project", "Project", project.name);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("DELETE_PROJECT_ERROR", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
