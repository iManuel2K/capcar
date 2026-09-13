import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PublicPassport } from "@/components/passport/public-passport";
import { vehiclePassportSchema } from "@/features/passport/vehicle-passport";
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
      .select("payload, created_at")
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

  return (
    <PublicPassport
      passport={parsed.data}
      publishedAt={result.data.created_at}
      liveUrl={`${process.env.NEXT_PUBLIC_SITE_URL ?? "https://capcar-im.netlify.app"}/passport/${shareId}`}
    />
  );
}
