import { NextResponse } from "next/server";

import { askCopilot } from "@/features/copilot/copilot-provider";
import { copilotRequestSchema } from "@/features/copilot/copilot-schema";
import {
  askConnectedCopilot,
  CopilotProviderError,
} from "@/features/copilot/connected-copilot";
import {
  getAiConnection,
  getAiConnectionSetup,
} from "@/features/connections/ai-connection";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  guardProductApi,
  isSameOriginRequest,
  productApiError,
  readJsonRequest,
} from "@/lib/api/guard";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request))
    return NextResponse.json(
      { error: "Same-origin request required." },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  const guard = await guardProductApi("copilot-chat", { limit: 15 });
  if (!guard.ok) return guard.response;
  try {
    const input = await readJsonRequest(request, copilotRequestSchema, 100_000);
    const connection = await (async () => {
      if (!guard.userId || !getAiConnectionSetup().configured) return null;
      try {
        return await getAiConnection(createAdminClient(), guard.userId);
      } catch {
        throw new CopilotProviderError(
          "Your AI connection could not be checked. Please try again later.",
          503,
        );
      }
    })();
    if ((input.intent || input.research) && !connection)
      return NextResponse.json(
        {
          error:
            "Connect Gemini, OpenAI or Claude under Account → Connections to review your tuning roadmap with AI.",
          code: "ai_connection_required",
        },
        { status: 409, headers: { "Cache-Control": "no-store" } },
      );
    return NextResponse.json(
      connection
        ? await askConnectedCopilot(input, connection, request.signal)
        : await askCopilot(input),
      {
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    if (error instanceof CopilotProviderError)
      return NextResponse.json(
        { error: error.message },
        { status: error.status, headers: { "Cache-Control": "no-store" } },
      );
    return productApiError(error, "Copilot request failed.");
  }
}
