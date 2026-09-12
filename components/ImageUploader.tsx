"use client";

import { useRef, useState } from "react";
import IssuePhoto from "./IssuePhoto";
import { CameraIcon, CloseIcon } from "./icons";

export default function ImageUploader({
  value,
  onChange,
  disabled = false,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setError(null);
    setUploading(true);

    try {
      const form = new FormData();
      form.append("file", file);

      const response = await fetch("/api/upload", { method: "POST", body: form });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? "The photo could not be uploaded.");
      }
      onChange(data.url as string);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The photo could not be uploaded.",
      );
    } finally {
      setUploading(false);
    }
  }

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) void upload(file);
  }

  if (value) {
    return (
      <div className="relative overflow-hidden rounded-card border border-rule">
        <IssuePhoto src={value} alt="The photo you are reporting" className="aspect-[16/10] w-full" priority />
        {!disabled ? (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-agent/85 text-white backdrop-blur hover:bg-agent"
          >
            <CloseIcon className="h-5 w-5" />
            <span className="sr-only">Remove this photo</span>
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
        className={`rounded-card border-2 border-dashed p-8 text-center transition-colors ${
          dragging ? "border-action bg-action/5" : "border-[#b9c6d1] bg-surface"
        }`}
      >
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-ground text-ink">
          <CameraIcon className="h-7 w-7" />
        </span>

        <p className="mt-4 text-[17px] font-semibold tracking-tight-display">
          {uploading ? "Adding your photo" : "Add a photo of the problem"}
        </p>
        <p className="mt-1 text-sm text-muted">
          Drag one here, or choose a file. One clear photo is enough.
        </p>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="mt-4 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-agent disabled:opacity-60"
        >
          {uploading ? "Uploading" : "Choose a photo"}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={(event) => handleFiles(event.target.files)}
        />
      </div>

      {error ? (
        <p className="mt-2 text-sm font-medium text-sev-high">{error}</p>
      ) : null}
    </div>
  );
}
