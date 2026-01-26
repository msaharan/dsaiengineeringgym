import Link from "next/link";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  const lastProgress = user?.id
    ? await prisma.lessonProgress.findFirst({
        where: { userId: user.id },
        orderBy: { lastOpenedAt: "desc" },
        select: {
          status: true,
          lastOpenedAt: true,
          lesson: {
            select: {
              title: true,
              slug: true,
              module: {
                select: {
                  title: true,
                  course: {
                    select: {
                      title: true,
                    },
                  },
                },
              },
            },
          },
        },
      })
    : null;
  const dueCount = user?.id
    ? await prisma.userFlashcardState.count({
        where: {
          userId: user.id,
          dueAt: { lte: new Date() },
          suspended: false,
        },
      })
    : 0;
  const startedLessons = user?.id
    ? await prisma.lessonProgress.count({
        where: {
          userId: user.id,
        },
      })
    : 0;
  const completedLessons = user?.id
    ? await prisma.lessonProgress.count({
        where: {
          userId: user.id,
          status: "COMPLETED",
        },
      })
    : 0;
  const progressPercent =
    startedLessons === 0
      ? 0
      : Math.round((completedLessons / startedLessons) * 100);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12">
      <header className="space-y-3 animate-[fade-in_0.6s_ease-out]">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
          Dashboard
        </p>
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">
            Welcome{user?.name ? `, ${user.name}` : ""}.
          </h1>
          {user?.email ? (
            <p className="mt-2 text-sm text-slate-600">{user.email}</p>
          ) : null}
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <div
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm opacity-0 animate-[rise-in_0.6s_ease-out_forwards]"
          style={{ animationDelay: "0ms" }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">
              {lastProgress ? "Continue learning" : "Your learning gym is warming up"}
            </h2>
            {lastProgress?.status ? (
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                {lastProgress.status === "COMPLETED" ? "Completed" : "In progress"}
              </span>
            ) : null}
          </div>
          {lastProgress ? (
            <>
              <p className="mt-2 text-sm text-slate-600">
                Resume{" "}
                <span className="font-semibold text-slate-700">
                  {lastProgress.lesson.title}
                </span>{" "}
                in {lastProgress.lesson.module.title}.
              </p>
              <Link
                href={`/app/lessons/${lastProgress.lesson.slug}`}
                className="mt-5 inline-flex items-center justify-center rounded-md bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Continue lesson
              </Link>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                {lastProgress.lesson.module.course.title}
              </p>
            </>
          ) : (
            <>
              <p className="mt-2 text-sm text-slate-600">
                Start with the first course and build a consistent cadence.
              </p>
              <Link
                href="/app/courses"
                className="mt-5 inline-flex items-center justify-center rounded-md bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Browse courses
              </Link>
            </>
          )}
        </div>

        <div
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm opacity-0 animate-[rise-in_0.6s_ease-out_forwards]"
          style={{ animationDelay: "140ms" }}
        >
          <h2 className="text-lg font-semibold text-slate-900">
            Review your flashcards
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {dueCount} card{dueCount === 1 ? "" : "s"} due right now.
          </p>
          <Link
            href="/app/review"
            className="mt-5 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
          >
            Start review
          </Link>
        </div>

        <div
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm opacity-0 animate-[rise-in_0.6s_ease-out_forwards]"
          style={{ animationDelay: "280ms" }}
        >
          <h2 className="text-lg font-semibold text-slate-900">
            Progress snapshot
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {completedLessons} of {startedLessons} lesson
            {startedLessons === 1 ? "" : "s"} completed.
          </p>
          <div className="mt-4 h-2 w-full rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-[color:var(--accent)] transition-[width]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">
            {progressPercent}% complete
          </p>
        </div>
      </section>
    </main>
  );
}
