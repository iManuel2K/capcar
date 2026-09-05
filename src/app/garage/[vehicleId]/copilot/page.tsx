import type { Metadata } from "next";

import { CopilotWorkspace } from "@/components/copilot/copilot-workspace";

export const metadata: Metadata = { title: "Project-car copilot" };

export default async function CopilotPage({
  params,
}: {
  params: Promise<{ vehicleId: string }>;
}) {
  const { vehicleId } = await params;
  return <CopilotWorkspace vehicleId={vehicleId} />;
}
