import assert from "node:assert/strict";
import test from "node:test";

import { scheduleNext } from "../src/lib/review";

test("scheduleNext resets on AGAIN and schedules soon", () => {
  const now = new Date("2025-01-01T00:00:00Z");
  const result = scheduleNext(
    {
      repetitions: 3,
      intervalDays: 10,
      easeFactor: 1.3,
    },
    "AGAIN",
    now,
  );

  assert.equal(result.repetitions, 0);
  assert.equal(result.intervalDays, 0);
  assert.equal(result.easeFactor, 1.3);
  assert.equal(result.dueAt.toISOString(), "2025-01-01T00:10:00.000Z");
});

test("scheduleNext follows 1 day / 6 day ladder for GOOD", () => {
  const now = new Date("2025-01-01T00:00:00Z");

  const first = scheduleNext(
    {
      repetitions: 0,
      intervalDays: 0,
      easeFactor: 2.5,
    },
    "GOOD",
    now,
  );

  assert.equal(first.repetitions, 1);
  assert.equal(first.intervalDays, 1);
  assert.equal(first.dueAt.toISOString(), "2025-01-02T00:00:00.000Z");

  const second = scheduleNext(
    {
      repetitions: first.repetitions,
      intervalDays: first.intervalDays,
      easeFactor: first.easeFactor,
    },
    "GOOD",
    now,
  );

  assert.equal(second.repetitions, 2);
  assert.equal(second.intervalDays, 6);
  assert.equal(second.dueAt.toISOString(), "2025-01-07T00:00:00.000Z");
});

test("scheduleNext scales interval for HARD with penalty", () => {
  const now = new Date("2025-01-01T00:00:00Z");

  const result = scheduleNext(
    {
      repetitions: 2,
      intervalDays: 6,
      easeFactor: 2.5,
    },
    "HARD",
    now,
  );

  assert.equal(result.repetitions, 3);
  assert.equal(result.intervalDays, 11);
  assert.equal(result.dueAt.toISOString(), "2025-01-12T00:00:00.000Z");
});

test("scheduleNext increases ease for EASY", () => {
  const now = new Date("2025-01-01T00:00:00Z");

  const result = scheduleNext(
    {
      repetitions: 2,
      intervalDays: 6,
      easeFactor: 2.5,
    },
    "EASY",
    now,
  );

  assert.ok(result.easeFactor > 2.5);
});
