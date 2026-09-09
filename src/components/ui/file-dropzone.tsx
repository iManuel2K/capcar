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
};

export function FileDropzone({
  accept,
  label,
  description,
  inputLabel,
  onFile,
  disabled = false,
  compact = false,
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
      className={`group relative rounded-2xl border border-dashed transition duration-300 ${
        dragging
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
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-[#e72d45]/25 bg-[#e72d45]/10 text-[#ff7a8c] transition duration-300 group-hover:-translate-y-0.5 group-hover:rotate-[-3deg] group-hover:bg-[#e72d45]/16">
          {dragging ? (
            <FileUp className="size-5" aria-hidden="true" />
          ) : (
            <UploadCloud className="size-5" aria-hidden="true" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-white/85">{label}</p>
          <p className="mt-1 text-xs leading-5 text-white/42">
            {dragging ? "Release to inspect this file" : description}
          </p>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-[#e72d45] px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#ff526a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff667a] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Choose file
        </button>
      </div>
    </div>
  );
}
