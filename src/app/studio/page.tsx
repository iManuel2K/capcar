import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ConceptStudio } from "@/components/visualizer/concept-studio";
import { canonicalMetadata } from "@/features/seo/public-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("StudioPage");
  return {
    ...canonicalMetadata("/studio"),
    title: t("eyebrow"),
    description: t("description"),
  };
}
export default async function StudioPage() {
  const t = await getTranslations("StudioPage");
  return (
    <main className="min-h-dvh bg-[#e8e6d7] px-5 py-8 text-[#0e2d30] sm:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="mt-4 text-xs font-semibold tracking-widest uppercase">
          CapCar / {t("eyebrow")}
        </p>
        <h1 className="mt-4 text-4xl font-medium tracking-tight sm:text-6xl">
          {t("title")}
        </h1>
        <p className="mt-5 mb-10 max-w-xl text-base leading-7">
          {t("description")}
        </p>
        <ConceptStudio />
      </div>
    </main>
  );
}
