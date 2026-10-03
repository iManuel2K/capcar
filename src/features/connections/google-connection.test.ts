import { describe, expect, it } from "vitest";

import {
  createGoogleOAuthAttempt,
  getGoogleConnectionStatus,
  googleAuthorizationUrl,
  parseGoogleOAuthCookie,
} from "@/features/connections/google-connection";

const environment = {
  GOOGLE_OAUTH_CLIENT_ID: "google-client-id",
  GOOGLE_OAUTH_CLIENT_SECRET: "google-client-secret",
  GOOGLE_CONNECTION_ENCRYPTION_KEY: "x".repeat(32),
  SUPABASE_SECRET_KEY: "supabase-server-secret",
  NEXT_PUBLIC_SITE_URL: "https://capcar.dev",
};

describe("Google connection configuration", () => {
  it("creates a PKCE authorization URL with the required scopes", () => {
    const attempt = createGoogleOAuthAttempt();
    const url = googleAuthorizationUrl(environment, attempt);

    expect(url.origin).toBe("https://accounts.google.com");
    expect(url.searchParams.get("code_challenge")).toBe(attempt.challenge);
    expect(url.searchParams.get("scope")).toContain("calendar.events");
    expect(url.searchParams.get("scope")).toContain("gmail.metadata");
    expect(url.searchParams.get("redirect_uri")).toBe(
      "https://capcar.dev/api/connections/google/callback",
    );
  });

  it("does not report a partially configured connection as available", () => {
    expect(
      getGoogleConnectionStatus({ GOOGLE_OAUTH_CLIENT_ID: "client" }),
    ).toMatchObject({ configured: false });
  });

  it("rejects malformed OAuth state cookies", () => {
    expect(parseGoogleOAuthCookie("not json")).toBeNull();
    expect(
      parseGoogleOAuthCookie(JSON.stringify({ state: "short" })),
    ).toBeNull();
  });
});
