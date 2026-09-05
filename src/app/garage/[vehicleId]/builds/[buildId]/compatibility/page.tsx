import type { Metadata } from "next";

import { CompatibilityReport } from "@/components/compatibility/compatibility-report";

export const metadata: Metadata = { title: "Build compatibility" };

export default async function BuildCompatibilityPage({
  params,
}: {
  params: Promise<{ vehicleId: string; buildId: string }>;
}) {
  const { vehicleId, buildId } = await params;
  return <CompatibilityReport vehicleId={vehicleId} buildId={buildId} />;
}
