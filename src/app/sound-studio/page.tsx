import { SiteFooter } from "@/components/marketing/site-footer";
import { SoundStudioArchive } from "@/components/visualizer/sound-studio-archive";
import { CuratedSounds } from "@/components/visualizer/curated-sounds";
import { getLocale, getTranslations } from "next-intl/server";
import { publicTitle } from "@/features/seo/public-titles";
import { resolveJournalLocale } from "@/features/journal/routes";
import type { Metadata } from "next";
import { pageMetadata } from "@/features/seo/public-metadata";
import Link from "@/components/i18n/public-link";
import { ArrowUpRight } from "lucide-react";
import { soundDeskCopy } from "@/features/visualizer/sound-desk-copy";
import { soundCatalog } from "@/features/visualizer/sound-catalog";
import styles from "@/components/marketing/homepage.module.css";
import editorial from "@/components/marketing/public-editorial.module.css";
export async function generateMetadata(): Promise<Metadata> {
  const locale = resolveJournalLocale(await getLocale());
  const description = await getTranslations("PageMeta");
  const meta = pageMetadata(
    "/sound-studio",
    publicTitle(locale, "sound"),
    description("sound-studio"),
  );
  return {
    ...meta,
    openGraph: {
      ...meta.openGraph,
      images: [
        {
          url: "/social/capcar-sound-studio-share.png",
          width: 1200,
          height: 630,
          alt: "CapCar Sound Studio · real recordings and A/B comparison",
        },
      ],
    },
    twitter: {
      ...meta.twitter,
      card: "summary_large_image",
      images: ["/social/capcar-sound-studio-share.png"],
    },
  };
}
export default async function Page() {
  const c = soundDeskCopy(await getLocale());
  const s = await getTranslations("StudioPolish");
  return (
    <div className="capcar-paper-grid bg-background text-foreground min-h-dvh">
      <main id="main-content" className={editorial.page}>
        <div className={editorial.inner}>
          <header className={editorial.intro}>
            <p className="text-primary text-xs font-semibold tracking-[.2em] uppercase">
              CapCar / {s("soundStudio")}
            </p>
            <h1
              className={`${styles.pageTitle} mt-3 max-w-4xl text-[1.9rem]! sm:text-[clamp(2.5rem,4.4vw,4.6rem)]!`}
            >
              {c.title}
            </h1>
            <p className="text-foreground/75 mt-3 max-w-2xl text-base leading-7">
              {c.intro}
            </p>
            <p className="text-muted-foreground mt-3 text-sm">
              {soundCatalog.length} {c.results} · {c.headphone}
            </p>
            <nav
              aria-label={s("studioSections")}
              className="mt-3 flex flex-wrap gap-x-5"
            >
              {[
                ["compare", "01"],
                ["listen", "02"],
                ["archive", "03"],
              ].map(([id, number]) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="border-foreground/25 hover:border-primary inline-flex min-h-11 items-center gap-2 border-b text-sm"
                >
                  <span className="text-xs opacity-60">{number}</span>
                  {s(id)}
                </a>
              ))}
            </nav>
          </header>
          <div className={`${editorial.workbench} space-y-6 sm:space-y-8`}>
            <CuratedSounds />
            <SoundStudioArchive />
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-current/20 py-6">
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
