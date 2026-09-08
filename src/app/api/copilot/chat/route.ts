import { NextResponse } from "next/server";

import { askCopilot } from "@/features/copilot/copilot-provider";
import { copilotRequestSchema } from "@/features/copilot/copilot-schema";
import {
  guardProductApi,
  productApiError,
  readJsonRequest,
} from "@/lib/api/guard";

export async function POST(request: Request) {
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
