import Link from "next/link";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  const dueCount = user?.id
    ? await prisma.userFlashcardState.count({
        where: {
          userId: user.id,
          dueAt: { lte: new Date() },
          suspended: false,
        },
      })
    : 0;

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
          <h2 className="text-lg font-semibold text-slate-900">
            Your learning gym is warming up
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Start with the first course and build a consistent cadence.
          </p>
          <Link
            href="/app/courses"
            className="mt-5 inline-flex items-center justify-center rounded-md bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Browse courses
          </Link>
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
      </section>
    </main>
  );
}
