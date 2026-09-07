import type { Metadata } from "next";

import { EditVehicleForm } from "@/components/garage/edit-vehicle-form";

export const metadata: Metadata = { title: "Edit vehicle" };

export default async function EditVehiclePage({
  params,
}: {
  params: Promise<{ vehicleId: string }>;
}) {
  const { vehicleId } = await params;
  return <EditVehicleForm vehicleId={vehicleId} />;
}
