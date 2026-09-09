import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PublicPassport } from "@/components/passport/public-passport";
import { vehiclePassportSchema } from "@/features/passport/vehicle-passport";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shared Vehicle Passport",
  robots: { index: false, follow: false },
};

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
    notFound();
  }

  if (result.error || !result.data) notFound();
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
