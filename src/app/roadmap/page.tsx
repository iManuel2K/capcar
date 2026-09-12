import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { RoadmapPage } from "@/components/marketing/roadmap-page";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Roadmap");
  return { title: t("eyebrow"), description: t("description") };
}

export default function Roadmap() {
  return <RoadmapPage />;
}
