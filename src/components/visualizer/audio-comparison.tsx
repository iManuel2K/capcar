"use client";
import { useEffect, useRef, useState } from "react";
import { FileDropzone } from "@/components/ui/file-dropzone";
import { useTranslations } from "next-intl";
import {
  AUDIO_ACCEPT,
  isSupportedAudio,
  pauseOtherStudioAudio,
} from "@/features/visualizer/audio-files";
import { StudioAudio } from "./studio-audio";

type Clip = { url: string; name: string };
export function AudioComparison() {
  const t = useTranslations("SoundUi");
  const s = useTranslations("StudioPolish");
  const [clips, setClips] = useState<
    Partial<Record<"stock" | "modified", Clip>>
  >({});
  const [message, setMessage] = useState("");
  const urls = useRef(new Set<string>());
  useEffect(() => {
    const owned = urls.current;
    return () => {
      owned.forEach((url) => URL.revokeObjectURL(url));
      owned.clear();
    };
  }, []);
  function clear(side: "stock" | "modified") {
    pauseOtherStudioAudio();
    const clip = clips[side];
    if (clip) {
      URL.revokeObjectURL(clip.url);
      urls.current.delete(clip.url);
    }
    setClips((current) => ({ ...current, [side]: undefined }));
  }
  return (
    <section
      id="compare"
      aria-labelledby="audio-comparison-heading"
      className="scroll-mt-28 rounded-[2rem] border border-white/10 bg-[#0e2d30] p-5 text-[#e8e6d7] sm:p-8"
    >
      <p className="mb-3 text-xs font-medium tracking-[.18em] text-[#cfaa96] uppercase">
        02 / {s("compare")}
      </p>
      <h2
        id="audio-comparison-heading"
        className="text-3xl font-medium tracking-tight"
      >
        {t("abTitle")}
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-[#e8e6d7]/70">
        {t("abDescription")}
      </p>
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {(["stock", "modified"] as const).map((side) => (
          <div
            key={side}
            className="min-w-0 rounded-2xl border border-white/15 bg-[#0b2326] p-4 sm:p-5"
          >
            <div>
              <p className="font-medium">
                {side === "stock"
                  ? t("stockRecording")
                  : t("modifiedRecording")}
              </p>
              <div className="mt-4">
                <FileDropzone
                  compact
                  accept={AUDIO_ACCEPT}
                  tone="studio"
                  label={
                    side === "stock" ? t("chooseStock") : t("chooseModified")
                  }
                  inputLabel={
                    side === "stock"
                      ? t("stockRecording")
                      : t("modifiedRecording")
                  }
                  description={t("dropAudio")}
                  onFile={(file) => {
                    if (!isSupportedAudio(file)) {
                      setMessage(t("filePrompt"));
                      return;
                    }
                    clear(side);
                    const url = URL.createObjectURL(file);
                    urls.current.add(url);
                    setClips((current) => ({
                      ...current,
                      [side]: { url, name: file.name },
                    }));
                    setMessage("");
                  }}
                />
              </div>
            </div>
            {clips[side] && (
              <>
                <p className="mt-3 truncate text-sm">
                  {clips[side]?.name} · {t("personalUnverified")}
                </p>
                <div className="mt-4">
                  <StudioAudio
                    label={t("preview", { side })}
                    src={clips[side]!.url}
                    preload="metadata"
                  />
                </div>
                <button
                  className="mt-3 min-h-11 underline"
                  onClick={() => clear(side)}
                >
                  {side === "stock" ? t("clearStock") : t("clearModified")}
                </button>
              </>
            )}
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm leading-6 text-[#e8e6d7]/65">
        {t("localOnly")}
      </p>
      <p role="status" className="mt-3 text-sm">
        {message}
      </p>
    </section>
  );
}
