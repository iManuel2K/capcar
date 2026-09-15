import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { MarketingHeader } from "@/components/marketing/marketing-header";
import { RoadbookMapLoader } from "@/components/roadbook/roadbook-map-loader";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Roadbook");
  return { title: t("title"), description: t("description") };
}

export default function RoadbookPage() {
  return (
    <div className="min-h-dvh bg-[#0b0e0c]">
      <div className="relative z-50 bg-[#e8e6d7]">
        <MarketingHeader />
      </div>
      <main id="main-content">
        <RoadbookMapLoader />
      </main>
    </div>
  );
}
