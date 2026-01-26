export type ReviewRating = "AGAIN" | "HARD" | "GOOD" | "EASY";

export type ReviewState = {
  repetitions: number;
  intervalDays: number;
  easeFactor: number;
};

export type ReviewResult = ReviewState & {
  dueAt: Date;
  lastReviewedAt: Date;
};

const ratingQuality: Record<ReviewRating, number> = {
  AGAIN: 0,
  HARD: 3,
  GOOD: 4,
  EASY: 5,
};

const MIN_EASE_FACTOR = 1.3;

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function clampEaseFactor(value: number) {
  return Math.max(MIN_EASE_FACTOR, value);
}

export function scheduleNext(
  state: ReviewState,
  rating: ReviewRating,
  now: Date,
): ReviewResult {
  const quality = ratingQuality[rating];
  const easeFactor = clampEaseFactor(
    state.easeFactor +
      (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
  );

  if (quality < 3) {
    return {
      repetitions: 0,
      intervalDays: 0,
      easeFactor,
      dueAt: addMinutes(now, 10),
      lastReviewedAt: now,
    };
  }

  const repetitions = state.repetitions + 1;
  let intervalDays = state.intervalDays;

  if (repetitions === 1) {
    intervalDays = 1;
  } else if (repetitions === 2) {
    intervalDays = 6;
  } else {
    intervalDays = Math.round(intervalDays * easeFactor);
  }

  if (rating === "HARD") {
    intervalDays = Math.max(1, Math.round(intervalDays * 0.8));
  }

  return {
    repetitions,
    intervalDays,
    easeFactor,
    dueAt: addDays(now, intervalDays),
    lastReviewedAt: now,
  };
}
