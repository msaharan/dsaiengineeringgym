import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import ReviewSession from "@/components/review/ReviewSession";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const REVIEW_LIMIT = 20;

async function ensureUserFlashcardStates(userId: string) {
  const missingCards = await prisma.flashcard.findMany({
    where: {
      states: {
        none: { userId },
      },
    },
    select: { id: true },
  });

  if (missingCards.length === 0) {
    return;
  }

  const now = new Date();

  await prisma.userFlashcardState.createMany({
    data: missingCards.map((card) => ({
      userId,
      flashcardId: card.id,
      dueAt: now,
    })),
    skipDuplicates: true,
  });
}

export default async function ReviewPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/auth/sign-in");
  }

  await ensureUserFlashcardStates(userId);

  const now = new Date();
  const dueStates = await prisma.userFlashcardState.findMany({
    where: {
      userId,
      dueAt: { lte: now },
      suspended: false,
    },
    include: {
      flashcard: {
        include: {
          lesson: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
      },
    },
    orderBy: { dueAt: "asc" },
    take: REVIEW_LIMIT,
  });

  const lessonIds = Array.from(
    new Set(dueStates.map((state) => state.flashcard.lesson.id)),
  );
  const progressByLesson = new Map<string, "IN_PROGRESS" | "COMPLETED">();

  if (lessonIds.length > 0) {
    const progress = await prisma.lessonProgress.findMany({
      where: {
        userId,
        lessonId: { in: lessonIds },
      },
      select: {
        lessonId: true,
        status: true,
      },
    });

    progress.forEach((entry) => {
      if (entry.status === "IN_PROGRESS" || entry.status === "COMPLETED") {
        progressByLesson.set(entry.lessonId, entry.status);
      }
    });
  }

  const queue = dueStates.map((state) => ({
    flashcardId: state.flashcardId,
    frontMd: state.flashcard.frontMd,
    backMd: state.flashcard.backMd,
    lesson: {
      id: state.flashcard.lesson.id,
      title: state.flashcard.lesson.title,
      slug: state.flashcard.lesson.slug,
      status: progressByLesson.get(state.flashcard.lesson.id) ?? null,
    },
  }));

  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.16),_transparent_55%),radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.16),_transparent_50%)]" />
      <div className="relative mx-auto flex w-full max-w-4xl flex-col gap-8">
        <header className="space-y-3 animate-[fade-in_0.6s_ease-out]">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Review
          </p>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">
                Flashcard session
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Rate each card to schedule the next review.
              </p>
            </div>
            <div className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 shadow-sm">
              {queue.length} due now
            </div>
          </div>
        </header>

        <ReviewSession queue={queue} />

        <div className="text-sm text-slate-500">
          Want more content?{" "}
          <Link
            href="/app/courses"
            className="font-semibold text-slate-700 transition hover:text-slate-900"
          >
            Browse courses
          </Link>
          .
        </div>
      </div>
    </main>
  );
}
