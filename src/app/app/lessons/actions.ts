"use server";

import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function completeLesson(lessonId: string) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("Not authenticated");
  }

  const now = new Date();

  await prisma.lessonProgress.upsert({
    where: {
      userId_lessonId: {
        userId,
        lessonId,
      },
    },
    create: {
      userId,
      lessonId,
      status: "COMPLETED",
      startedAt: now,
      lastOpenedAt: now,
      completedAt: now,
    },
    update: {
      status: "COMPLETED",
      lastOpenedAt: now,
      completedAt: now,
    },
  });
}
