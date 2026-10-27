import { getLocale } from "next-intl/server";
import { resolveJournalLocale } from "@/features/journal/routes";
import { pageMetadata } from "@/features/seo/public-metadata";
import { pricingCopy } from "@/features/marketing/pricing-copy";
import { PricingSection } from "@/components/marketing/pricing-section";

export async function generateMetadata() {
  const c = pricingCopy[resolveJournalLocale(await getLocale())];
  return pageMetadata("/pricing", c.nav, c.description);
}
export default async function PricingPage() {
  return <PricingSection locale={resolveJournalLocale(await getLocale())} />;
}
