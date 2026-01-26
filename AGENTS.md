
---

# `AGENTS.md`

```md
# Agent Instructions (Codex + Cursor)

This file is the single source of truth for how automated coding agents should work in this repo.

## Mission

Build DSAIEngineering.com as a “Duolingo-style gym” for DS/ML/AI engineering practitioners:
- auth-gated learning content
- flashcards + spaced repetition
- progress tracking

## Non-negotiables

1. TypeScript everywhere. Avoid `any`.
2. Next.js App Router conventions. Prefer server components + server actions where appropriate.
3. Do not store secrets in git. Only `.env.example`.
4. All DB writes go through Prisma.
5. Accessibility: semantic HTML, keyboard navigation, readable contrast.
6. No “big rewrites”. Implement in small, reviewable steps.

## Primary implementation milestones

### Milestone 0 — Bootstrap
**Goal:** A running Next.js app with linting, formatting, and Prisma wired.

Definition of done:
- Next.js app created (App Router, TS, Tailwind)
- Prisma setup + Postgres connection works
- `pnpm dev` runs
- `pnpm lint` runs

### Milestone 1 — Auth (gated app)
**Goal:** Users can sign up/sign in and reach a protected dashboard.

Definition of done:
- Auth.js/NextAuth wired
- unauthenticated users are redirected to sign-in
- user session is available server-side
- logout works

### Milestone 2 — Content skeleton (Courses/Modules/Lessons)
**Goal:** Basic content browsing and lesson rendering.

Definition of done:
- DB models for Course/Module/Lesson exist
- Seed script creates 1 course, 2 modules, 3 lessons
- UI pages exist:
  - /app/dashboard
  - /app/courses
  - /app/courses/[courseSlug]
  - /app/lessons/[lessonSlug]
- Lessons render MDX (or fallback to DB HTML/markdown for MVP)

### Milestone 3 — Flashcards + Review
**Goal:** Flashcards exist and a review session works end-to-end.

Definition of done:
- Flashcard model exists, associated with lessons
- UserFlashcardState exists (per-user scheduling)
- Review screen shows due cards
- Rating buttons update schedule using docs/SPACED_REPETITION.md
- Review logs are persisted

### Milestone 4 — Dashboard progress
**Goal:** Simple but motivating dashboard.

Definition of done:
- Dashboard shows:
  - Due cards count (today/now)
  - Continue learning link (last opened lesson)
- Lesson progress tracked when user opens a lesson

## Architectural guidelines

### File structure (target)
- `src/app/*` — routes
- `src/components/*` — reusable UI
- `src/lib/*` — db, auth, domain logic (spaced repetition)
- `prisma/*` — schema + seed
- `content/*` — MDX content (later)
- `docs/*` — specs and design docs

### Data access rules
- Use `src/lib/db.ts` to export a singleton Prisma client.
- Write domain operations in `src/lib/services/*` or `src/lib/actions/*`
- Keep DB schema changes minimal and migrate frequently.

### UI rules
- Use shadcn/ui components when useful.
- Keep pages simple and fast.
- Avoid overengineering state management. Prefer server components.

## Testing strategy (MVP)
- Unit test spaced repetition algorithm (pure functions).
- Smoke test key pages (optional).
- Avoid heavy E2E until MVP is stable.

## What to do when uncertain
If a product requirement is unclear:
- Default to the simplest behavior that supports MVP definition-of-done.
- Document the assumption in the PR and/or docs.

## Must-read docs before implementing
- docs/PRODUCT_REQUIREMENTS.md
- docs/ARCHITECTURE.md
- docs/SPACED_REPETITION.md
- docs/CONTENT_AUTHORING.md
- docs/ROADMAP.md
