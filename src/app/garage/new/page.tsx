import { safeAuthNext } from "@/features/auth/next-path";
import type { Metadata } from "next";

import { AddVehicleForm } from "@/components/garage/add-vehicle-form";

export const metadata: Metadata = { title: "Add vehicle" };

export default async function AddVehiclePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const query = await searchParams;
  const next = safeAuthNext(query.next);
  return (
    <AddVehicleForm
      returnTo={next.startsWith("/garage/journal?") ? next : undefined}
    />
  );
}
