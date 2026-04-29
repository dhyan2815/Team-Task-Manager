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

    // Find all projects the user belongs to
    const myProjects = await prisma.projectMember.findMany({
      where: { userId },
      select: { projectId: true },
    });

    const projectIds = myProjects.map((p) => p.projectId);

    // Find all unique users in those projects
    const members = await prisma.projectMember.findMany({
      where: {
        projectId: { in: projectIds },
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        project: { select: { name: true } },
      },
      orderBy: { joinedAt: "desc" },
    });

    // Map to a cleaner format (one entry per user-project combo)
    const formattedMembers = members.map((m) => ({
      id: `${m.userId}-${m.projectId}`,
      name: m.user.name,
      email: m.user.email,
      role: m.role,
      projectName: m.project.name,
    }));

    return NextResponse.json(formattedMembers);
  } catch (error) {
    console.error("GET_ALL_MEMBERS_ERROR", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
