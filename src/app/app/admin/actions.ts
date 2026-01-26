"use server";

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isAdminEmail } from "@/lib/admin";

function requireAdmin(email?: string | null) {
  if (!isAdminEmail(email)) {
    throw new Error("Not authorized");
  }
}

function getRequiredString(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${key} is required`);
  }
  return value.trim();
}

function getOptionalString(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function getOptionalNumber(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  requireAdmin(session?.user?.email ?? null);
}

export async function createCourse(formData: FormData) {
  await ensureAdmin();

  const title = getRequiredString(formData, "title");
  const slug = getRequiredString(formData, "slug");
  const description = getOptionalString(formData, "description");

  try {
    await prisma.course.create({
      data: {
        title,
        slug,
        description,
      },
    });
  } catch (error) {
    console.error(error);
    redirect("/app/admin?error=course");
  }

  revalidatePath("/app/admin");
  revalidatePath("/app/courses");
  redirect("/app/admin?created=course");
}

export async function updateCourse(formData: FormData) {
  await ensureAdmin();

  const courseId = getRequiredString(formData, "courseId");
  const title = getRequiredString(formData, "title");
  const slug = getRequiredString(formData, "slug");
  const description = getOptionalString(formData, "description");

  try {
    await prisma.course.update({
      where: { id: courseId },
      data: {
        title,
        slug,
        description,
      },
    });
  } catch (error) {
    console.error(error);
    redirect("/app/admin?error=course");
  }

  revalidatePath("/app/admin");
  revalidatePath("/app/courses");
  redirect("/app/admin?updated=course");
}

export async function createModule(formData: FormData) {
  await ensureAdmin();

  const courseId = getRequiredString(formData, "courseId");
  const title = getRequiredString(formData, "title");
  const slug = getRequiredString(formData, "slug");
  const description = getOptionalString(formData, "description");
  const position = getOptionalNumber(formData, "position") ?? 0;

  try {
    await prisma.module.create({
      data: {
        courseId,
        title,
        slug,
        description,
        position,
      },
    });
  } catch (error) {
    console.error(error);
    redirect("/app/admin?error=module");
  }

  revalidatePath("/app/admin");
  revalidatePath("/app/courses");
  redirect("/app/admin?created=module");
}

export async function updateModule(formData: FormData) {
  await ensureAdmin();

  const moduleId = getRequiredString(formData, "moduleId");
  const courseId = getRequiredString(formData, "courseId");
  const title = getRequiredString(formData, "title");
  const slug = getRequiredString(formData, "slug");
  const description = getOptionalString(formData, "description");
  const position = getOptionalNumber(formData, "position") ?? 0;

  try {
    await prisma.module.update({
      where: { id: moduleId },
      data: {
        courseId,
        title,
        slug,
        description,
        position,
      },
    });
  } catch (error) {
    console.error(error);
    redirect("/app/admin?error=module");
  }

  revalidatePath("/app/admin");
  revalidatePath("/app/courses");
  redirect("/app/admin?updated=module");
}

export async function createLesson(formData: FormData) {
  await ensureAdmin();

  const moduleId = getRequiredString(formData, "moduleId");
  const title = getRequiredString(formData, "title");
  const slug = getRequiredString(formData, "slug");
  const summary = getOptionalString(formData, "summary");
  const contentMd = getOptionalString(formData, "contentMd");
  const position = getOptionalNumber(formData, "position") ?? 0;

  try {
    await prisma.lesson.create({
      data: {
        moduleId,
        title,
        slug,
        summary,
        contentMd,
        position,
      },
    });
  } catch (error) {
    console.error(error);
    redirect("/app/admin?error=lesson");
  }

  revalidatePath("/app/admin");
  revalidatePath("/app/courses");
  redirect("/app/admin?created=lesson");
}

export async function updateLesson(formData: FormData) {
  await ensureAdmin();

  const lessonId = getRequiredString(formData, "lessonId");
  const moduleId = getRequiredString(formData, "moduleId");
  const title = getRequiredString(formData, "title");
  const slug = getRequiredString(formData, "slug");
  const summary = getOptionalString(formData, "summary");
  const contentMd = getOptionalString(formData, "contentMd");
  const position = getOptionalNumber(formData, "position") ?? 0;

  try {
    await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        moduleId,
        title,
        slug,
        summary,
        contentMd,
        position,
      },
    });
  } catch (error) {
    console.error(error);
    redirect("/app/admin?error=lesson");
  }

  revalidatePath("/app/admin");
  revalidatePath("/app/courses");
  revalidatePath("/app/lessons");
  redirect("/app/admin?updated=lesson");
}

export async function createFlashcard(formData: FormData) {
  await ensureAdmin();

  const lessonId = getRequiredString(formData, "lessonId");
  const frontMd = getRequiredString(formData, "frontMd");
  const backMd = getRequiredString(formData, "backMd");
  const position = getOptionalNumber(formData, "position") ?? 0;

  try {
    await prisma.flashcard.create({
      data: {
        lessonId,
        frontMd,
        backMd,
        position,
      },
    });
  } catch (error) {
    console.error(error);
    redirect("/app/admin?error=flashcard");
  }

  revalidatePath("/app/admin");
  revalidatePath("/app/lessons");
  redirect("/app/admin?created=flashcard");
}

export async function updateFlashcard(formData: FormData) {
  await ensureAdmin();

  const flashcardId = getRequiredString(formData, "flashcardId");
  const lessonId = getRequiredString(formData, "lessonId");
  const frontMd = getRequiredString(formData, "frontMd");
  const backMd = getRequiredString(formData, "backMd");
  const position = getOptionalNumber(formData, "position") ?? 0;

  try {
    await prisma.flashcard.update({
      where: { id: flashcardId },
      data: {
        lessonId,
        frontMd,
        backMd,
        position,
      },
    });
  } catch (error) {
    console.error(error);
    redirect("/app/admin?error=flashcard");
  }

  revalidatePath("/app/admin");
  revalidatePath("/app/lessons");
  redirect("/app/admin?updated=flashcard");
}
