import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { z } from "zod";

const AddMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
});

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const members = await prisma.projectMember.findMany({
      where: { projectId: params.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { joinedAt: "asc" },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error("GET_MEMBERS_ERROR", error);
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
    const validatedData = AddMemberSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validatedData.error.flatten() },
        { status: 400 }
      );
    }

    // 1. Check if the requester is an ADMIN of this project
    const requester = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: session.user.id,
          projectId: params.id,
        },
      },
    });

    if (!requester || requester.role !== "ADMIN") {
      return NextResponse.json({ error: "Only admins can add members" }, { status: 403 });
    }

    const { email, role } = validatedData.data;

    // Check if user exists
    const userToAdd = await prisma.user.findUnique({ where: { email } });
    if (!userToAdd) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if already a member
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: userToAdd.id,
          projectId: params.id,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json({ error: "User is already a member" }, { status: 409 });
    }

    const member = await prisma.projectMember.create({
      data: {
        userId: userToAdd.id,
        projectId: params.id,
        role,
      },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error("POST_MEMBER_ERROR", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
