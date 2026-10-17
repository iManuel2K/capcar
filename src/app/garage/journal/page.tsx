import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { JournalWorkspace } from "@/components/journal/journal-checklist";
import { isAppLocale } from "@/i18n/config";
import { isJournalSlug } from "@/features/journal/routes";
export const metadata: Metadata = {
  title: "Journal checklists",
  robots: { index: false },
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    article?: string;
    locale?: string;
    vehicle?: string;
  }>;
}) {
  const query = await searchParams;
  const selectedLocale = query.locale ?? (await getLocale());
  return (
    <JournalWorkspace
      locale={isAppLocale(selectedLocale) ? selectedLocale : "en"}
      articleSlug={
        query.article && isJournalSlug(query.article)
          ? query.article
          : undefined
      }
      initialVehicleId={query.vehicle}
    />
  );
}
