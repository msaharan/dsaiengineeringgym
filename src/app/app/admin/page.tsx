import Link from "next/link";
import { getServerSession } from "next-auth";

import AdminAuthoring from "@/components/admin/AdminAuthoring";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isAdminEmail } from "@/lib/admin";

type AdminPageProps = {
  searchParams?: Promise<{
    created?: string;
    error?: string;
  }>;
};

const createdMessages: Record<string, string> = {
  course: "Course created.",
  module: "Module created.",
  lesson: "Lesson created.",
  flashcard: "Flashcard created.",
};

const errorMessages: Record<string, string> = {
  course: "Could not create course. Check slug uniqueness.",
  module: "Could not create module. Check course and slug.",
  lesson: "Could not create lesson. Check module and slug.",
  flashcard: "Could not create flashcard. Check lesson selection.",
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user || !isAdminEmail(user.email)) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
        <h1 className="text-2xl font-semibold text-slate-900">
          Admin access required
        </h1>
        <p className="text-sm text-slate-600">
          Your account is not allowlisted for admin authoring.
        </p>
        <Link
          href="/app/dashboard"
          className="text-sm font-semibold text-slate-700 transition hover:text-slate-900"
        >
          Back to dashboard
        </Link>
      </main>
    );
  }

  const courses = await prisma.course.findMany({
    orderBy: { title: "asc" },
    include: {
      modules: {
        orderBy: { position: "asc" },
        include: {
          lessons: {
            orderBy: { position: "asc" },
          },
        },
      },
    },
  });

  const resolvedParams = searchParams ? await searchParams : undefined;
  const createdMessage = resolvedParams?.created
    ? createdMessages[resolvedParams.created]
    : null;
  const errorMessage = resolvedParams?.error
    ? errorMessages[resolvedParams.error]
    : null;

  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.15),_transparent_55%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.15),_transparent_50%)]" />
      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Admin authoring
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">
            Create content
          </h1>
          <p className="text-sm text-slate-600">
            Add courses, modules, lessons, and flashcards directly into the
            database.
          </p>
        </header>

        <AdminAuthoring
          courses={courses}
          createdMessage={createdMessage}
          errorMessage={errorMessage}
        />
      </div>
    </main>
  );
}
