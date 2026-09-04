import type { Metadata } from "next";

import { BuildsOverview } from "@/components/builds/builds-overview";

export const metadata: Metadata = { title: "Builds" };

export default async function BuildsPage({
  params,
}: {
  params: Promise<{ vehicleId: string }>;
}) {
  const { vehicleId } = await params;
  return <BuildsOverview vehicleId={vehicleId} />;
}
