import type { Metadata } from "next";

import { PartDetail } from "@/components/parts/part-detail";

export const metadata: Metadata = { title: "Part details" };

export default async function PartPage({
  params,
}: {
  params: Promise<{ vehicleId: string; partId: string }>;
}) {
  const { vehicleId, partId } = await params;
  return <PartDetail vehicleId={vehicleId} partId={partId} />;
}
