import type { Metadata } from "next";

import { MaintenanceDashboard } from "@/components/maintenance/maintenance-dashboard";

export const metadata: Metadata = { title: "Maintenance" };

export default async function MaintenancePage({
  params,
}: {
  params: Promise<{ vehicleId: string }>;
}) {
  const { vehicleId } = await params;
  return <MaintenanceDashboard vehicleId={vehicleId} />;
}
