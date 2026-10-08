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
            ? "border-[#cfaa96] bg-[#cfaa96]/10"
            : "border-white/20 bg-white/[0.025] hover:border-[#cfaa96]/50"
          : dragging
            ? "border-[#ff667a] bg-[#e72d45]/12"
            : "border-white/16 bg-white/[0.025] hover:border-[#e72d45]/45 hover:bg-[#e72d45]/6"
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
          className={`grid size-12 shrink-0 place-items-center rounded-2xl border ${tone === "studio" ? "border-[#cfaa96]/20 bg-[#cfaa96]/10 text-[#cfaa96]" : "border-[#e72d45]/25 bg-[#e72d45]/10 text-[#ff7a8c]"}`}
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
          className={`inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl px-4 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40 ${tone === "studio" ? "bg-[#e8e6d7] text-[#0e2d30] hover:bg-white focus-visible:outline-[#cfaa96]" : "bg-[#e72d45] text-white hover:bg-[#ff526a] focus-visible:outline-[#ff667a]"}`}
        >
          Choose file
        </button>
      </div>
    </div>
  );
}
