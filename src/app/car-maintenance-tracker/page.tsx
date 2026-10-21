import { getLocale } from "next-intl/server";
import { FeatureDiscovery } from "@/components/marketing/feature-discovery";
import { featureDiscoveryCopy } from "@/features/marketing/feature-discovery-copy";
import { resolveJournalLocale } from "@/features/journal/routes";
import { pageMetadata } from "@/features/seo/public-metadata";
import { publicTitle } from "@/features/seo/public-titles";

export async function generateMetadata() {
  const locale = resolveJournalLocale(await getLocale());
  return pageMetadata(
    "/car-maintenance-tracker",
    publicTitle(locale, "maintenance"),
    featureDiscoveryCopy[locale].maintenance.description,
  );
}
export default async function MaintenanceTrackerPage() {
  return (
    <FeatureDiscovery
      locale={resolveJournalLocale(await getLocale())}
      feature="maintenance"
    />
  );
}
