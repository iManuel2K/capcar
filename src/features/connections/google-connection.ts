import { createHash, randomBytes } from "node:crypto";

import { z } from "zod";

export const GOOGLE_PROVIDER = "google";
export const GOOGLE_OAUTH_COOKIE = "capcar_google_oauth";
export const GOOGLE_OAUTH_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/gmail.metadata",
] as const;

const googleEnvironmentSchema = z.object({
  GOOGLE_OAUTH_CLIENT_ID: z.string().min(5),
  GOOGLE_OAUTH_CLIENT_SECRET: z.string().min(5),
  GOOGLE_CONNECTION_ENCRYPTION_KEY: z.string().min(32),
  SUPABASE_SECRET_KEY: z.string().min(10),
  NEXT_PUBLIC_SITE_URL: z.url(),
});

export type GoogleConnectionEnvironment = z.infer<
  typeof googleEnvironmentSchema
>;

export function getGoogleConnectionStatus(
  environment: Record<string, string | undefined> = process.env,
) {
  const result = googleEnvironmentSchema.safeParse({
    GOOGLE_OAUTH_CLIENT_ID: environment.GOOGLE_OAUTH_CLIENT_ID,
    GOOGLE_OAUTH_CLIENT_SECRET: environment.GOOGLE_OAUTH_CLIENT_SECRET,
    GOOGLE_CONNECTION_ENCRYPTION_KEY:
      environment.GOOGLE_CONNECTION_ENCRYPTION_KEY,
    SUPABASE_SECRET_KEY: environment.SUPABASE_SECRET_KEY,
    NEXT_PUBLIC_SITE_URL:
      environment.NEXT_PUBLIC_SITE_URL || environment.NEXT_PUBLIC_APP_URL,
  });
  return {
    configured: result.success,
    message: result.success
      ? "Google Calendar and Gmail connections are available."
      : "Google connection setup is incomplete.",
  };
}

export function getGoogleConnectionEnvironment(
  environment: Record<string, string | undefined> = process.env,
) {
  return googleEnvironmentSchema.parse({
    GOOGLE_OAUTH_CLIENT_ID: environment.GOOGLE_OAUTH_CLIENT_ID,
    GOOGLE_OAUTH_CLIENT_SECRET: environment.GOOGLE_OAUTH_CLIENT_SECRET,
    GOOGLE_CONNECTION_ENCRYPTION_KEY:
      environment.GOOGLE_CONNECTION_ENCRYPTION_KEY,
    SUPABASE_SECRET_KEY: environment.SUPABASE_SECRET_KEY,
    NEXT_PUBLIC_SITE_URL:
      environment.NEXT_PUBLIC_SITE_URL || environment.NEXT_PUBLIC_APP_URL,
  });
}

export function googleRedirectUri(environment: GoogleConnectionEnvironment) {
  return new URL(
    "/api/connections/google/callback",
    environment.NEXT_PUBLIC_SITE_URL,
  ).toString();
}

export function createGoogleOAuthAttempt() {
  const state = randomBytes(32).toString("base64url");
  const verifier = randomBytes(64).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  return { state, verifier, challenge };
}

export function googleAuthorizationUrl(
  environment: GoogleConnectionEnvironment,
  attempt: ReturnType<typeof createGoogleOAuthAttempt>,
) {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", environment.GOOGLE_OAUTH_CLIENT_ID);
  url.searchParams.set("redirect_uri", googleRedirectUri(environment));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", GOOGLE_OAUTH_SCOPES.join(" "));
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("include_granted_scopes", "true");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("state", attempt.state);
  url.searchParams.set("code_challenge", attempt.challenge);
  url.searchParams.set("code_challenge_method", "S256");
  return url;
}

export const googleOAuthCookieSchema = z.object({
  state: z.string().min(20),
  verifier: z.string().min(20),
});

export function parseGoogleOAuthCookie(value: string | undefined) {
  if (!value) return null;
  try {
    return googleOAuthCookieSchema.parse(JSON.parse(value));
  } catch {
    return null;
  }
}
