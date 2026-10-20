import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { PlatformOverview } from "@/components/marketing/platform-overview";
import { platformCopy } from "@/features/marketing/platform-copy";
import { pageMetadata } from "@/features/seo/public-metadata";
import { isAppLocale } from "@/i18n/config";
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const c = platformCopy[isAppLocale(locale) ? locale : "en"];
  return pageMetadata("/platform", c.label, c.description);
}
export default async function PlatformPage() {
  const locale = await getLocale();
  return <PlatformOverview locale={isAppLocale(locale) ? locale : "en"} />;
}
