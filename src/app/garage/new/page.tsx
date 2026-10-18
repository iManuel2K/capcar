import { safeAuthNext } from "@/features/auth/next-path";
import type { Metadata } from "next";

import { GarageOnboarding } from "@/components/garage/garage-onboarding";

export const metadata: Metadata = { title: "Add vehicle" };

export default async function AddVehiclePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; vehicle?: string; resume?: string }>;
}) {
  const query = await searchParams;
  const next = safeAuthNext(query.next);
  return (
    <GarageOnboarding
      initialVehicleId={query.vehicle?.slice(0, 200)}
      resumeId={query.resume?.slice(0, 36)}
      returnTo={next.startsWith("/garage/journal?") ? next : undefined}
    />
  );
}
