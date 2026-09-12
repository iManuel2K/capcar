"use client";
import { useEffect, useRef, useState } from "react";
import { FileDropzone } from "@/components/ui/file-dropzone";
import { useTranslations } from "next-intl";

type Clip = { url: string; name: string };
export function AudioComparison() {
  const t = useTranslations("SoundUi");
  const [clips, setClips] = useState<
    Partial<Record<"stock" | "modified", Clip>>
  >({});
  const [message, setMessage] = useState("");
  const players = useRef<
    Partial<Record<"stock" | "modified", HTMLAudioElement | null>>
  >({});
  const urls = useRef(new Set<string>());
  useEffect(() => {
    const owned = urls.current;
    return () => {
      owned.forEach((url) => URL.revokeObjectURL(url));
      owned.clear();
    };
  }, []);
  function clear(side: "stock" | "modified") {
    players.current[side]?.pause();
    const clip = clips[side];
    if (clip) {
      URL.revokeObjectURL(clip.url);
      urls.current.delete(clip.url);
    }
    setClips((current) => ({ ...current, [side]: undefined }));
  }
  return (
    <section className="rounded-2xl border border-current/20 p-5 sm:p-8">
      <h2 className="text-2xl font-medium">{t("abTitle")}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6">{t("abDescription")}</p>
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {(["stock", "modified"] as const).map((side) => (
          <div
            key={side}
            className="min-w-0 rounded-xl border border-current/20 p-4"
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
                  accept="audio/mpeg,audio/wav,audio/ogg,audio/mp4,.mp3,.wav,.ogg,.m4a"
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
                    if (
                      ![
                        "audio/mpeg",
                        "audio/wav",
                        "audio/x-wav",
                        "audio/ogg",
                        "audio/mp4",
                      ].includes(file.type) ||
                      file.size > 30 * 1024 * 1024
                    ) {
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
                <audio
                  aria-label={t("preview", { side })}
                  className="mt-4 w-full"
                  ref={(element) => {
                    players.current[side] = element;
                    if (element) element.volume = 0.25;
                  }}
                  src={clips[side]?.url}
                  controls
                  preload="metadata"
                  onPlay={() =>
                    players.current[
                      side === "stock" ? "modified" : "stock"
                    ]?.pause()
                  }
                  onError={() => setMessage(t("decodeFailed"))}
                />
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
      <p className="mt-4 text-sm leading-6">{t("localOnly")}</p>
      <p role="status" className="mt-3 text-sm">
        {message}
      </p>
    </section>
  );
}
