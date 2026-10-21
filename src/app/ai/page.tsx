import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";

import { TripPlanner } from "@/components/trips/trip-planner";
import { getAiConnection } from "@/features/connections/ai-connection";
import { pageMetadata } from "@/features/seo/public-metadata";
import { createAdminClient } from "@/lib/supabase/admin";
import { currentUser } from "@/lib/supabase/current-user";
import { AIPlannerPreview } from "@/components/marketing/ai-planner-preview";
import { resolveJournalLocale } from "@/features/journal/routes";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AIPlanner");
  return pageMetadata("/ai", t("metaTitle"), t("metaDescription"), {
    index: false,
    follow: false,
  });
}

export default async function AIPlannerPage({
  searchParams,
}: {
  searchParams: Promise<{ journal?: string; vehicle?: string }>;
}) {
  const query = await searchParams;
  const journalTrip = query.journal === "ruesselsheim-rheingau-tagesausflug";
  const params = new URLSearchParams();
  if (journalTrip) {
    params.set("journal", query.journal!);
    if (query.vehicle) params.set("vehicle", query.vehicle);
  }
  const returnTo = `/ai${params.size ? `?${params}` : ""}`;
  const user = await currentUser();
  if (!user) {
    return (
      <AIPlannerPreview
        locale={resolveJournalLocale(await getLocale())}
        returnTo={returnTo}
      />
    );
  }

  const aiConnection = await getAiConnection(
    createAdminClient(),
    user.id,
  ).catch(() => null);
  if (!aiConnection)
    redirect(`/account/connections?next=${encodeURIComponent(returnTo)}`);

  return (
    <TripPlanner
      initialJournalTrip={journalTrip}
      initialVehicleId={journalTrip ? query.vehicle : undefined}
      initialAiConnection={{
        configured: true,
        connected: true,
        provider: aiConnection.provider,
      }}
    />
  );
}
