import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";

import { TripPlanner } from "@/components/trips/trip-planner";
import { getAiConnection } from "@/features/connections/ai-connection";
import {
  localizedPublicPath,
  pageMetadata,
} from "@/features/seo/public-metadata";
import { createAdminClient } from "@/lib/supabase/admin";
import { currentUser } from "@/lib/supabase/current-user";
import { AIPlannerPreview } from "@/components/marketing/ai-planner-preview";
import { resolveJournalLocale } from "@/features/journal/routes";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AIPlanner");
  const user = await currentUser();
  return pageMetadata("/ai", t("metaTitle"), t("metaDescription"), {
    index: !user,
    follow: true,
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
  const locale = resolveJournalLocale(await getLocale());
  const returnTo = `${localizedPublicPath("/ai", locale)}${params.size ? `?${params}` : ""}`;
  const user = await currentUser();
  if (!user) {
    return <AIPlannerPreview locale={locale} returnTo={returnTo} />;
  }

  const aiConnection = await getAiConnection(
    createAdminClient(),
    user.id,
  ).catch(() => null);
  if (!aiConnection)
    redirect(`/account/connections?next=${encodeURIComponent(returnTo)}`);

  return (
    <TripPlanner
      key={user.id}
      ownerId={user.id}
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
