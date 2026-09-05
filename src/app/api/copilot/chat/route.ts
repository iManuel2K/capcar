import { NextResponse } from "next/server";

import { askCopilot } from "@/features/copilot/copilot-provider";
import { copilotRequestSchema } from "@/features/copilot/copilot-schema";

export async function POST(request: Request) {
  try {
    const input = copilotRequestSchema.parse(await request.json());
    return NextResponse.json(await askCopilot(input));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Copilot failed." },
      { status: 400 },
    );
  }
}
