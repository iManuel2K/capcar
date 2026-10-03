import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { TripPlanner } from "@/components/trips/trip-planner";
import { pageMetadata } from "@/features/seo/public-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AIPlanner");
  return pageMetadata("/ai", t("metaTitle"), t("metaDescription"));
}

export default function AIPlannerPage() {
  return <TripPlanner />;
}
