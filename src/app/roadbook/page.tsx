import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { RoadbookMapLoader } from "@/components/roadbook/roadbook-map-loader";
import { canonicalMetadata } from "@/features/seo/public-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Roadbook");
  return {
    ...canonicalMetadata("/roadbook"),
    title: t("title"),
    description: t("description"),
  };
}

export default function RoadbookPage() {
  return (
    <div className="min-h-dvh bg-[#0b0e0c]">
      <main id="main-content">
        <RoadbookMapLoader />
      </main>
    </div>
  );
}
