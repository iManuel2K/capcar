import { NextResponse } from "next/server";

import {
  getGoogleConnectionStatus,
  GOOGLE_OAUTH_SCOPES,
} from "@/features/connections/google-connection";
import { getGoogleConnection } from "@/features/connections/google-store";
import { createAdminClient } from "@/lib/supabase/admin";
import { currentUser } from "@/lib/supabase/current-user";

export const runtime = "nodejs";

export async function GET() {
  const user = await currentUser();
  if (!user)
    return NextResponse.json(
      { error: "Sign in to manage connections." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  const setup = getGoogleConnectionStatus();
  if (!setup.configured)
    return NextResponse.json(
      { configured: false, connected: false, message: setup.message },
      { headers: { "Cache-Control": "no-store" } },
    );
  try {
    const connection = await getGoogleConnection(createAdminClient(), user.id);
    return NextResponse.json(
      {
        configured: true,
        connected: Boolean(connection),
        email: connection?.provider_account_email,
        lastSyncedAt: connection?.last_synced_at,
        syncStatus: connection?.sync_status,
        summary: connection?.sync_summary,
        permissions: {
          calendar: GOOGLE_OAUTH_SCOPES.some((scope) =>
            scope.includes("calendar.events"),
          ),
          mailMetadata: GOOGLE_OAUTH_SCOPES.some((scope) =>
            scope.includes("gmail.metadata"),
          ),
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Connection status is temporarily unavailable." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
