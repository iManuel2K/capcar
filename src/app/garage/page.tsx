import type { Metadata } from "next";

import { GarageOverview } from "@/components/garage/garage-overview";

export const metadata: Metadata = { title: "Garage" };

export default function GaragePage() {
  return <GarageOverview />;
}
