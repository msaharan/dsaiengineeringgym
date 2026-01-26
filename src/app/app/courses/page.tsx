import Link from "next/link";

import { prisma } from "@/lib/db";

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    orderBy: { title: "asc" },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      _count: {
        select: { modules: true },
      },
    },
  });

  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.18),_transparent_55%),radial-gradient(circle_at_top_right,_rgba(251,191,36,0.18),_transparent_45%)]" />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10">
        <header className="flex flex-wrap items-end justify-between gap-6 animate-[fade-in_0.6s_ease-out]">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Course library
            </p>
            <h1 className="text-3xl font-semibold text-slate-900">
              Pick your next workout
            </h1>
            <p className="text-sm text-slate-600">
              Each course bundles focused lessons and flashcards so you can
              build momentum fast.
            </p>
          </div>
          <div className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 shadow-sm">
            {courses.length} course{courses.length === 1 ? "" : "s"}
          </div>
        </header>

        {courses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-10 text-center text-sm text-slate-600">
            No courses yet. Run the seed script to load starter content.
          </div>
        ) : (
          <section className="grid gap-6 md:grid-cols-2">
            {courses.map((course, index) => {
              const moduleCount = course._count.modules;
              return (
                <Link
                  key={course.id}
                  href={`/app/courses/${course.slug}`}
                  className="group rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md opacity-0 animate-[rise-in_0.6s_ease-out_forwards]"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="flex h-full flex-col gap-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="h-1 w-10 rounded-full bg-[color:var(--accent)]" />
                        <h2 className="mt-4 text-xl font-semibold text-slate-900">
                          {course.title}
                        </h2>
                      </div>
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                        {moduleCount} module{moduleCount === 1 ? "" : "s"}
                      </span>
                    </div>
                    {course.description ? (
                      <p className="text-sm text-slate-600">
                        {course.description}
                      </p>
                    ) : null}
                    <div className="mt-auto text-sm font-semibold text-slate-700 group-hover:text-slate-900">
                      Open course
                    </div>
                  </div>
                </Link>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}
