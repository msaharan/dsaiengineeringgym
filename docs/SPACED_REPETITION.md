# Spaced Repetition (MVP)

We implement a simplified SM-2 variant (Anki-like).

## Ratings
- AGAIN
- HARD
- GOOD
- EASY

Map to SM-2 "quality" score:
- AGAIN -> 0
- HARD  -> 3
- GOOD  -> 4
- EASY  -> 5

## State per user per flashcard
- `repetitions` (int)
- `intervalDays` (int)
- `easeFactor` (float, min 1.3, default 2.5)
- `dueAt` (datetime)
- `lastReviewedAt` (datetime)

## Update rules (SM-2-ish)
Given `quality` q and previous state:

### Ease factor update
EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
Clamp: EF' = max(1.3, EF')

### If q < 3 (i.e., AGAIN)
- repetitions = 0
- intervalDays = 0
- dueAt = now + 10 minutes (learning step)

### Else (HARD/GOOD/EASY)
- repetitions += 1
- if repetitions == 1: intervalDays = 1
- else if repetitions == 2: intervalDays = 6
- else: intervalDays = round(intervalDays * EF')
- dueAt = now + intervalDays days

### HARD special-case (optional)
To reduce interval growth for HARD, you may also multiply by ~0.8:
- intervalDays = max(1, round(intervalDays * 0.8))

## Notes
- Keep this logic in a pure function:
  `scheduleNext(state, rating, now) -> newState`
- Unit test it.
