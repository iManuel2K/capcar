import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { TripPlanner } from "@/components/trips/trip-planner";
import { getAiConnection } from "@/features/connections/ai-connection";
import { pageMetadata } from "@/features/seo/public-metadata";
import { createAdminClient } from "@/lib/supabase/admin";
import { currentUser } from "@/lib/supabase/current-user";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AIPlanner");
  return pageMetadata("/ai", t("metaTitle"), t("metaDescription"));
}

export default async function AIPlannerPage() {
  const user = await currentUser();
  if (!user) redirect("/login?next=/ai");

  const aiConnection = await getAiConnection(
    createAdminClient(),
    user.id,
  ).catch(() => null);
  if (!aiConnection) redirect("/account/connections?next=/ai");

  return (
    <TripPlanner
      initialAiConnection={{
        configured: true,
        connected: true,
        provider: aiConnection.provider,
      }}
    />
  );
}
