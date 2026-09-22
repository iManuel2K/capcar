import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { RoadmapPage } from "@/components/marketing/roadmap-page";
import { canonicalMetadata } from "@/features/seo/public-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Roadmap");
  return {
    ...canonicalMetadata("/roadmap"),
    title: t("eyebrow"),
    description: t("description"),
  };
}

export default function Roadmap() {
  return <RoadmapPage />;
}
