import { SiteFooter } from "@/components/marketing/site-footer";
import { AudioComparison } from "@/components/visualizer/audio-comparison";
import { RecordingLibrary } from "@/components/visualizer/recording-library";
import { CuratedSounds } from "@/components/visualizer/curated-sounds";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { pageMetadata } from "@/features/seo/public-metadata";
import Link from "next/link";
import { Headphones, ShieldCheck, ArrowUpRight } from "lucide-react";
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("SoundPage");
  const description = await getTranslations("PageMeta");
  return pageMetadata("/sound-studio", t("title"), description("sound-studio"));
}
export default async function Page() {
  const t = await getTranslations("SoundPage");
  const s = await getTranslations("StudioPolish");
  return (
    <div className="capcar-paper-grid min-h-dvh bg-[#e8e6d7] text-[#0e2d30]">
      <main className="px-5 pt-10 pb-16 sm:px-8 sm:pt-16">
        <div className="mx-auto max-w-6xl">
          <header className="mb-10 sm:mb-14">
            <p className="text-xs font-semibold tracking-[.2em] text-[#6d0101] uppercase">
              CapCar / {s("soundStudio")}
            </p>
            <h1 className="mt-5 max-w-3xl text-5xl leading-[1.02] font-medium tracking-[-.055em] sm:text-7xl">
              {t("title")}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#0e2d30]/75">
              {s("soundDescription")}
            </p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-xs text-[#0e2d30]/70">
              <span className="flex items-center gap-2">
                <Headphones aria-hidden="true" className="size-4" />
                {s("realAudio")}
              </span>
              <span className="flex items-center gap-2">
                <ShieldCheck aria-hidden="true" className="size-4" />
                {s("privateFiles")}
              </span>
            </div>
            <nav
              aria-label={s("studioSections")}
              className="mt-8 flex flex-wrap gap-2"
            >
              {[
                ["listen", "01"],
                ["compare", "02"],
                ["archive", "03"],
              ].map(([id, number]) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="inline-flex min-h-11 items-center gap-3 rounded-full border border-[#0e2d30]/20 bg-white/25 px-5 text-sm transition hover:bg-[#0e2d30] hover:text-[#e8e6d7]"
                >
                  <span className="text-xs opacity-60">{number}</span>
                  {s(id)}
                </a>
              ))}
            </nav>
          </header>
          <div className="space-y-6 sm:space-y-8">
            <CuratedSounds />
            <AudioComparison />
            <RecordingLibrary />
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#0e2d30]/15 bg-white/20 p-6">
            <p className="max-w-2xl text-sm leading-6">
              {s("recordingAdvice")}
            </p>
            <Link
              className="inline-flex min-h-11 items-center gap-2 text-sm font-medium underline underline-offset-4"
              href="/movie-cars"
            >
              {s("movieCars")}
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
