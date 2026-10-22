import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { RoadbookMapLoader } from "@/components/roadbook/roadbook-map-loader";
import { canonicalMetadata } from "@/features/seo/public-metadata";
import Link from "@/components/i18n/public-link";
import { getLocale } from "next-intl/server";
import {
  resolveJournalLocale,
  journalArticlePath,
} from "@/features/journal/routes";
import { journalUI } from "@/features/journal/ui";
import { homepageCopy } from "@/features/marketing/homepage-copy";
import "leaflet/dist/leaflet.css";
import "./roadbook.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Roadbook");
  return {
    ...canonicalMetadata("/roadbook"),
    title: t("title"),
    description: t("description"),
  };
}

export default async function RoadbookPage() {
  const t = await getTranslations("Roadbook");
  const locale = resolveJournalLocale(await getLocale());
  return (
    <div className="bg-background min-h-dvh">
      <main id="main-content">
        <header className="bg-background text-foreground border-b border-white/10 px-5 py-6 sm:px-8">
          <div className="mx-auto max-w-[1440px]">
            <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
              {t("title")}
            </h1>
            <p className="text-foreground mt-2 max-w-3xl text-sm leading-6">
              {t("description")}
            </p>
            <p className="text-foreground mt-2 max-w-3xl text-sm leading-6">
              {homepageCopy[locale].drivesAccess}
            </p>
            <Link
              className="mt-2 inline-flex min-h-11 items-center underline underline-offset-4 focus-visible:outline-2"
              href={journalArticlePath(
                "ruesselsheim-rheingau-tagesausflug",
                locale,
              )}
            >
              {journalUI[locale].label} · Rüsselsheim → Rheingau
            </Link>
          </div>
        </header>
        <RoadbookMapLoader />
      </main>
    </div>
  );
}
