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
    <div className="capcar-paper-grid bg-background text-foreground min-h-dvh">
      <main
        id="main-content"
        className="mx-auto max-w-[1280px] px-5 pt-10 pb-16 sm:px-8 sm:pt-16"
      >
        <header className="mb-10 sm:mb-14">
          <p className="text-primary text-xs font-semibold tracking-[.2em] uppercase">
            CapCar / {t("movieCars")}
          </p>
          <h1 className="mt-5 max-w-4xl text-5xl leading-[1.02] font-medium tracking-[-.055em] sm:text-7xl">
            {t("movieTitle")}
          </h1>
          <p className="text-foreground/75 mt-5 max-w-2xl text-base leading-7">
            {t("movieDescription")}
          </p>
        </header>
        <IconicGallery />
        <section
          aria-label={t("makeItYours")}
          className="divide-foreground/15 border-foreground/15 mt-8 divide-y border-y"
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
                className="grid gap-4 py-5 sm:grid-cols-[40px_180px_1fr] sm:items-center"
              >
                <div className="flex items-center justify-between">
                  <Symbol aria-hidden="true" className="text-primary size-5" />
                  <span className="text-muted-foreground text-xs">
                    0{index + 1}
                  </span>
                </div>
                <h2 className="text-xl font-medium tracking-tight">
                  {t(String(title))}
                </h2>
                <p className="text-foreground/75 text-base leading-7">
                  {t(String(detail))}
                </p>
              </article>
            );
          })}
        </section>
        <div className="border-foreground/15 mt-10 flex flex-wrap items-center justify-between gap-4 border-t pt-7">
          <p className="text-foreground/70 text-sm">{t("soundInvitation")}</p>
          <Link
            href="/sound-studio"
            className="bg-card text-foreground inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-medium"
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
