"use server";

import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { scheduleNext, type ReviewRating } from "@/lib/review";

const ratingValues: ReviewRating[] = ["AGAIN", "HARD", "GOOD", "EASY"];

export async function submitReview(flashcardId: string, rating: ReviewRating) {
  if (!ratingValues.includes(rating)) {
    throw new Error("Invalid rating");
  }

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("Not authenticated");
  }

  const now = new Date();

  const state = await prisma.userFlashcardState.upsert({
    where: {
      userId_flashcardId: {
        userId,
        flashcardId,
      },
    },
    create: {
      userId,
      flashcardId,
      dueAt: now,
      repetitions: 0,
      intervalDays: 0,
      easeFactor: 2.5,
    },
    update: {},
  });

  const nextState = scheduleNext(
    {
      repetitions: state.repetitions,
      intervalDays: state.intervalDays,
      easeFactor: state.easeFactor,
    },
    rating,
    now,
  );

  await prisma.userFlashcardState.update({
    where: { id: state.id },
    data: {
      repetitions: nextState.repetitions,
      intervalDays: nextState.intervalDays,
      easeFactor: nextState.easeFactor,
      dueAt: nextState.dueAt,
      lastReviewedAt: nextState.lastReviewedAt,
    },
  });

  await prisma.reviewLog.create({
    data: {
      userId,
      flashcardId,
      rating,
      reviewedAt: now,
      intervalDays: nextState.intervalDays,
      easeFactor: nextState.easeFactor,
    },
  });

  return {
    nextDueAt: nextState.dueAt.toISOString(),
    intervalDays: nextState.intervalDays,
    repetitions: nextState.repetitions,
  };
}
