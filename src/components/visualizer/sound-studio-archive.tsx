"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useTranslations } from "next-intl";
const RecordingLibrary = dynamic(
  () => import("./recording-library").then((module) => module.RecordingLibrary),
  { ssr: false },
);
export function SoundStudioArchive() {
  const s = useTranslations("StudioPolish");
  const [open, setOpen] = useState(false);
  return (
    <section id={open ? undefined : "archive"} className="scroll-mt-24">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="recording-archive-content"
        onClick={() => setOpen(!open)}
        className="border-foreground/20 bg-card flex min-h-16 w-full items-center justify-between rounded-2xl border px-6 text-left text-base font-medium focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        <span>03 / {s("archive")}</span>
        <span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      <div id="recording-archive-content">{open && <RecordingLibrary />}</div>
    </section>
  );
}
