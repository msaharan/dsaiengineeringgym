# DSAIEngineeringGym

DSAIEngineeringGym is the codebase for **DSAIEngineering.com** — a “Duolingo-style gym” for **data science, machine learning, and AI engineering** practitioners.

The goal: make practical, hands-on learning feel like a workout:
- short sessions
- drills (flashcards + quizzes later)
- spaced repetition
- progress tracking per user

This repository is designed to be built by an AI coding agent (Codex) inside Cursor.  
See **AGENTS.md** for implementation rules and milestones.

---

## Product concept

Users must **sign up / sign in** to access content.

Inside the app:
- Users choose a track (e.g., *ML Systems*, *LLM Engineering*, *Practical Statistics*, *Data Engineering for ML*)
- Lessons are practical and “engineering-first”
- Exercises emphasize recall and application:
  - Flashcards (MVP)
  - Multiple-choice & short answers (next)
  - Code exercises + autograding (future)
- A spaced repetition engine schedules reviews
- Progress is tracked per user

---

## MVP definition (what “done” means)

**MVP v0 is complete when:**
1. A user can sign up/sign in.
2. Signed-in users can browse a list of Courses → Modules → Lessons.
3. Lessons render as MDX content.
4. Lessons have flashcards.
5. User can start a **Review** session:
   - sees due cards
   - answers by self-rating: Again / Hard / Good / Easy
   - schedule updates are saved
6. Dashboard shows:
   - number of cards due today
   - link to continue the last lesson
7. Everything is persisted in Postgres.

---

## Recommended stack

- Next.js (App Router) + TypeScript
- TailwindCSS + shadcn/ui
- Auth.js / NextAuth for authentication
- Prisma ORM
- Postgres (Vercel Postgres recommended)
- MDX for content

---

## Local development

### Prerequisites
- Node.js 20+ (recommended)
- Postgres (local Docker, or Neon/Vercel Postgres)
- pnpm (recommended) or npm

### Setup
```bash
# 1) install deps
pnpm install

# 2) env
cp .env.example .env

# 3) generate prisma client
pnpm db:generate

# 4) migrate (or push) + seed
pnpm db:migrate
pnpm db:seed

# 5) run
pnpm dev
```

---

## Database & Prisma

- Schema: `prisma/schema.prisma`
- Seed script: `prisma/seed.ts`

Common commands:

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:studio
pnpm db:seed
```

---

## Backups (DB + uploads)

Local backups are created by `scripts/backup-db.sh`. Each backup is a single
`.tar.gz` file that contains:
- `db.sql` (database dump)
- `uploads/` (images from `public/uploads`)

Default backup location:
`/Users/msaharan/Library/Mobile Documents/com~apple~CloudDocs/dsaie-backups`

### Run a manual backup
```bash
scripts/backup-db.sh
```

### Restore from a backup
```bash
scripts/restore-backup.sh /path/to/dsaie_YYYYMMDD_HHMMSS.tar.gz
```

### Notes
- Set `POSTGRES_CONTAINER` in `.env` if you use Docker.
- Set `UPLOADS_DIR` if you want a custom uploads path.
