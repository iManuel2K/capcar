import { createCopilotStream } from "@/features/copilot/chat-transport";
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
  try {
    const guard = await guardProductApi("copilot-chat", { limit: 15 }).catch(
      () => {
        throw new CopilotProviderError(
          "The account connection is temporarily unavailable. Please try again.",
          503,
          "account_guard_unavailable",
        );
      },
    );
    if (!guard.ok) return guard.response;
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
    const run = (signal: AbortSignal) =>
      connection
        ? askConnectedCopilot(input, connection, signal)
        : askCopilot(input);
    if (request.headers.get("accept")?.includes("application/x-ndjson")) {
      return createCopilotStream(
        (signal) => run(AbortSignal.any([request.signal, signal])),
        (error) => {
          const status =
            error instanceof CopilotProviderError ? error.status : 503;
          const code =
            error instanceof CopilotProviderError
              ? error.code
              : "chat_unavailable";
          console.warn("Copilot request failed", {
            status,
            code,
            upstreamStatus:
              error instanceof CopilotProviderError
                ? error.upstreamStatus
                : undefined,
          });
          return {
            status,
            code,
            error:
              error instanceof CopilotProviderError
                ? error.message
                : "Chat is temporarily unavailable. Your question is kept; please try again.",
          };
        },
      );
    }
    return NextResponse.json(await run(request.signal), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof CopilotProviderError) {
      console.warn("Copilot request failed", {
        status: error.status,
        code: error.code,
        upstreamStatus: error.upstreamStatus,
      });
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status, headers: { "Cache-Control": "no-store" } },
      );
    }
    console.warn("Copilot request failed", { code: "chat_request_failed" });
    return productApiError(
      error,
      "Copilot request failed. Your question is kept; please try again.",
    );
  }
}
