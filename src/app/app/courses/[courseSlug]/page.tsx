import Link from "next/link";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

type CoursePageProps = {
  params: Promise<{
    courseSlug: string;
  }>;
};

export default async function CoursePage({ params }: CoursePageProps) {
  const { courseSlug } = await params;
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
    include: {
      modules: {
        orderBy: { position: "asc" },
        include: {
          lessons: {
            orderBy: { position: "asc" },
            select: {
              id: true,
              title: true,
              summary: true,
              slug: true,
            },
          },
          _count: {
            select: { lessons: true },
          },
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  const lessonIds = course.modules.flatMap((module) =>
    module.lessons.map((lesson) => lesson.id),
  );
  const progressByLesson = new Map<string, "IN_PROGRESS" | "COMPLETED">();

  if (userId && lessonIds.length > 0) {
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

  const totalLessons = course.modules.reduce(
    (sum, module) => sum + module._count.lessons,
    0,
  );

  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_55%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.18),_transparent_50%)]" />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-slate-600 animate-[fade-in_0.6s_ease-out]">
          <Link
            href="/app/courses"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:text-slate-900"
          >
            <span aria-hidden="true">{"<-"}</span>
            Back to courses
          </Link>
          <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 shadow-sm">
            <span>{course.modules.length} modules</span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span>{totalLessons} lessons</span>
          </div>
        </div>

        <header className="space-y-4 animate-[fade-in_0.6s_ease-out]">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Course
          </p>
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">
              {course.title}
            </h1>
            {course.description ? (
              <p className="mt-3 text-sm text-slate-600">
                {course.description}
              </p>
            ) : null}
          </div>
        </header>

        {course.modules.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-10 text-center text-sm text-slate-600">
            No modules yet. Add modules to build out this course.
          </div>
        ) : (
          <section className="space-y-6">
            {course.modules.map((module, index) => (
              <article
                key={module.id}
                className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm opacity-0 animate-[rise-in_0.6s_ease-out_forwards]"
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      Module {module.position || index + 1}
                    </p>
                    <h2 className="mt-2 text-xl font-semibold text-slate-900">
                      {module.title}
                    </h2>
                    {module.description ? (
                      <p className="mt-2 text-sm text-slate-600">
                        {module.description}
                      </p>
                    ) : null}
                  </div>
                  <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800">
                    {module._count.lessons} lesson
                    {module._count.lessons === 1 ? "" : "s"}
                  </span>
                </div>

                {module.lessons.length > 0 ? (
                  <ul className="mt-5 space-y-3 text-sm text-slate-600">
                    {module.lessons.map((lesson) => (
                      <li key={lesson.id}>
                        <Link
                          href={`/app/lessons/${lesson.slug}`}
                          className="group flex gap-3 rounded-lg border border-transparent px-2 py-2 transition hover:border-slate-200 hover:bg-slate-50"
                        >
                          <span className="mt-2 h-2 w-2 rounded-full bg-slate-300" />
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-medium text-slate-800 transition group-hover:text-slate-900">
                                {lesson.title}
                              </p>
                              {progressByLesson.has(lesson.id) ? (
                                <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                  {progressByLesson.get(lesson.id) === "COMPLETED"
                                    ? "Completed"
                                    : "In progress"}
                                </span>
                              ) : null}
                            </div>
                            {lesson.summary ? (
                              <p className="mt-1 text-xs text-slate-500">
                                {lesson.summary}
                              </p>
                            ) : null}
                            <span className="mt-2 inline-flex text-xs font-semibold text-slate-500 group-hover:text-slate-700">
                              Open lesson
                            </span>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-5 text-sm text-slate-500">
                    Lessons are coming soon for this module.
                  </p>
                )}
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
