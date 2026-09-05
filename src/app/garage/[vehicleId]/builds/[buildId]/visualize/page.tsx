import type { Metadata } from "next";

import { BuildVisualizer } from "@/components/visualizer/build-visualizer";

export const metadata: Metadata = { title: "Build visualizer" };

export default async function VisualizeBuildPage({
  params,
}: {
  params: Promise<{ vehicleId: string; buildId: string }>;
}) {
  const { vehicleId, buildId } = await params;
  return <BuildVisualizer vehicleId={vehicleId} buildId={buildId} />;
}
