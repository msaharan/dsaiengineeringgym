# Bootstrap Checklist (for agents)

1) Initialize Next.js
- create-next-app with TypeScript + Tailwind + App Router
- add shadcn/ui (optional)

2) Add Prisma + Postgres
- prisma init
- schema includes NextAuth models + course/lesson/flashcards
- create seed script with 1 course and some cards

3) Add Auth
- NextAuth route
- protected /app routes

4) Build core pages
- /app/dashboard
- /app/courses
- /app/lessons/[lessonSlug]
- /app/review

5) Implement spaced repetition engine
- pure function + tests
- integrate in review actions
