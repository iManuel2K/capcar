import type { Metadata } from "next";

import { InstallGuide } from "@/components/guides/install-guide";

export const metadata: Metadata = { title: "Guided installation" };

export default async function GuidePage({
  params,
}: {
  params: Promise<{ vehicleId: string; guideSlug: string }>;
}) {
  const { vehicleId, guideSlug } = await params;
  return <InstallGuide vehicleId={vehicleId} guideSlug={guideSlug} />;
}
