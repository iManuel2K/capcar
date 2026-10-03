import { NextResponse } from "next/server";

import { getGooglePlanningContext } from "@/features/connections/google-api";
import {
  getGoogleConnectionEnvironment,
  GOOGLE_PROVIDER,
} from "@/features/connections/google-connection";
import {
  getFreshGoogleAccessToken,
  getGoogleConnection,
} from "@/features/connections/google-store";
import { isSameOriginRequest } from "@/lib/api/guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { currentUser } from "@/lib/supabase/current-user";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request))
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  const user = await currentUser();
  if (!user)
    return NextResponse.json(
      { error: "Sign in to sync connections." },
      { status: 401 },
    );
  try {
    const environment = getGoogleConnectionEnvironment();
    const admin = createAdminClient();
    const connection = await getGoogleConnection(admin, user.id);
    if (!connection)
      return NextResponse.json(
        { error: "Connect Google before syncing." },
        { status: 409 },
      );
    const accessToken = await getFreshGoogleAccessToken(
      admin,
      connection,
      environment,
    );
    const summary = await getGooglePlanningContext(accessToken);
    const syncedAt = new Date().toISOString();
    const { error } = await admin
      .from("external_connections")
      .update({
        last_synced_at: syncedAt,
        sync_status: "ready",
        sync_summary: summary,
        updated_at: syncedAt,
      })
      .eq("user_id", user.id)
      .eq("provider", GOOGLE_PROVIDER);
    if (error) throw error;
    return NextResponse.json(
      { summary, lastSyncedAt: syncedAt, syncStatus: "ready" },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Google sync failed. Reconnect if the permission expired." },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
