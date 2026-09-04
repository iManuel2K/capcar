import type { Metadata } from "next";

import { BuildDetail } from "@/components/builds/build-detail";

export const metadata: Metadata = { title: "Build studio" };

export default async function BuildPage({
  params,
}: {
  params: Promise<{ vehicleId: string; buildId: string }>;
}) {
  const { vehicleId, buildId } = await params;
  return <BuildDetail vehicleId={vehicleId} buildId={buildId} />;
}
