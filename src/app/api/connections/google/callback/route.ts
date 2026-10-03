import { timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  getGoogleConnectionEnvironment,
  GOOGLE_OAUTH_COOKIE,
  parseGoogleOAuthCookie,
} from "@/features/connections/google-connection";
import {
  exchangeGoogleCode,
  getGoogleUser,
} from "@/features/connections/google-api";
import { saveGoogleConnection } from "@/features/connections/google-store";
import { createAdminClient } from "@/lib/supabase/admin";
import { currentUser } from "@/lib/supabase/current-user";

export const runtime = "nodejs";

function equalState(left: string, right: string) {
  const first = Buffer.from(left);
  const second = Buffer.from(right);
  return first.length === second.length && timingSafeEqual(first, second);
}

export async function GET(request: Request) {
  const destination = new URL("/account/connections", request.url);
  const url = new URL(request.url);
  const cookieStore = await cookies();
  const attempt = parseGoogleOAuthCookie(
    cookieStore.get(GOOGLE_OAUTH_COOKIE)?.value,
  );
  cookieStore.delete(GOOGLE_OAUTH_COOKIE);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const user = await currentUser();
  if (
    !user ||
    !attempt ||
    !code ||
    !state ||
    !equalState(attempt.state, state)
  ) {
    destination.searchParams.set("connection", "failed");
    return NextResponse.redirect(destination);
  }
  try {
    const environment = getGoogleConnectionEnvironment();
    const tokens = await exchangeGoogleCode(
      code,
      attempt.verifier,
      environment,
    );
    const profile = await getGoogleUser(tokens.access_token);
    await saveGoogleConnection(
      createAdminClient(),
      user.id,
      profile.email,
      tokens,
      environment,
    );
    destination.searchParams.set("connection", "connected");
  } catch {
    destination.searchParams.set("connection", "failed");
  }
  return NextResponse.redirect(destination);
}
