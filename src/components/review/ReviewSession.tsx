"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import ClientMarkdown from "@/components/content/ClientMarkdown";
import { submitReview } from "@/app/app/review/actions";
import type { ReviewRating } from "@/lib/review";

type ReviewQueueItem = {
  flashcardId: string;
  frontMd: string;
  backMd: string;
  lesson: {
    title: string;
    slug: string;
  };
};

type ReviewSessionProps = {
  queue: ReviewQueueItem[];
};

const ratingOptions: Array<{
  value: ReviewRating;
  label: string;
  className: string;
}> = [
  {
    value: "AGAIN",
    label: "Again",
    className: "border-rose-200 text-rose-700 hover:border-rose-300",
  },
  {
    value: "HARD",
    label: "Hard",
    className: "border-amber-200 text-amber-700 hover:border-amber-300",
  },
  {
    value: "GOOD",
    label: "Good",
    className: "border-emerald-200 text-emerald-700 hover:border-emerald-300",
  },
  {
    value: "EASY",
    label: "Easy",
    className: "border-sky-200 text-sky-700 hover:border-sky-300",
  },
];

export default function ReviewSession({ queue }: ReviewSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (queue.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-10 text-center text-sm text-slate-600">
        No flashcards are due right now. Come back later or review a lesson.
      </div>
    );
  }

  if (completed) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white/80 p-8 text-center shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">
          Session complete
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          You reviewed {queue.length} card{queue.length === 1 ? "" : "s"}.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
            onClick={() => {
              setCurrentIndex(0);
              setShowBack(false);
              setCompleted(false);
            }}
          >
            Review again
          </button>
          <Link
            href="/app/courses"
            className="inline-flex items-center justify-center rounded-md bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Browse courses
          </Link>
        </div>
      </div>
    );
  }

  const card = queue[currentIndex];

  const goNext = () => {
    if (currentIndex + 1 >= queue.length) {
      setCompleted(true);
    } else {
      setCurrentIndex((value) => value + 1);
      setShowBack(false);
    }
  };

  const handleRating = (rating: ReviewRating) => {
    setError(null);
    startTransition(async () => {
      try {
        await submitReview(card.flashcardId, rating);
        goNext();
      } catch {
        setError("We could not save that review. Please try again.");
      }
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.2em] text-slate-500">
        <span>
          Card {currentIndex + 1} of {queue.length}
        </span>
        <Link
          href={`/app/lessons/${card.lesson.slug}`}
          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-semibold text-slate-500 transition hover:text-slate-900"
        >
          {card.lesson.title}
        </Link>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <ClientMarkdown content={showBack ? card.backMd : card.frontMd} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
          onClick={() => setShowBack((value) => !value)}
          disabled={isPending}
        >
          {showBack ? "Show question" : "Show answer"}
        </button>

        {showBack ? (
          <div className="flex flex-wrap gap-2">
            {ratingOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`inline-flex items-center justify-center rounded-md border bg-white px-4 py-2 text-sm font-semibold transition ${option.className}`}
                onClick={() => handleRating(option.value)}
                disabled={isPending}
              >
                {option.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="mt-3 text-sm text-rose-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
