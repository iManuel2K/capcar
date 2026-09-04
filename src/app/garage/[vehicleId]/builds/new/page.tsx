import type { Metadata } from "next";

import { CreateBuildForm } from "@/components/builds/create-build-form";

export const metadata: Metadata = { title: "New build" };

export default async function NewBuildPage({
  params,
}: {
  params: Promise<{ vehicleId: string }>;
}) {
  const { vehicleId } = await params;
  return <CreateBuildForm vehicleId={vehicleId} />;
}
