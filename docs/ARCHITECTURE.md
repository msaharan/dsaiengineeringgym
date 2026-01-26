# Architecture (MVP)

## Overview
- Next.js App Router provides SSR/React Server Components by default
- Prisma + Postgres stores:
  - users & auth tables
  - content: courses/modules/lessons/flashcards
  - per-user progress & scheduling

## Key pages
- Public:
  - `/` marketing landing
- Private (auth required):
  - `/app/dashboard`
  - `/app/courses`
  - `/app/courses/[courseSlug]`
  - `/app/lessons/[lessonSlug]`
  - `/app/review`

## Data flow: review
1. UI requests due cards for current user
2. Server selects cards from UserFlashcardState where `dueAt <= now` and not suspended
3. UI presents one card at a time
4. User chooses rating
5. Server:
   - logs review event
   - updates scheduling state (SM-2-ish)
6. UI proceeds to next card

## Source of truth
- DB is the source of truth for user progress and scheduling.
- Content can be authored in files and synced into DB (later), but MVP can seed directly.

## Key design decisions
- Keep the first version simple and reliable.
- Prefer pure functions for scheduling logic with unit tests.
