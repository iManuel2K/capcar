import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { JournalWorkspace } from "@/components/journal/journal-checklist";
import { isAppLocale } from "@/i18n/config";
export const metadata: Metadata = {
  title: "Journal checklists",
  robots: { index: false },
};
export default async function Page({
  params,
}: {
  params: Promise<{ vehicleId: string }>;
}) {
  const { vehicleId } = await params;
  const locale = await getLocale();
  return (
    <JournalWorkspace
      locale={isAppLocale(locale) ? locale : "en"}
      initialVehicleId={vehicleId}
    />
  );
}
