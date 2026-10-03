import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  createGoogleOAuthAttempt,
  getGoogleConnectionEnvironment,
  GOOGLE_OAUTH_COOKIE,
  googleAuthorizationUrl,
} from "@/features/connections/google-connection";
import { currentUser } from "@/lib/supabase/current-user";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", "/account/connections");
    return NextResponse.redirect(login);
  }
  try {
    const environment = getGoogleConnectionEnvironment();
    const attempt = createGoogleOAuthAttempt();
    const cookieStore = await cookies();
    cookieStore.set(
      GOOGLE_OAUTH_COOKIE,
      JSON.stringify({ state: attempt.state, verifier: attempt.verifier }),
      {
        httpOnly: true,
        secure: environment.NEXT_PUBLIC_SITE_URL.startsWith("https://"),
        sameSite: "lax",
        path: "/api/connections/google/callback",
        maxAge: 10 * 60,
      },
    );
    return NextResponse.redirect(googleAuthorizationUrl(environment, attempt));
  } catch {
    const destination = new URL("/account/connections", request.url);
    destination.searchParams.set("connection", "unavailable");
    return NextResponse.redirect(destination);
  }
}
