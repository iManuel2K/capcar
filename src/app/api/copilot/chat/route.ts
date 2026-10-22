import { NextResponse } from "next/server";

import { askCopilot } from "@/features/copilot/copilot-provider";
import { copilotRequestSchema } from "@/features/copilot/copilot-schema";
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
    const input = await readJsonRequest(request, copilotRequestSchema);
    return NextResponse.json(await askCopilot(input), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return productApiError(error, "Copilot request failed.");
  }
}
