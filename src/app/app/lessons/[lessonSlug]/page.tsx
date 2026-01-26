import Link from "next/link";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";

import Markdown from "@/components/content/Markdown";
import LessonFlashcardReview from "@/components/flashcards/LessonFlashcardReview";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

type LessonPageProps = {
  params: Promise<{
    lessonSlug: string;
  }>;
};

export default async function LessonPage({ params }: LessonPageProps) {
  const { lessonSlug } = await params;
  const lesson = await prisma.lesson.findUnique({
    where: { slug: lessonSlug },
    include: {
      module: {
        include: {
          course: true,
        },
      },
      flashcards: {
        orderBy: { position: "asc" },
      },
    },
  });

  if (!lesson) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  let lessonStatus: "IN_PROGRESS" | "COMPLETED" | null = null;

  if (userId) {
    const now = new Date();
    const existingProgress = await prisma.lessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId: lesson.id,
        },
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!existingProgress) {
      await prisma.lessonProgress.create({
        data: {
          userId,
          lessonId: lesson.id,
          status: "IN_PROGRESS",
          startedAt: now,
          lastOpenedAt: now,
        },
      });
      lessonStatus = "IN_PROGRESS";
    } else {
      await prisma.lessonProgress.update({
        where: { id: existingProgress.id },
        data: {
          lastOpenedAt: now,
          status:
            existingProgress.status === "COMPLETED"
              ? "COMPLETED"
              : "IN_PROGRESS",
        },
      });
      lessonStatus =
        existingProgress.status === "COMPLETED" ? "COMPLETED" : "IN_PROGRESS";
    }
  }

  const lessonContent = lesson.contentMd?.trim();

  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,116,144,0.18),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(251,191,36,0.2),_transparent_50%)]" />
      <div className="relative mx-auto flex w-full max-w-4xl flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-slate-600 animate-[fade-in_0.6s_ease-out]">
          <Link
            href={`/app/courses/${lesson.module.course.slug}`}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:text-slate-900"
          >
            <span aria-hidden="true">{"<-"}</span>
            Back to course
          </Link>
          <div className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 shadow-sm">
            Module {lesson.module.position || 1}
          </div>
        </div>

        <header className="space-y-3 animate-[fade-in_0.6s_ease-out]">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Lesson
            </p>
            {lessonStatus ? (
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                {lessonStatus === "COMPLETED" ? "Completed" : "In progress"}
              </span>
            ) : null}
          </div>
          <h1 className="text-3xl font-semibold text-slate-900">
            {lesson.title}
          </h1>
          {lesson.summary ? (
            <p className="text-sm text-slate-600">{lesson.summary}</p>
          ) : null}
        </header>

        <article className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm text-sm text-slate-700 animate-[rise-in_0.6s_ease-out_forwards] opacity-0">
          {lessonContent ? (
            <Markdown content={lessonContent} />
          ) : (
            <p>Lesson content is coming soon.</p>
          )}
        </article>

        <section
          className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm text-sm text-slate-600 animate-[rise-in_0.6s_ease-out_forwards] opacity-0"
          style={{ animationDelay: "120ms" }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-slate-900">
              Flashcards
            </h2>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              {lesson.flashcards.length} card
              {lesson.flashcards.length === 1 ? "" : "s"}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Flip through the cards below to reinforce this lesson.
          </p>
          <LessonFlashcardReview
            lessonId={lesson.id}
            flashcards={lesson.flashcards}
          />
        </section>
      </div>
    </main>
  );
}
