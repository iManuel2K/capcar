import type { Metadata } from "next";

import { VehicleDetail } from "@/components/garage/vehicle-detail";

export const metadata: Metadata = { title: "Vehicle" };

export default async function VehiclePage({
  params,
}: {
  params: Promise<{ vehicleId: string }>;
}) {
  const { vehicleId } = await params;
  return <VehicleDetail vehicleId={vehicleId} />;
}
