import prisma from "@/lib/db";

export async function logActivity(
  userId: string,
  action: string,
  entityType: string,
  entityTitle: string,
  projectId?: string
) {
  try {
    await prisma.activity.create({
      data: {
        userId,
        action,
        entityType,
        entityTitle,
        ...(projectId ? { projectId } : {}),
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}
