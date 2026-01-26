"use client";

import { useMemo, useState } from "react";

import ClientMarkdown from "@/components/content/ClientMarkdown";
import {
  createCourse,
  createFlashcard,
  createLesson,
  createModule,
} from "@/app/app/admin/actions";

type CourseData = {
  id: string;
  title: string;
  modules: Array<{
    id: string;
    title: string;
    lessons: Array<{
      id: string;
      title: string;
    }>;
  }>;
};

type AdminAuthoringProps = {
  courses: CourseData[];
  createdMessage: string | null;
  errorMessage: string | null;
};

type TabKey = "course" | "module" | "lesson" | "flashcard";

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "course", label: "Course" },
  { key: "module", label: "Module" },
  { key: "lesson", label: "Lesson" },
  { key: "flashcard", label: "Flashcard" },
];

type MarkdownEditorProps = {
  name: string;
  label: string;
  value: string;
  onChange: (nextValue: string) => void;
  rows?: number;
  placeholder?: string;
};

function MarkdownEditor({
  name,
  label,
  value,
  onChange,
  rows = 12,
  placeholder,
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<"raw" | "preview">("raw");

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-sm font-semibold text-slate-700">{label}</label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode("raw")}
            className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${
              mode === "raw"
                ? "border-slate-300 bg-white text-slate-800"
                : "border-slate-200 bg-white/60 text-slate-500"
            }`}
          >
            Raw
          </button>
          <button
            type="button"
            onClick={() => setMode("preview")}
            className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${
              mode === "preview"
                ? "border-slate-300 bg-white text-slate-800"
                : "border-slate-200 bg-white/60 text-slate-500"
            }`}
          >
            Preview
          </button>
        </div>
      </div>

      {mode === "raw" ? (
        <textarea
          name={name}
          rows={rows}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900"
          placeholder={placeholder}
        />
      ) : (
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <ClientMarkdown
            content={value || "Nothing to preview yet."}
            className="text-slate-700"
          />
        </div>
      )}

      {mode === "preview" ? (
        <input type="hidden" name={name} value={value} />
      ) : null}
    </div>
  );
}

export default function AdminAuthoring({
  courses,
  createdMessage,
  errorMessage,
}: AdminAuthoringProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("course");
  const [lessonContent, setLessonContent] = useState("");
  const [flashcardFront, setFlashcardFront] = useState("");
  const [flashcardBack, setFlashcardBack] = useState("");

  const courseOptions = useMemo(
    () => courses.map((course) => ({ id: course.id, title: course.title })),
    [courses],
  );

  return (
    <div className="space-y-8">
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

      <div className="flex flex-wrap gap-2 rounded-full border border-slate-200 bg-white/80 p-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-full px-4 py-2 transition ${
              activeTab === tab.key
                ? "bg-slate-900 text-white"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "course" ? (
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
              rows={4}
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
      ) : null}

      {activeTab === "module" ? (
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
              {courseOptions.map((course) => (
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
              rows={4}
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
      ) : null}

      {activeTab === "lesson" ? (
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
          <MarkdownEditor
            name="contentMd"
            label="Content (Markdown)"
            value={lessonContent}
            onChange={setLessonContent}
            rows={18}
            placeholder="# Lesson title"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Create lesson
          </button>
        </form>
      ) : null}

      {activeTab === "flashcard" ? (
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
                    <optgroup key={module.id} label={`↳ ${module.title}`}>
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
          <MarkdownEditor
            name="frontMd"
            label="Front (Markdown)"
            value={flashcardFront}
            onChange={setFlashcardFront}
            rows={10}
            placeholder="What is training-serving skew?"
          />
          <MarkdownEditor
            name="backMd"
            label="Back (Markdown)"
            value={flashcardBack}
            onChange={setFlashcardBack}
            rows={10}
            placeholder="A mismatch between training and serving data pipelines."
          />
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
      ) : null}
    </div>
  );
}
