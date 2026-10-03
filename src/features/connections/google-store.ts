import type { SupabaseClient } from "@supabase/supabase-js";

import {
  decryptConnectionToken,
  encryptConnectionToken,
} from "@/features/connections/token-crypto";
import {
  refreshGoogleAccessToken,
  type GoogleTokens,
} from "@/features/connections/google-api";
import {
  GOOGLE_PROVIDER,
  type GoogleConnectionEnvironment,
} from "@/features/connections/google-connection";

export type GoogleConnectionRecord = {
  user_id: string;
  provider: string;
  provider_account_email: string;
  access_token_ciphertext: string;
  refresh_token_ciphertext: string | null;
  scopes: string[];
  expires_at: string;
  last_synced_at: string | null;
  sync_status: string;
  sync_summary: {
    busyDates?: string[];
    calendarEventCount?: number;
    mailSignals?: Array<{ subject: string; date?: string }>;
    mailScannedCount?: number;
  } | null;
};

export async function getGoogleConnection(
  admin: SupabaseClient,
  userId: string,
) {
  const { data, error } = await admin
    .from("external_connections")
    .select(
      "user_id,provider,provider_account_email,access_token_ciphertext,refresh_token_ciphertext,scopes,expires_at,last_synced_at,sync_status,sync_summary",
    )
    .eq("user_id", userId)
    .eq("provider", GOOGLE_PROVIDER)
    .maybeSingle();
  if (error) throw error;
  return data as GoogleConnectionRecord | null;
}

export async function saveGoogleConnection(
  admin: SupabaseClient,
  userId: string,
  email: string,
  tokens: GoogleTokens,
  environment: GoogleConnectionEnvironment,
) {
  const existing = tokens.refresh_token
    ? null
    : await getGoogleConnection(admin, userId);
  const { error } = await admin.from("external_connections").upsert(
    {
      user_id: userId,
      provider: GOOGLE_PROVIDER,
      provider_account_email: email,
      access_token_ciphertext: encryptConnectionToken(
        tokens.access_token,
        environment.GOOGLE_CONNECTION_ENCRYPTION_KEY,
      ),
      refresh_token_ciphertext: tokens.refresh_token
        ? encryptConnectionToken(
            tokens.refresh_token,
            environment.GOOGLE_CONNECTION_ENCRYPTION_KEY,
          )
        : (existing?.refresh_token_ciphertext ?? null),
      scopes: (tokens.scope || "").split(" ").filter(Boolean),
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      sync_status: "connected",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,provider" },
  );
  if (error) throw error;
}

export async function getFreshGoogleAccessToken(
  admin: SupabaseClient,
  connection: GoogleConnectionRecord,
  environment: GoogleConnectionEnvironment,
) {
  if (new Date(connection.expires_at).valueOf() > Date.now() + 60_000) {
    return decryptConnectionToken(
      connection.access_token_ciphertext,
      environment.GOOGLE_CONNECTION_ENCRYPTION_KEY,
    );
  }
  if (!connection.refresh_token_ciphertext)
    throw new Error("Reconnect Google to renew access.");
  const refreshToken = decryptConnectionToken(
    connection.refresh_token_ciphertext,
    environment.GOOGLE_CONNECTION_ENCRYPTION_KEY,
  );
  const tokens = await refreshGoogleAccessToken(refreshToken, environment);
  const { error } = await admin
    .from("external_connections")
    .update({
      access_token_ciphertext: encryptConnectionToken(
        tokens.access_token,
        environment.GOOGLE_CONNECTION_ENCRYPTION_KEY,
      ),
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      sync_status: "connected",
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", connection.user_id)
    .eq("provider", GOOGLE_PROVIDER);
  if (error) throw error;
  return tokens.access_token;
}
