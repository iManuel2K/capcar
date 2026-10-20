import { afterEach, describe, expect, it, vi } from "vitest";

import {
  verifyAiConnection,
  getAiConnectionEncryptionKey,
  getAiProviderModel,
  tripPlannerEnvironmentForConnection,
  type AiConnectionRecord,
} from "@/features/connections/ai-connection";
import { encryptConnectionToken } from "@/features/connections/token-crypto";

const secret = "capcar-ai-connection-secret-at-least-32-characters";

function record(
  provider: "gemini" | "openai" | "anthropic",
): AiConnectionRecord {
  return {
    user_id: "11111111-1111-1111-1111-111111111111",
    provider,
    api_key_ciphertext: encryptConnectionToken("provider-secret-key", secret),
    key_hint: "sk-…-key",
    model:
      provider === "gemini"
        ? "gemini-2.5-flash-lite"
        : provider === "openai"
          ? "gpt-5.4-mini"
          : "claude-sonnet-4-5-20250929",
    verified_at: "2026-10-05T12:00:00.000Z",
    created_at: "2026-10-05T12:00:00.000Z",
    updated_at: "2026-10-05T12:00:00.000Z",
  };
}

describe("AI connections", () => {
  it("can reuse the existing connection encryption secret", () => {
    expect(
      getAiConnectionEncryptionKey({
        GOOGLE_CONNECTION_ENCRYPTION_KEY: secret,
      }),
    ).toBe(secret);
  });

  it("routes an OpenAI connection through the user's key", () => {
    const environment = tripPlannerEnvironmentForConnection(record("openai"), {
      AI_CONNECTION_ENCRYPTION_KEY: secret,
    });

    expect(environment).toMatchObject({
      CAPCAR_TRIP_PLANNER_MODE: "openai",
      CAPCAR_TRIP_PLANNER_CREDENTIAL_OWNER: "user",
      OPENAI_API_KEY: "provider-secret-key",
      ANTHROPIC_API_KEY: undefined,
      GEMINI_API_KEY: undefined,
    });
  });

  it("routes a Gemini connection through the user's key", () => {
    const environment = tripPlannerEnvironmentForConnection(record("gemini"), {
      AI_CONNECTION_ENCRYPTION_KEY: secret,
    });

    expect(environment).toMatchObject({
      CAPCAR_TRIP_PLANNER_MODE: "gemini",
      CAPCAR_TRIP_PLANNER_CREDENTIAL_OWNER: "user",
      CAPCAR_GEMINI_TRIP_PLANNER_MODEL: "gemini-2.5-flash-lite",
      GEMINI_API_KEY: "provider-secret-key",
      OPENAI_API_KEY: undefined,
      ANTHROPIC_API_KEY: undefined,
    });
    expect(getAiProviderModel("gemini", {})).toBe("gemini-2.5-flash-lite");
  });

  it("routes a Claude connection through the user's key", () => {
    const environment = tripPlannerEnvironmentForConnection(
      record("anthropic"),
      { AI_CONNECTION_ENCRYPTION_KEY: secret },
    );

    expect(environment).toMatchObject({
      CAPCAR_TRIP_PLANNER_MODE: "anthropic",
      CAPCAR_TRIP_PLANNER_CREDENTIAL_OWNER: "user",
      ANTHROPIC_API_KEY: "provider-secret-key",
      OPENAI_API_KEY: undefined,
      GEMINI_API_KEY: undefined,
    });
    expect(getAiProviderModel("anthropic", environment)).toBe(
      "claude-sonnet-4-5-20250929",
    );
  });
});

describe("Gemini verification failures", () => {
  afterEach(() => vi.unstubAllGlobals());

  it.each([
    [400, "User location is not supported", 422, "region"],
    [400, "Failed precondition: billing required", 422, "billing"],
    [404, "model not found", 422, "model"],
    [429, "quota exhausted", 429, "quota"],
    [503, "unavailable", 503, "temporarily"],
    [400, "API key not valid", 401, "rejected this API key"],
  ])(
    "maps upstream %s into an actionable error",
    async (status, message, expectedStatus, expectedMessage) => {
      vi.stubGlobal(
        "fetch",
        vi
          .fn()
          .mockResolvedValue(
            new Response(JSON.stringify({ error: { message } }), {
              status: Number(status),
            }),
          ),
      );
      await expect(
        verifyAiConnection("gemini", "test-key-never-log-this", {}),
      ).rejects.toMatchObject({
        status: expectedStatus,
        message: expect.stringContaining(String(expectedMessage)),
      });
    },
  );
});
