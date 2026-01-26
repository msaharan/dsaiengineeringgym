"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import ClientMarkdown from "@/components/content/ClientMarkdown";
import { completeLesson } from "@/app/app/lessons/actions";

type LessonFlashcard = {
  id: string;
  frontMd: string;
  backMd: string;
};

type LessonFlashcardReviewProps = {
  lessonId: string;
  flashcards: LessonFlashcard[];
};

export default function LessonFlashcardReview({
  lessonId,
  flashcards,
}: LessonFlashcardReviewProps) {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const total = flashcards.length;
  const card = flashcards[currentIndex];

  if (total === 0) {
    return (
      <p className="text-sm text-slate-500">
        No flashcards yet for this lesson.
      </p>
    );
  }

  if (!started) {
    return (
      <button
        type="button"
        className="mt-4 inline-flex items-center justify-center rounded-md bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        onClick={() => setStarted(true)}
      >
        Start quick review
      </button>
    );
  }

  if (completed) {
    return (
      <div className="mt-4 space-y-4">
        <p className="text-sm text-slate-600">
          Nice work. You reviewed all {total} card{total === 1 ? "" : "s"}.
        </p>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
          onClick={() => {
            setCurrentIndex(0);
            setShowBack(false);
            setCompleted(false);
            setError(null);
          }}
        >
          Review again
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-500">
        <span>
          Card {currentIndex + 1} of {total}
        </span>
        <span>{showBack ? "Answer" : "Question"}</span>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <ClientMarkdown
          content={showBack ? card.backMd : card.frontMd}
          className="text-slate-700"
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
          onClick={() => setShowBack((value) => !value)}
          disabled={isPending}
        >
          {showBack ? "Show question" : "Show answer"}
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          onClick={() => {
            if (currentIndex + 1 >= total) {
              setCompleted(true);
              startTransition(async () => {
                try {
                  await completeLesson(lessonId);
                  router.refresh();
                } catch {
                  setError("We could not mark this lesson complete yet.");
                }
              });
            } else {
              setCurrentIndex((value) => value + 1);
              setShowBack(false);
            }
          }}
          disabled={isPending}
        >
          {currentIndex + 1 >= total ? "Finish review" : "Next card"}
        </button>
      </div>
      {error ? (
        <p className="text-sm text-rose-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
