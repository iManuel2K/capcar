import { NextResponse } from "next/server";

import {
  AiConnectionError,
  connectionStatus,
  deleteAiConnection,
  getAiConnection,
  getAiConnectionSetup,
  saveAiConnection,
  saveAiConnectionSchema,
  verifyAiConnection,
} from "@/features/connections/ai-connection";
import {
  guardProductApi,
  isSameOriginRequest,
  productApiError,
  readJsonRequest,
} from "@/lib/api/guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { currentUser } from "@/lib/supabase/current-user";

export const runtime = "nodejs";

const noStore = { "Cache-Control": "no-store" };

export async function GET() {
  const user = await currentUser();
  if (!user)
    return NextResponse.json(
      { error: "Sign in to manage AI connections." },
      { status: 401, headers: noStore },
    );
  const setup = getAiConnectionSetup();
  if (!setup.configured)
    return NextResponse.json(
      { ...setup, connected: false },
      { headers: noStore },
    );
  try {
    const record = await getAiConnection(createAdminClient(), user.id);
    return NextResponse.json(connectionStatus(record), { headers: noStore });
  } catch (error) {
    console.error("AI connection status failed", error);
    return NextResponse.json(
      { error: "AI connection status is unavailable." },
      { status: 503, headers: noStore },
    );
  }
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request))
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403, headers: noStore },
    );
  try {
    const guard = await guardProductApi("ai-connection", {
      limit: 5,
      windowSeconds: 300,
    });
    if (!guard.ok) return guard.response;
    const user = await currentUser();
    if (!user)
      return NextResponse.json(
        { error: "Sign in to connect an AI provider." },
        { status: 401, headers: noStore },
      );
    if (!getAiConnectionSetup().configured)
      return NextResponse.json(
        { error: "AI connection storage is not configured." },
        { status: 503, headers: noStore },
      );
    const input = await readJsonRequest(request, saveAiConnectionSchema, 2048);
    const { model } = await verifyAiConnection(input.provider, input.apiKey);
    const admin = createAdminClient();
    await saveAiConnection(admin, user.id, input.provider, input.apiKey, model);
    return NextResponse.json(
      connectionStatus(await getAiConnection(admin, user.id)),
      { headers: noStore },
    );
  } catch (error) {
    console.error(
      "AI connection failed",
      error instanceof AiConnectionError ? error.message : error,
    );
    if (error instanceof AiConnectionError)
      return NextResponse.json(
        { error: error.message },
        { status: error.status, headers: noStore },
      );
    return productApiError(error, "AI provider could not be connected.");
  }
}

export async function DELETE(request: Request) {
  if (!isSameOriginRequest(request))
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403, headers: noStore },
    );
  const user = await currentUser();
  if (!user)
    return NextResponse.json(
      { error: "Sign in to disconnect an AI provider." },
      { status: 401, headers: noStore },
    );
  try {
    await deleteAiConnection(createAdminClient(), user.id);
    return NextResponse.json(
      { configured: getAiConnectionSetup().configured, connected: false },
      { headers: noStore },
    );
  } catch (error) {
    console.error("AI disconnection failed", error);
    return NextResponse.json(
      { error: "AI provider could not be disconnected." },
      { status: 500, headers: noStore },
    );
  }
}
