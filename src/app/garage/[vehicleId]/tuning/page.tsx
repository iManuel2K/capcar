import type { Metadata } from "next";

import { TuningAcademy } from "@/components/tuning/tuning-academy";

export const metadata: Metadata = { title: "Tuning academy" };

export default async function TuningPage({
  params,
}: {
  params: Promise<{ vehicleId: string }>;
}) {
  const { vehicleId } = await params;
  return <TuningAcademy vehicleId={vehicleId} />;
}
