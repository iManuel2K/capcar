"use client";

import { Pause, Play } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRef, useState } from "react";

const steps = [
  "car",
  "direction",
  "parts",
  "budget",
  "garage",
  "roadbook",
] as const;
const tracks = ["de", "en", "el", "sq", "ja"] as const;

export function CapcarStory() {
  const t = useTranslations("Walkthrough");
  const locale = useLocale();
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const trackLocale = tracks.includes(locale as (typeof tracks)[number])
    ? locale
    : "en";

  async function togglePlayback() {
    const player = video.current;
    if (!player) return;
    if (player.paused) {
      try {
        await player.play();
      } catch {
        setPlaying(false);
      }
    } else player.pause();
  }

  return (
    <section
      id="walkthrough"
      aria-labelledby="walkthrough-title"
      className="bg-[#d7d9cf] px-5 py-20 text-[#0e2d30] sm:px-8 sm:py-28"
    >
      <div className="mx-auto max-w-[1500px]">
        <div className="grid gap-7 lg:grid-cols-[1fr_0.62fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-[#6d0101] uppercase">
              {t("eyebrow")}
            </p>
            <h2
              id="walkthrough-title"
              className="mt-4 max-w-4xl text-4xl leading-[0.94] font-medium tracking-[-0.055em] sm:text-7xl sm:leading-[0.92]"
            >
              {t("title")}
            </h2>
          </div>
          <p className="max-w-xl text-base leading-7 text-[#0e2d30]/64 lg:justify-self-end">
            {t("description")}
          </p>
        </div>
        <div className="mt-10 overflow-hidden rounded-[1.75rem] border border-[#0e2d30]/18 bg-[#081b1e] shadow-[0_30px_90px_rgba(14,45,48,.16)] sm:mt-14 sm:rounded-[2.2rem]">
          <div className="flex min-h-14 items-center justify-between gap-4 border-b border-white/10 px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <span
                aria-hidden="true"
                className="size-2 shrink-0 rounded-full bg-[#e72d45] shadow-[0_0_0_5px_rgba(231,45,69,.12)]"
              />
              <span className="truncate font-mono text-[10px] tracking-[0.14em] text-white/55 uppercase sm:text-xs">
                Project Streetline · CapCar
              </span>
            </div>
            <span className="shrink-0 rounded-full border border-white/12 px-3 py-1.5 text-[10px] font-semibold tracking-[0.12em] text-[#d6aa92] uppercase">
              {t("runtime")}
            </span>
          </div>
          <div className="relative bg-[#050b0d]">
            <video
              ref={video}
              className="aspect-video w-full bg-[#071519] object-cover"
              controls
              muted
              playsInline
              preload="none"
              poster="/walkthrough/capcar-walkthrough-poster.webp"
              aria-describedby="walkthrough-transcript"
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
            >
              <source
                src="/walkthrough/capcar-walkthrough.mp4"
                type="video/mp4"
              />
              <track
                src={`/walkthrough/capcar-walkthrough.${trackLocale}.vtt`}
                kind="captions"
                srcLang={trackLocale}
                label={t("captions")}
                default
              />
              {t("videoFallback")}
            </video>
            <button
              type="button"
              onClick={() => void togglePlayback()}
              className="absolute bottom-4 left-4 inline-flex min-h-12 items-center gap-2 rounded-full border border-white/20 bg-[#081b1e]/92 px-5 text-sm font-semibold text-white shadow-2xl backdrop-blur-xl transition duration-200 hover:bg-[#12373a] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#f0c0a8] motion-reduce:transition-none sm:bottom-6 sm:left-6"
              aria-label={playing ? t("pause") : t("play")}
            >
              {playing ? (
                <Pause className="size-4" aria-hidden="true" />
              ) : (
                <Play className="size-4 fill-current" aria-hidden="true" />
              )}
              {playing ? t("pauseShort") : t("playShort")}
            </button>
          </div>
        </div>
        <ol
          id="walkthrough-transcript"
          className="mt-5 grid gap-px overflow-hidden rounded-[1.4rem] border border-[#0e2d30]/12 bg-[#0e2d30]/12 sm:grid-cols-2 lg:grid-cols-3"
        >
          {steps.map((step, index) => (
            <li key={step} className="bg-[#e8e6d7] p-5 sm:min-h-44 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <span className="font-mono text-[10px] font-semibold tracking-[0.12em] text-[#6d0101]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="h-px flex-1 bg-[#0e2d30]/12" />
              </div>
              <h3 className="mt-5 text-lg font-medium tracking-[-0.025em]">
                {t(`${step}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#0e2d30]/60">
                {t(`${step}.description`)}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
