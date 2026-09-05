import type { Metadata } from "next";

import { TimelineDashboard } from "@/components/timeline/timeline-dashboard";

export const metadata: Metadata = { title: "Vehicle timeline" };

export default async function TimelinePage({
  params,
}: {
  params: Promise<{ vehicleId: string }>;
}) {
  const { vehicleId } = await params;
  return <TimelineDashboard vehicleId={vehicleId} />;
}
