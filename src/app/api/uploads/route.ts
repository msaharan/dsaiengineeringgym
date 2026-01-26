import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";

export const runtime = "nodejs";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
]);

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!isAdminEmail(session?.user?.email ?? null)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 415 });
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: "File too large" }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const originalName = file.name || "upload";
  const extension = originalName.includes(".")
    ? originalName.split(".").pop()
    : "png";
  const safeExt = extension ? extension.replace(/[^a-z0-9]/gi, "") : "png";
  const baseName = originalName
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const timestamp = Date.now();
  const fileName = `${baseName || "image"}-${timestamp}.${safeExt}`;

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, fileName);

  await writeFile(filePath, buffer);

  return NextResponse.json({ url: `/uploads/${fileName}` });
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!isAdminEmail(session?.user?.email ?? null)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: { url?: string } | null = null;
  try {
    payload = (await request.json()) as { url?: string };
  } catch {
    payload = null;
  }

  const url = payload?.url;
  if (!url || !url.startsWith("/uploads/")) {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  const fileName = path.basename(url);
  if (!fileName) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), "public", "uploads", fileName);

  try {
    await unlink(filePath);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  return NextResponse.json({ deleted: true });
}
