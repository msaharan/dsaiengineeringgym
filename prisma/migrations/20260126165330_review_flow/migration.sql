-- CreateEnum
CREATE TYPE "ReviewRating" AS ENUM ('AGAIN', 'HARD', 'GOOD', 'EASY');

-- CreateTable
CREATE TABLE "UserFlashcardState" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "flashcardId" TEXT NOT NULL,
    "repetitions" INTEGER NOT NULL DEFAULT 0,
    "intervalDays" INTEGER NOT NULL DEFAULT 0,
    "easeFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "dueAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReviewedAt" TIMESTAMP(3),
    "suspended" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserFlashcardState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "flashcardId" TEXT NOT NULL,
    "rating" "ReviewRating" NOT NULL,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "intervalDays" INTEGER NOT NULL,
    "easeFactor" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ReviewLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserFlashcardState_userId_dueAt_idx" ON "UserFlashcardState"("userId", "dueAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserFlashcardState_userId_flashcardId_key" ON "UserFlashcardState"("userId", "flashcardId");

-- CreateIndex
CREATE INDEX "ReviewLog_userId_reviewedAt_idx" ON "ReviewLog"("userId", "reviewedAt");

-- AddForeignKey
ALTER TABLE "UserFlashcardState" ADD CONSTRAINT "UserFlashcardState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFlashcardState" ADD CONSTRAINT "UserFlashcardState_flashcardId_fkey" FOREIGN KEY ("flashcardId") REFERENCES "Flashcard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewLog" ADD CONSTRAINT "ReviewLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewLog" ADD CONSTRAINT "ReviewLog_flashcardId_fkey" FOREIGN KEY ("flashcardId") REFERENCES "Flashcard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
