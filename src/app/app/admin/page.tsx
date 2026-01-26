import Link from "next/link";
import { getServerSession } from "next-auth";

import {
  createCourse,
  createFlashcard,
  createLesson,
  createModule,
} from "@/app/app/admin/actions";
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
          {createdMessage ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
              {createdMessage}
            </div>
          ) : null}
          {errorMessage ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
              {errorMessage}
            </div>
          ) : null}
        </header>

        <section className="grid gap-6 lg:grid-cols-2">
          <form
            action={createCourse}
            className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-slate-900">
              Create course
            </h2>
            <label className="block text-sm font-semibold text-slate-700">
              Title
              <input
                name="title"
                required
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900"
                placeholder="ML Systems Foundations"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Slug
              <input
                name="slug"
                required
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900"
                placeholder="ml-systems-foundations"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Description
              <textarea
                name="description"
                rows={3}
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900"
                placeholder="Core concepts for training, serving, and operating ML systems."
              />
            </label>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Create course
            </button>
          </form>

          <form
            action={createModule}
            className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-slate-900">
              Create module
            </h2>
            <label className="block text-sm font-semibold text-slate-700">
              Course
              <select
                name="courseId"
                required
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900"
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Title
              <input
                name="title"
                required
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900"
                placeholder="Intro to ML Systems"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Slug
              <input
                name="slug"
                required
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900"
                placeholder="intro-to-ml-systems"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Position
              <input
                name="position"
                type="number"
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900"
                placeholder="1"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Description
              <textarea
                name="description"
                rows={3}
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900"
                placeholder="How ML systems differ from traditional software systems."
              />
            </label>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Create module
            </button>
          </form>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <form
            action={createLesson}
            className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-slate-900">
              Create lesson
            </h2>
            <label className="block text-sm font-semibold text-slate-700">
              Module
              <select
                name="moduleId"
                required
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900"
              >
                <option value="">Select a module</option>
                {courses.map((course) => (
                  <optgroup key={course.id} label={course.title}>
                    {course.modules.map((module) => (
                      <option key={module.id} value={module.id}>
                        {module.title}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Title
              <input
                name="title"
                required
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900"
                placeholder="Training vs Serving"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Slug
              <input
                name="slug"
                required
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900"
                placeholder="training-vs-serving"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Summary
              <input
                name="summary"
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900"
                placeholder="Understand how offline training differs from online inference."
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Position
              <input
                name="position"
                type="number"
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900"
                placeholder="1"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Content (Markdown)
              <textarea
                name="contentMd"
                rows={6}
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900"
                placeholder="# Lesson title"
              />
            </label>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Create lesson
            </button>
          </form>

          <form
            action={createFlashcard}
            className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-slate-900">
              Create flashcard
            </h2>
            <label className="block text-sm font-semibold text-slate-700">
              Lesson
              <select
                name="lessonId"
                required
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900"
              >
                <option value="">Select a lesson</option>
                {courses.map((course) => (
                  <optgroup key={course.id} label={course.title}>
                    {course.modules.map((module) => (
                      <optgroup
                        key={module.id}
                        label={`↳ ${module.title}`}
                      >
                        {module.lessons.map((lesson) => (
                          <option key={lesson.id} value={lesson.id}>
                            {lesson.title}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Front (Markdown)
              <textarea
                name="frontMd"
                rows={3}
                required
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900"
                placeholder="What is training-serving skew?"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Back (Markdown)
              <textarea
                name="backMd"
                rows={3}
                required
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900"
                placeholder="A mismatch between training and serving data pipelines."
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Position
              <input
                name="position"
                type="number"
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900"
                placeholder="1"
              />
            </label>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Create flashcard
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
