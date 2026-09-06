import type { Metadata } from "next";

import { KnownProblemsDashboard } from "@/components/problems/known-problems-dashboard";

export const metadata: Metadata = { title: "Known problems" };

export default async function KnownProblemsPage({ params }: { params: Promise<{ vehicleId: string }> }) {
  const { vehicleId } = await params;
  return <KnownProblemsDashboard vehicleId={vehicleId} />;
}
