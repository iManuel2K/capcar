import type { Metadata } from "next";

import { CopilotWorkspace } from "@/components/copilot/copilot-workspace";

import {
  getAiConnection,
  getAiConnectionSetup,
} from "@/features/connections/ai-connection";
import { getCopilotStatus } from "@/features/copilot/copilot-provider";
import { currentUser } from "@/lib/supabase/current-user";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Project-car copilot" };

export default async function CopilotPage({
  params,
}: {
  params: Promise<{ vehicleId: string }>;
}) {
  const { vehicleId } = await params;
  let status: {
    mode: "deterministic" | "external" | "unavailable";
    providerName: string;
  } = getCopilotStatus();
  if (status.mode === "external" && !getCopilotStatus().configured)
    status = { mode: "unavailable", providerName: "CapCar Copilot" };
  try {
    const user = await currentUser();
    if (user && getAiConnectionSetup().configured) {
      const connection = await getAiConnection(createAdminClient(), user.id);
      if (connection)
        status = {
          mode: "external",
          providerName:
            connection.provider === "openai"
              ? "Your OpenAI"
              : connection.provider === "anthropic"
                ? "Your Claude"
                : "Your Gemini",
        };
    }
  } catch {
    status = { mode: "unavailable", providerName: "CapCar Copilot" };
  }
  return <CopilotWorkspace vehicleId={vehicleId} status={status} />;
}
