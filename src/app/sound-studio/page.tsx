import { SiteFooter } from "@/components/marketing/site-footer";
import Link from "next/link";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { AudioComparison } from "@/components/visualizer/audio-comparison";
import { RecordingLibrary } from "@/components/visualizer/recording-library";
import { CuratedSounds } from "@/components/visualizer/curated-sounds";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("SoundPage");
  return { title: t("title") };
}
export default async function Page() {
  const t = await getTranslations("SoundPage");
  return (
    <div className="min-h-dvh bg-[#e8e6d7] text-[#0e2d30]">
      <MarketingHeader />
      <main className="px-5 py-10">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center underline"
          >
            ← {t("back")}
          </Link>
          <h1 className="my-8 text-4xl font-medium tracking-tight sm:text-6xl">
            {t("title")}
          </h1>
          <CuratedSounds />
          <RecordingLibrary />
          <div className="rounded-2xl bg-[#0e2d30] text-[#e8e6d7]">
            <AudioComparison />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
