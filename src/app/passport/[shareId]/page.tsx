import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PublicPassport } from "@/components/passport/public-passport";
import { vehiclePassportSchema } from "@/features/passport/vehicle-passport";
import { verifyPassportRecordHash } from "@/features/passport/passport-integrity";
import { PUBLIC_SITE_URL } from "@/features/seo/public-metadata";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("PublicPassport");
  return {
    title: t("document"),
    robots: { index: false, follow: false },
  };
}

export default async function SharedPassportPage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;
  let result;
  try {
    const client = await createClient();
    result = await client
      .from("vehicle_passports")
      .select(
        "payload, created_at, updated_at, record_hash, expires_at, revoked_at",
      )
      .eq("share_id", shareId)
      .eq("is_public", true)
      .maybeSingle();
  } catch {
    throw new Error("Passport record service unavailable");
  }

  if (result.error) throw new Error("Passport record service unavailable");
  if (!result.data) notFound();
  const parsed = vehiclePassportSchema.safeParse(result.data.payload);
  if (!parsed.success) notFound();
  const integrity = await verifyPassportRecordHash(
    parsed.data,
    result.data.record_hash,
  );
  if (integrity === "invalid") notFound();

  return (
    <PublicPassport
      passport={parsed.data}
      publishedAt={result.data.created_at}
      updatedAt={result.data.updated_at}
      expiresAt={result.data.expires_at}
      recordHash={result.data.record_hash}
      integrity={integrity}
      liveUrl={new URL(`/passport/${shareId}`, PUBLIC_SITE_URL).toString()}
    />
  );
}
