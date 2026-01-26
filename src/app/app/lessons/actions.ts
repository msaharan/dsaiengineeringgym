"use server";

import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const lessonStatuses = ["IN_PROGRESS", "COMPLETED"] as const;
type LessonStatus = (typeof lessonStatuses)[number];

export async function setLessonStatus(
  lessonId: string,
  status: LessonStatus,
) {
  if (!lessonStatuses.includes(status)) {
    throw new Error("Invalid lesson status");
  }

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
      status,
      startedAt: now,
      lastOpenedAt: now,
      completedAt: status === "COMPLETED" ? now : null,
    },
    update: {
      status,
      lastOpenedAt: now,
      completedAt: status === "COMPLETED" ? now : null,
    },
  });
}

export async function completeLesson(lessonId: string) {
  return setLessonStatus(lessonId, "COMPLETED");
}
