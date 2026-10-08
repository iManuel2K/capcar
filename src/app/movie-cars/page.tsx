import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowUpRight, ScanEye, Palette, FolderHeart } from "lucide-react";
import { SiteFooter } from "@/components/marketing/site-footer";
import { IconicGallery } from "@/components/visualizer/iconic-gallery";
import { pageMetadata } from "@/features/seo/public-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("StudioPolish");
  return pageMetadata("/movie-cars", t("movieCars"), t("movieDescription"));
}

export default async function MovieCarsPage() {
  const t = await getTranslations("StudioPolish");
  return (
    <div className="capcar-paper-grid min-h-dvh bg-[#e8e6d7] text-[#0e2d30]">
      <main className="mx-auto max-w-[1280px] px-5 pt-10 pb-16 sm:px-8 sm:pt-16">
        <header className="mb-10 sm:mb-14">
          <p className="text-xs font-semibold tracking-[.2em] text-[#6d0101] uppercase">
            CapCar / {t("movieCars")}
          </p>
          <h1 className="mt-5 max-w-4xl text-5xl leading-[1.02] font-medium tracking-[-.055em] sm:text-7xl">
            {t("movieTitle")}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#0e2d30]/75">
            {t("movieDescription")}
          </p>
          <p className="mt-4 max-w-2xl text-xs leading-6 text-[#0e2d30]/65">
            {t("galleryScope")}
          </p>
        </header>
        <IconicGallery />
        <section
          aria-label={t("makeItYours")}
          className="mt-8 grid gap-4 md:grid-cols-3"
        >
          {[
            [ScanEye, "inspectTitle", "inspectText"],
            [Palette, "shapeTitle", "shapeText"],
            [FolderHeart, "planTitle", "planText"],
          ].map(([Icon, title, detail], index) => {
            const Symbol = Icon as typeof ScanEye;
            return (
              <article
                key={String(title)}
                className="rounded-2xl border border-[#0e2d30]/15 bg-white/25 p-6"
              >
                <div className="flex items-center justify-between">
                  <Symbol
                    aria-hidden="true"
                    className="size-5 text-[#6d0101]"
                  />
                  <span className="text-xs text-[#0e2d30]/50">
                    0{index + 1}
                  </span>
                </div>
                <h2 className="mt-5 text-xl font-medium tracking-tight">
                  {t(String(title))}
                </h2>
                <p className="mt-3 text-sm leading-6 text-[#0e2d30]/70">
                  {t(String(detail))}
                </p>
              </article>
            );
          })}
        </section>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[#0e2d30]/15 pt-7">
          <p className="text-sm text-[#0e2d30]/70">{t("soundInvitation")}</p>
          <Link
            href="/sound-studio"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#0e2d30] px-5 text-sm font-medium text-[#e8e6d7]"
          >
            {t("soundStudio")}
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
