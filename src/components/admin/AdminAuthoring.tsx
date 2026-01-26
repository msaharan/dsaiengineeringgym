"use client";

import { useEffect, useMemo, useState } from "react";

import ClientMarkdown from "@/components/content/ClientMarkdown";
import {
  createCourse,
  createFlashcard,
  createLesson,
  createModule,
  updateCourse,
  updateFlashcard,
  updateLesson,
  updateModule,
} from "@/app/app/admin/actions";

type CourseData = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  modules: Array<{
    id: string;
    courseId: string;
    title: string;
    slug: string;
    description: string | null;
    position: number;
    lessons: Array<{
      id: string;
      moduleId: string;
      title: string;
      slug: string;
      summary: string | null;
      contentMd: string | null;
      position: number;
      flashcards: Array<{
        id: string;
        lessonId: string;
        frontMd: string;
        backMd: string;
        position: number;
      }>;
    }>;
  }>;
};

type AdminAuthoringProps = {
  courses: CourseData[];
  createdMessage: string | null;
  updatedMessage: string | null;
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
  updatedMessage,
  errorMessage,
}: AdminAuthoringProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("course");
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [lessonContent, setLessonContent] = useState("");
  const [flashcardFront, setFlashcardFront] = useState("");
  const [flashcardBack, setFlashcardBack] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedModuleId, setSelectedModuleId] = useState<string>("");
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");
  const [selectedFlashcardId, setSelectedFlashcardId] = useState<string>("");

  const [editCourseTitle, setEditCourseTitle] = useState("");
  const [editCourseSlug, setEditCourseSlug] = useState("");
  const [editCourseDescription, setEditCourseDescription] = useState("");

  const [editModuleCourseId, setEditModuleCourseId] = useState("");
  const [editModuleTitle, setEditModuleTitle] = useState("");
  const [editModuleSlug, setEditModuleSlug] = useState("");
  const [editModuleDescription, setEditModuleDescription] = useState("");
  const [editModulePosition, setEditModulePosition] = useState("");

  const [editLessonModuleId, setEditLessonModuleId] = useState("");
  const [editLessonTitle, setEditLessonTitle] = useState("");
  const [editLessonSlug, setEditLessonSlug] = useState("");
  const [editLessonSummary, setEditLessonSummary] = useState("");
  const [editLessonPosition, setEditLessonPosition] = useState("");
  const [editLessonContent, setEditLessonContent] = useState("");

  const [editFlashcardLessonId, setEditFlashcardLessonId] = useState("");
  const [editFlashcardFront, setEditFlashcardFront] = useState("");
  const [editFlashcardBack, setEditFlashcardBack] = useState("");
  const [editFlashcardPosition, setEditFlashcardPosition] = useState("");

  const courseOptions = useMemo(
    () => courses.map((course) => ({ id: course.id, title: course.title })),
    [courses],
  );

  const moduleOptions = useMemo(
    () =>
      courses.flatMap((course) =>
        course.modules.map((module) => ({
          ...module,
          courseTitle: course.title,
        })),
      ),
    [courses],
  );

  const lessonOptions = useMemo(
    () =>
      courses.flatMap((course) =>
        course.modules.flatMap((module) =>
          module.lessons.map((lesson) => ({
            ...lesson,
            courseTitle: course.title,
            moduleTitle: module.title,
          })),
        ),
      ),
    [courses],
  );

  const flashcardOptions = useMemo(
    () =>
      courses.flatMap((course) =>
        course.modules.flatMap((module) =>
          module.lessons.flatMap((lesson) =>
            lesson.flashcards.map((flashcard) => ({
              ...flashcard,
              courseTitle: course.title,
              moduleTitle: module.title,
              lessonTitle: lesson.title,
            })),
          ),
        ),
      ),
    [courses],
  );

  useEffect(() => {
    if (selectedCourseId && !courses.find((course) => course.id === selectedCourseId)) {
      setSelectedCourseId("");
    }
    if (selectedModuleId && !moduleOptions.find((module) => module.id === selectedModuleId)) {
      setSelectedModuleId("");
    }
    if (selectedLessonId && !lessonOptions.find((lesson) => lesson.id === selectedLessonId)) {
      setSelectedLessonId("");
    }
    if (selectedFlashcardId && !flashcardOptions.find((flashcard) => flashcard.id === selectedFlashcardId)) {
      setSelectedFlashcardId("");
    }
  }, [courses, moduleOptions, lessonOptions, flashcardOptions, selectedCourseId, selectedModuleId, selectedLessonId, selectedFlashcardId]);

  useEffect(() => {
    const course = courses.find((item) => item.id === selectedCourseId);
    if (!course) {
      setEditCourseTitle("");
      setEditCourseSlug("");
      setEditCourseDescription("");
      return;
    }
    setEditCourseTitle(course.title);
    setEditCourseSlug(course.slug);
    setEditCourseDescription(course.description ?? "");
  }, [courses, selectedCourseId]);

  useEffect(() => {
    const module = moduleOptions.find((item) => item.id === selectedModuleId);
    if (!module) {
      setEditModuleCourseId("");
      setEditModuleTitle("");
      setEditModuleSlug("");
      setEditModuleDescription("");
      setEditModulePosition("");
      return;
    }
    setEditModuleCourseId(module.courseId);
    setEditModuleTitle(module.title);
    setEditModuleSlug(module.slug);
    setEditModuleDescription(module.description ?? "");
    setEditModulePosition(module.position.toString());
  }, [moduleOptions, selectedModuleId]);

  useEffect(() => {
    const lesson = lessonOptions.find((item) => item.id === selectedLessonId);
    if (!lesson) {
      setEditLessonModuleId("");
      setEditLessonTitle("");
      setEditLessonSlug("");
      setEditLessonSummary("");
      setEditLessonPosition("");
      setEditLessonContent("");
      return;
    }
    setEditLessonModuleId(lesson.moduleId);
    setEditLessonTitle(lesson.title);
    setEditLessonSlug(lesson.slug);
    setEditLessonSummary(lesson.summary ?? "");
    setEditLessonPosition(lesson.position.toString());
    setEditLessonContent(lesson.contentMd ?? "");
  }, [lessonOptions, selectedLessonId]);

  useEffect(() => {
    const flashcard = flashcardOptions.find(
      (item) => item.id === selectedFlashcardId,
    );
    if (!flashcard) {
      setEditFlashcardLessonId("");
      setEditFlashcardFront("");
      setEditFlashcardBack("");
      setEditFlashcardPosition("");
      return;
    }
    setEditFlashcardLessonId(flashcard.lessonId);
    setEditFlashcardFront(flashcard.frontMd);
    setEditFlashcardBack(flashcard.backMd);
    setEditFlashcardPosition(flashcard.position.toString());
  }, [flashcardOptions, selectedFlashcardId]);

  const statusMessage = updatedMessage ?? createdMessage;

  return (
    <div className="space-y-8">
      {statusMessage ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
          {statusMessage}
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

      <div className="flex flex-wrap gap-2 rounded-full border border-slate-200 bg-white/80 p-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        {["create", "edit"].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setMode(value as "create" | "edit")}
            className={`rounded-full px-4 py-2 transition ${
              mode === value
                ? "bg-slate-900 text-white"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      {activeTab === "course" && mode === "create" ? (
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

      {activeTab === "course" && mode === "edit" ? (
        <form
          action={updateCourse}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-slate-900">Edit course</h2>
          {courseOptions.length === 0 ? (
            <p className="text-sm text-slate-500">
              No courses available to edit yet.
            </p>
          ) : (
            <>
              <label className="block text-sm font-semibold text-slate-700">
                Course
                <select
                  name="courseId"
                  required
                  value={selectedCourseId}
                  onChange={(event) => setSelectedCourseId(event.target.value)}
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
                  value={editCourseTitle}
                  onChange={(event) => setEditCourseTitle(event.target.value)}
                  className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900"
                />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Slug
                <input
                  name="slug"
                  required
                  value={editCourseSlug}
                  onChange={(event) => setEditCourseSlug(event.target.value)}
                  className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900"
                />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Description
                <textarea
                  name="description"
                  rows={4}
                  value={editCourseDescription}
                  onChange={(event) =>
                    setEditCourseDescription(event.target.value)
                  }
                  className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900"
                />
              </label>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                disabled={!selectedCourseId}
              >
                Update course
              </button>
            </>
          )}
        </form>
      ) : null}

      {activeTab === "module" && mode === "create" ? (
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

      {activeTab === "module" && mode === "edit" ? (
        <form
          action={updateModule}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-slate-900">Edit module</h2>
          {moduleOptions.length === 0 ? (
            <p className="text-sm text-slate-500">
              No modules available to edit yet.
            </p>
          ) : (
            <>
              <label className="block text-sm font-semibold text-slate-700">
                Module
                <select
                  name="moduleId"
                  required
                  value={selectedModuleId}
                  onChange={(event) => setSelectedModuleId(event.target.value)}
                  className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900"
                >
                  <option value="">Select a module</option>
                  {moduleOptions.map((module) => (
                    <option key={module.id} value={module.id}>
                      {module.courseTitle} — {module.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Course
                <select
                  name="courseId"
                  required
                  value={editModuleCourseId}
                  onChange={(event) =>
                    setEditModuleCourseId(event.target.value)
                  }
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
                  value={editModuleTitle}
                  onChange={(event) => setEditModuleTitle(event.target.value)}
                  className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900"
                />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Slug
                <input
                  name="slug"
                  required
                  value={editModuleSlug}
                  onChange={(event) => setEditModuleSlug(event.target.value)}
                  className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900"
                />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Position
                <input
                  name="position"
                  type="number"
                  value={editModulePosition}
                  onChange={(event) =>
                    setEditModulePosition(event.target.value)
                  }
                  className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900"
                />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Description
                <textarea
                  name="description"
                  rows={4}
                  value={editModuleDescription}
                  onChange={(event) =>
                    setEditModuleDescription(event.target.value)
                  }
                  className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900"
                />
              </label>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                disabled={!selectedModuleId}
              >
                Update module
              </button>
            </>
          )}
        </form>
      ) : null}

      {activeTab === "lesson" && mode === "create" ? (
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

      {activeTab === "lesson" && mode === "edit" ? (
        <form
          action={updateLesson}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-slate-900">Edit lesson</h2>
          {lessonOptions.length === 0 ? (
            <p className="text-sm text-slate-500">
              No lessons available to edit yet.
            </p>
          ) : (
            <>
              <label className="block text-sm font-semibold text-slate-700">
                Lesson
                <select
                  name="lessonId"
                  required
                  value={selectedLessonId}
                  onChange={(event) => setSelectedLessonId(event.target.value)}
                  className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900"
                >
                  <option value="">Select a lesson</option>
                  {lessonOptions.map((lesson) => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.courseTitle} — {lesson.moduleTitle} —{" "}
                      {lesson.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Module
                <select
                  name="moduleId"
                  required
                  value={editLessonModuleId}
                  onChange={(event) =>
                    setEditLessonModuleId(event.target.value)
                  }
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
                  value={editLessonTitle}
                  onChange={(event) => setEditLessonTitle(event.target.value)}
                  className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900"
                />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Slug
                <input
                  name="slug"
                  required
                  value={editLessonSlug}
                  onChange={(event) => setEditLessonSlug(event.target.value)}
                  className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900"
                />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Summary
                <input
                  name="summary"
                  value={editLessonSummary}
                  onChange={(event) => setEditLessonSummary(event.target.value)}
                  className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900"
                />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Position
                <input
                  name="position"
                  type="number"
                  value={editLessonPosition}
                  onChange={(event) =>
                    setEditLessonPosition(event.target.value)
                  }
                  className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900"
                />
              </label>
              <MarkdownEditor
                name="contentMd"
                label="Content (Markdown)"
                value={editLessonContent}
                onChange={setEditLessonContent}
                rows={18}
                placeholder="# Lesson title"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                disabled={!selectedLessonId}
              >
                Update lesson
              </button>
            </>
          )}
        </form>
      ) : null}

      {activeTab === "flashcard" && mode === "create" ? (
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

      {activeTab === "flashcard" && mode === "edit" ? (
        <form
          action={updateFlashcard}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-slate-900">
            Edit flashcard
          </h2>
          {flashcardOptions.length === 0 ? (
            <p className="text-sm text-slate-500">
              No flashcards available to edit yet.
            </p>
          ) : (
            <>
              <label className="block text-sm font-semibold text-slate-700">
                Flashcard
                <select
                  name="flashcardId"
                  required
                  value={selectedFlashcardId}
                  onChange={(event) =>
                    setSelectedFlashcardId(event.target.value)
                  }
                  className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900"
                >
                  <option value="">Select a flashcard</option>
                  {flashcardOptions.map((flashcard) => (
                    <option key={flashcard.id} value={flashcard.id}>
                      {flashcard.courseTitle} — {flashcard.moduleTitle} —{" "}
                      {flashcard.lessonTitle}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Lesson
                <select
                  name="lessonId"
                  required
                  value={editFlashcardLessonId}
                  onChange={(event) =>
                    setEditFlashcardLessonId(event.target.value)
                  }
                  className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900"
                >
                  <option value="">Select a lesson</option>
                  {lessonOptions.map((lesson) => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.courseTitle} — {lesson.moduleTitle} —{" "}
                      {lesson.title}
                    </option>
                  ))}
                </select>
              </label>
              <MarkdownEditor
                name="frontMd"
                label="Front (Markdown)"
                value={editFlashcardFront}
                onChange={setEditFlashcardFront}
                rows={10}
                placeholder="What is training-serving skew?"
              />
              <MarkdownEditor
                name="backMd"
                label="Back (Markdown)"
                value={editFlashcardBack}
                onChange={setEditFlashcardBack}
                rows={10}
                placeholder="A mismatch between training and serving data pipelines."
              />
              <label className="block text-sm font-semibold text-slate-700">
                Position
                <input
                  name="position"
                  type="number"
                  value={editFlashcardPosition}
                  onChange={(event) =>
                    setEditFlashcardPosition(event.target.value)
                  }
                  className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900"
                />
              </label>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                disabled={!selectedFlashcardId}
              >
                Update flashcard
              </button>
            </>
          )}
        </form>
      ) : null}
    </div>
  );
}
