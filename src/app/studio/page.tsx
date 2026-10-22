import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ConceptStudio } from "@/components/visualizer/concept-studio";
import { canonicalMetadata } from "@/features/seo/public-metadata";
import Link from "next/link";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("StudioPage");
  return {
    ...canonicalMetadata("/studio"),
    title: t("title"),
    description: t("description"),
  };
}
export default async function StudioPage() {
  const t = await getTranslations("StudioPage");
  const s = await getTranslations("StudioPolish");
  return (
    <main
      id="main-content"
      className="bg-background text-foreground min-h-dvh px-5 py-4 sm:px-8 sm:py-8"
    >
      <div className="mx-auto max-w-6xl">
        <p className="mt-4 text-xs font-semibold tracking-widest uppercase">
          CapCar / {t("eyebrow")}
        </p>
        <h1 className="mt-3 text-3xl font-medium tracking-tight sm:text-6xl">
          {t("title")}
        </h1>
        <p className="mt-4 mb-5 max-w-2xl text-base leading-7 sm:mb-8">
          {t("description")}
        </p>
        <ConceptStudio />
        <Link
          href="/movie-cars"
          className="border-foreground/20 mt-8 inline-flex min-h-11 items-center rounded-full border px-5 text-sm font-medium"
        >
          {s("movieCars")} ↗
        </Link>
      </div>
    </main>
  );
}
