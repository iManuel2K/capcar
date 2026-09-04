import type { Metadata } from "next";

import { AddVehicleForm } from "@/components/garage/add-vehicle-form";

export const metadata: Metadata = { title: "Add vehicle" };

export default function AddVehiclePage() {
  return <AddVehicleForm />;
}
