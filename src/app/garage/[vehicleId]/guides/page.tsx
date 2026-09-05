import type { Metadata } from "next";

import { GuideLibrary } from "@/components/guides/guide-library";

export const metadata: Metadata = { title: "Guide library" };

export default async function GuidesPage({
  params,
}: {
  params: Promise<{ vehicleId: string }>;
}) {
  const { vehicleId } = await params;
  return <GuideLibrary vehicleId={vehicleId} />;
}
