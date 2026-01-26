"use client";

import { useRef, useState } from "react";

import ClientMarkdown from "@/components/content/ClientMarkdown";

export default function ImageUploader() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [status, setStatus] = useState<"idle" | "uploading" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [deleteStatus, setDeleteStatus] = useState<
    "idle" | "deleting" | "error"
  >("idle");

  const markdown = url
    ? `![${altText || "image"}](${url})`
    : "";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setMessage("Select an image to upload.");
      setStatus("error");
      return;
    }

    setStatus("uploading");
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const errorMessage =
          payload?.error ?? "Upload failed. Please try again.";
        setStatus("error");
        setMessage(errorMessage);
        return;
      }

      const payload = await response.json();
      setUrl(payload.url as string);
      setStatus("idle");
      setMessage("Upload complete. Copy the markdown below.");
    } catch (error) {
      console.error(error);
      setStatus("error");
      setMessage("Upload failed. Please try again.");
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files?.[0] ?? null;
    if (!droppedFile) {
      return;
    }
    if (!droppedFile.type.startsWith("image/")) {
      setStatus("error");
      setMessage("Only image files are supported.");
      return;
    }
    setFile(droppedFile);
    setStatus("idle");
    setMessage(null);
  };

  const handleCopy = async () => {
    if (!markdown) {
      return;
    }
    try {
      await navigator.clipboard.writeText(markdown);
      setCopyMessage("Copied!");
      setTimeout(() => setCopyMessage(null), 2000);
    } catch {
      setCopyMessage("Copy failed");
      setTimeout(() => setCopyMessage(null), 2000);
    }
  };

  const handleDelete = async () => {
    if (!url) {
      return;
    }
    setDeleteStatus("deleting");
    setMessage(null);
    try {
      const response = await fetch("/api/uploads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const errorMessage =
          payload?.error ?? "Delete failed. Please try again.";
        setDeleteStatus("error");
        setMessage(errorMessage);
        return;
      }
      setUrl(null);
      setFile(null);
      setAltText("");
      setDeleteStatus("idle");
      setMessage("Image deleted.");
    } catch (error) {
      console.error(error);
      setDeleteStatus("error");
      setMessage("Delete failed. Please try again.");
    }
  };

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Image uploader
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Upload an image and paste the markdown into a lesson or flashcard.
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Stored locally in <span className="font-semibold">/public/uploads</span>
          . Use an object store for production.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
          className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-4 text-center text-sm text-slate-600"
        >
          <p className="font-semibold text-slate-700">Drag & drop an image</p>
          <p className="mt-1 text-xs text-slate-500">or click to choose</p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-3 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
          >
            Choose file
          </button>
          {file ? (
            <p className="mt-2 text-xs text-slate-500">{file.name}</p>
          ) : null}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="hidden"
          />
        </div>
        <label className="block text-sm font-semibold text-slate-700">
          Alt text (optional)
          <input
            type="text"
            value={altText}
            onChange={(event) => setAltText(event.target.value)}
            className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900"
            placeholder="Diagram of model training pipeline"
          />
        </label>
        <button
          type="submit"
          disabled={status === "uploading"}
          className="inline-flex items-center justify-center rounded-md bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "uploading" ? "Uploading..." : "Upload image"}
        </button>
      </form>

      {message ? (
        <p
          className={`text-sm ${
            status === "error" ? "text-rose-600" : "text-emerald-700"
          }`}
        >
          {message}
        </p>
      ) : null}

      {url ? (
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Markdown
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 transition hover:text-slate-900"
                >
                  {copyMessage ?? "Copy"}
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteStatus === "deleting"}
                  className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-700 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deleteStatus === "deleting" ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
            <code className="mt-2 block rounded-md bg-slate-100 px-3 py-2 text-xs text-slate-700">
              {markdown}
            </code>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Preview
            </p>
            <ClientMarkdown content={markdown} className="text-slate-700" />
          </div>
        </div>
      ) : null}
    </section>
  );
}
