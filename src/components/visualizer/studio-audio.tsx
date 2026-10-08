"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { pauseOtherStudioAudio } from "@/features/visualizer/audio-files";

type Props = {
  src: string;
  fallback?: string;
  label: string;
  preload?: "none" | "metadata";
};

/** Remount the session when its source changes, including fallback/error state. */
export function StudioAudio(props: Props) {
  return (
    <AudioSession key={`${props.src}:${props.fallback ?? ""}`} {...props} />
  );
}

function AudioSession({ src, fallback, label, preload = "none" }: Props) {
  const t = useTranslations("SoundUi");
  const studio = useTranslations("StudioPolish");
  const player = useRef<HTMLAudioElement>(null);
  const [useFallback, setUseFallback] = useState(false);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const audio = player.current;
    if (audio) audio.volume = 0.25;
    const stop = () => audio?.pause();
    window.addEventListener("pagehide", stop);
    return () => {
      stop();
      window.removeEventListener("pagehide", stop);
    };
  }, [useFallback, retry]);
  return (
    <div className="min-w-0">
      <audio
        key={retry}
        data-capcar-audio
        ref={player}
        aria-label={label}
        controls
        preload={preload}
        src={useFallback ? fallback : src}
        className="block h-11 w-full max-w-full min-w-0 rounded-full [color-scheme:dark]"
        onPlay={(event) => pauseOtherStudioAudio(event.currentTarget)}
        onError={() => {
          if (fallback && !useFallback) setUseFallback(true);
          else setFailed(true);
        }}
        onCanPlay={() => setFailed(false)}
      />
      {failed && (
        <div className="mt-3 rounded-xl border border-[#bf8269]/30 bg-[#bf8269]/10 px-4 py-2 text-sm">
          <p role="alert">{t("playFailed")}</p>
          <button
            type="button"
            className="min-h-11 underline underline-offset-4"
            onClick={() => {
              setFailed(false);
              setUseFallback(false);
              setRetry((value) => value + 1);
            }}
          >
            {studio("retryAudio")}
          </button>
        </div>
      )}
    </div>
  );
}
