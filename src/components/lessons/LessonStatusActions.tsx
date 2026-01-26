"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { setLessonStatus } from "@/app/app/lessons/actions";

type LessonStatusActionsProps = {
  lessonId: string;
  status: "IN_PROGRESS" | "COMPLETED" | null;
};

export default function LessonStatusActions({
  lessonId,
  status,
}: LessonStatusActionsProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const currentStatus = status ?? "IN_PROGRESS";

  const handleUpdate = (nextStatus: "IN_PROGRESS" | "COMPLETED") => {
    setError(null);
    startTransition(async () => {
      try {
        await setLessonStatus(lessonId, nextStatus);
        router.refresh();
      } catch {
        setError("We could not update the lesson status yet.");
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
        onClick={() => handleUpdate("IN_PROGRESS")}
        disabled={isPending || currentStatus === "IN_PROGRESS"}
      >
        Mark in progress
      </button>
      <button
        type="button"
        className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        onClick={() => handleUpdate("COMPLETED")}
        disabled={isPending || currentStatus === "COMPLETED"}
      >
        Mark complete
      </button>
      {error ? (
        <span className="text-xs text-rose-600" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
