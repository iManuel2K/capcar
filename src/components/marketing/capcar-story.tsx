"use client";

import { VideoModal } from "@/components/ui/video-modal";
import { useLocale, useTranslations } from "next-intl";

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
  const trackLocale = tracks.includes(locale as (typeof tracks)[number])
    ? locale
    : "en";

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
          <VideoModal
            title={t("title")}
            src="/walkthrough/capcar-walkthrough.mp4"
            kind="file"
            poster="/walkthrough/capcar-walkthrough-poster.webp"
            trigger={t("playShort")}
            describedBy="walkthrough-transcript"
            tracks={[
              {
                src: `/walkthrough/capcar-walkthrough.${trackLocale}.vtt`,
                language: trackLocale,
                label: t("captions"),
              },
            ]}
          />
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
