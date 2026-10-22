"use client";

import { FileUp, UploadCloud } from "lucide-react";
import { useId, useRef, useState } from "react";

type FileDropzoneProps = {
  accept: string;
  label: string;
  description: string;
  inputLabel?: string;
  onFile: (file: File) => void | Promise<void>;
  disabled?: boolean;
  compact?: boolean;
  tone?: "default" | "studio";
};

export function FileDropzone({
  accept,
  label,
  description,
  inputLabel,
  onFile,
  disabled = false,
  compact = false,
  tone = "default",
}: FileDropzoneProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function receive(files: FileList | null) {
    const file = files?.[0];
    if (!file || disabled) return;
    void onFile(file);
  }

  return (
    <div
      onDragEnter={(event) => {
        event.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node))
          setDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        receive(event.dataTransfer.files);
      }}
      className={`group relative rounded-2xl border border-dashed transition duration-300 motion-reduce:transition-none ${
        tone === "studio"
          ? dragging
            ? "border-primary bg-primary/10"
            : "hover:border-primary/50 border-white/20 bg-white/[0.025]"
          : dragging
            ? "border-primary bg-primary/12"
            : "hover:border-primary/45 hover:bg-primary/6 border-white/16 bg-white/[0.025]"
      } ${compact ? "p-4" : "p-5 sm:p-6"}`}
    >
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        aria-label={inputLabel ?? label}
        accept={accept}
        disabled={disabled}
        className="sr-only"
        onChange={(event) => {
          receive(event.currentTarget.files);
          event.currentTarget.value = "";
        }}
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <span
          className={`grid size-12 shrink-0 place-items-center rounded-2xl border ${tone === "studio" ? "border-primary/20 bg-primary/10 text-primary" : "border-primary/25 bg-primary/10 text-primary"}`}
        >
          {dragging ? (
            <FileUp className="size-5" aria-hidden="true" />
          ) : (
            <UploadCloud className="size-5" aria-hidden="true" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-white/85">{label}</p>
          <p className="mt-1 text-xs leading-5 text-white/65">
            {dragging ? "Release to inspect this file" : description}
          </p>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className={`inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl px-4 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40 ${tone === "studio" ? "bg-background hover:bg-card focus-visible:outline-primary" : "bg-primary text-primary-foreground hover:bg-primary-hover focus-visible:outline-primary"}`}
        >
          Choose file
        </button>
      </div>
    </div>
  );
}
