import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import {
  decryptConnectionToken,
  encryptConnectionToken,
} from "@/features/connections/token-crypto";

export const aiProviderSchema = z.enum(["openai", "anthropic"]);
export type AiProvider = z.infer<typeof aiProviderSchema>;

export const saveAiConnectionSchema = z.object({
  provider: aiProviderSchema,
  apiKey: z.string().trim().min(20).max(500),
});

export type AiConnectionRecord = {
  user_id: string;
  provider: AiProvider;
  api_key_ciphertext: string;
  key_hint: string;
  model: string;
  verified_at: string;
  created_at: string;
  updated_at: string;
};

export type AiConnectionEnvironment = Record<string, string | undefined>;

const providerDetails = {
  openai: {
    label: "OpenAI",
    defaultModel: "gpt-5.4-mini",
  },
  anthropic: {
    label: "Claude",
    defaultModel: "claude-sonnet-4-5-20250929",
  },
} as const;

export class AiConnectionError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "AiConnectionError";
  }
}

export function getAiConnectionEncryptionKey(
  environment: AiConnectionEnvironment = process.env,
) {
  const key =
    environment.AI_CONNECTION_ENCRYPTION_KEY ||
    environment.GOOGLE_CONNECTION_ENCRYPTION_KEY;
  if (!key)
    throw new Error(
      "AI connection encryption is not configured on this deployment.",
    );
  return key;
}

export function getAiConnectionSetup(
  environment: AiConnectionEnvironment = process.env,
) {
  return {
    configured: Boolean(
      (environment.AI_CONNECTION_ENCRYPTION_KEY ||
        environment.GOOGLE_CONNECTION_ENCRYPTION_KEY) &&
      environment.SUPABASE_SECRET_KEY,
    ),
  };
}

export function getAiProviderModel(
  provider: AiProvider,
  environment: AiConnectionEnvironment = process.env,
) {
  if (provider === "openai")
    return (
      environment.CAPCAR_TRIP_PLANNER_MODEL ||
      providerDetails.openai.defaultModel
    );
  return (
    environment.CAPCAR_ANTHROPIC_TRIP_PLANNER_MODEL ||
    providerDetails.anthropic.defaultModel
  );
}

function keyHint(apiKey: string) {
  const prefix = apiKey.slice(0, Math.min(7, apiKey.length - 4));
  return `${prefix}…${apiKey.slice(-4)}`;
}

function providerError(provider: AiProvider, status: number, message: string) {
  const label = providerDetails[provider].label;
  const normalized = message.toLocaleLowerCase();
  if (status === 401 || /invalid.+key|authentication/.test(normalized))
    return new AiConnectionError(
      `${label} rejected this API key. Check the key and try again.`,
      401,
    );
  if (/quota|billing|credit|insufficient_quota/.test(normalized))
    return new AiConnectionError(
      `${label} API credits are unavailable for this key. Add provider credits, then try again.`,
      402,
    );
  if (status === 403 || /permission|forbidden/.test(normalized))
    return new AiConnectionError(
      `${label} accepted the key but it cannot use the required model or API. Check its permissions.`,
      403,
    );
  if (status === 429)
    return new AiConnectionError(
      `${label} is rate-limiting this key. Wait a moment and try again.`,
      429,
    );
  return new AiConnectionError(
    `${label} could not verify this key. Try again in a moment.`,
    502,
  );
}

async function responseError(response: Response) {
  try {
    const body = (await response.json()) as {
      error?: { message?: string } | string;
      message?: string;
    };
    return typeof body.error === "string"
      ? body.error
      : body.error?.message || body.message || response.statusText;
  } catch {
    return response.statusText;
  }
}

export async function verifyAiConnection(
  provider: AiProvider,
  apiKey: string,
  environment: AiConnectionEnvironment = process.env,
) {
  const model = getAiProviderModel(provider, environment);
  const response =
    provider === "openai"
      ? await fetch("https://api.openai.com/v1/responses", {
          method: "POST",
          headers: {
            authorization: `Bearer ${apiKey}`,
            "content-type": "application/json",
          },
          signal: AbortSignal.timeout(15_000),
          body: JSON.stringify({
            model,
            store: false,
            input: "Reply with OK only.",
            reasoning: { effort: "low" },
            max_output_tokens: 32,
          }),
        })
      : await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
            "x-api-key": apiKey,
          },
          signal: AbortSignal.timeout(15_000),
          body: JSON.stringify({
            model,
            max_tokens: 8,
            messages: [{ role: "user", content: "Reply with OK only." }],
          }),
        });
  if (!response.ok)
    throw providerError(
      provider,
      response.status,
      await responseError(response),
    );
  return { model };
}

export async function getAiConnection(admin: SupabaseClient, userId: string) {
  const { data, error } = await admin
    .from("user_ai_connections")
    .select(
      "user_id,provider,api_key_ciphertext,key_hint,model,verified_at,created_at,updated_at",
    )
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as AiConnectionRecord | null;
}

export async function saveAiConnection(
  admin: SupabaseClient,
  userId: string,
  provider: AiProvider,
  apiKey: string,
  model: string,
  environment: AiConnectionEnvironment = process.env,
) {
  const now = new Date().toISOString();
  const { error } = await admin.from("user_ai_connections").upsert(
    {
      user_id: userId,
      provider,
      api_key_ciphertext: encryptConnectionToken(
        apiKey,
        getAiConnectionEncryptionKey(environment),
      ),
      key_hint: keyHint(apiKey),
      model,
      verified_at: now,
      updated_at: now,
    },
    { onConflict: "user_id" },
  );
  if (error) throw error;
}

export async function deleteAiConnection(
  admin: SupabaseClient,
  userId: string,
) {
  const { error } = await admin
    .from("user_ai_connections")
    .delete()
    .eq("user_id", userId);
  if (error) throw error;
}

export function connectionStatus(record: AiConnectionRecord | null) {
  return {
    configured: true,
    connected: Boolean(record),
    provider: record?.provider,
    keyHint: record?.key_hint,
    model: record?.model,
    verifiedAt: record?.verified_at,
  };
}

export function tripPlannerEnvironmentForConnection(
  record: AiConnectionRecord,
  environment: AiConnectionEnvironment = process.env,
) {
  const apiKey = decryptConnectionToken(
    record.api_key_ciphertext,
    getAiConnectionEncryptionKey(environment),
  );
  return {
    ...environment,
    CAPCAR_TRIP_PLANNER_MODE: record.provider,
    CAPCAR_TRIP_PLANNER_PROVIDER_NAME:
      record.provider === "openai" ? "Your OpenAI" : "Your Claude",
    CAPCAR_TRIP_PLANNER_CREDENTIAL_OWNER: "user",
    CAPCAR_TRIP_PLANNER_MODEL:
      record.provider === "openai" ? record.model : undefined,
    CAPCAR_ANTHROPIC_TRIP_PLANNER_MODEL:
      record.provider === "anthropic" ? record.model : undefined,
    OPENAI_API_KEY: record.provider === "openai" ? apiKey : undefined,
    ANTHROPIC_API_KEY: record.provider === "anthropic" ? apiKey : undefined,
  };
}
