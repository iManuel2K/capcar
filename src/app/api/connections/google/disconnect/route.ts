import { NextResponse } from "next/server";

import { revokeGoogleToken } from "@/features/connections/google-api";
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

export async function DELETE(request: Request) {
  if (!isSameOriginRequest(request))
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  const user = await currentUser();
  if (!user)
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  try {
    const admin = createAdminClient();
    const connection = await getGoogleConnection(admin, user.id);
    if (connection) {
      try {
        const environment = getGoogleConnectionEnvironment();
        const accessToken = await getFreshGoogleAccessToken(
          admin,
          connection,
          environment,
        );
        await revokeGoogleToken(accessToken);
      } catch {
        // Local deletion remains authoritative when Google is unavailable or
        // the grant has already expired/revoked.
      }
    }
    const { error } = await admin
      .from("external_connections")
      .delete()
      .eq("user_id", user.id)
      .eq("provider", GOOGLE_PROVIDER);
    if (error) throw error;
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json(
      { error: "Google could not be disconnected." },
      { status: 503 },
    );
  }
}
