import type { Metadata } from "next";

import { PartsCatalog } from "@/components/parts/parts-catalog";

export const metadata: Metadata = { title: "Parts" };

export default async function PartsPage({
  params,
}: {
  params: Promise<{ vehicleId: string }>;
}) {
  const { vehicleId } = await params;
  return <PartsCatalog vehicleId={vehicleId} />;
}
