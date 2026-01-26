# Product Requirements (MVP)

## Target user
Professional practitioners: data scientists, ML engineers, data engineers, AI engineers.

## Product promise
Short, practical workouts that improve recall + real-world engineering judgment.

## Core user flows (MVP)

### 1) Auth
- User can sign up/sign in.
- Content is inaccessible without auth.

### 2) Browse content
- User can browse Courses → Modules → Lessons
- User can open a lesson page

### 3) Review flashcards
- User can start a review session
- System selects flashcards due for the user
- User rates each card: Again/Hard/Good/Easy
- Scheduling updates are persisted

### 4) Progress
- Track last opened lesson
- Track lesson status: not started / in progress / completed (MVP can mark “in progress” when opened)

## MVP UX principles
- Always show a “next action” button:
  - Continue
  - Review (N due)
- Session length defaults to 5–10 minutes.

## Success criteria
- A new user can go from signup → lesson → review → dashboard with saved progress.
