import { afterEach, describe, expect, it, vi } from "vitest";
import type { AiConnectionRecord } from "@/features/connections/ai-connection";
import { extractServiceEvidence, VisionReviewError } from "./vision-extraction";

vi.mock("@/features/connections/ai-connection", () => ({
  tripPlannerEnvironmentForConnection: () => ({
    OPENAI_API_KEY: "connected-openai",
    ANTHROPIC_API_KEY: "connected-claude",
    GEMINI_API_KEY: "connected-gemini",
  }),
}));

const input = {
  consent: true as const,
  photos: [{ data: "/9j/photoOne" }, { data: "/9j/photoTwo" }],
  vehicle: {
    year: 2011,
    make: "BMW",
    model: "318i",
    mileage: 142_901,
    vin: "private-vin",
  },
  tasks: [
    {
      key: "engine-oil",
      title: "Engine oil and filter",
      record: { date: "2024-10-02", mileage: 131_778 },
    },
  ],
  history: { notes: "private-report", mileage: 132_700, date: "2024-12-05" },
};

const evidence = {
  photoIndex: 1,
  taskKey: "engine-oil",
  work: "Engine oil and filter replaced",
  date: "2025-03-10",
  mileage: 136000,
  excerpt: "Oil and filter replaced",
};

function connection(
  provider: AiConnectionRecord["provider"],
): AiConnectionRecord {
  return {
    user_id: "user",
    provider,
    model: "account-saved-model",
    api_key_ciphertext: "ciphertext-is-not-a-key",
    key_hint: "test",
    verified_at: "2025-01-01T00:00:00.000Z",
    created_at: "2025-01-01T00:00:00.000Z",
    updated_at: "2025-01-01T00:00:00.000Z",
  };
}

function providerReply(provider: AiConnectionRecord["provider"], text: string) {
  return Response.json(
    provider === "openai"
      ? {
          status: "completed",
          output: [{ content: [{ type: "output_text", text }] }],
        }
      : provider === "anthropic"
        ? { stop_reason: "end_turn", content: [{ type: "text", text }] }
        : {
            candidates: [
              {
                finishReason: "STOP",
                content: {
                  parts: [
                    { text: "private reasoning", thought: true },
                    { text },
                  ],
                },
              },
            ],
          },
  );
}

afterEach(() => vi.unstubAllGlobals());

describe("connected service-record vision", () => {
  it.each([
    [
      "openai",
      "https://api.openai.com/v1/responses",
      "authorization",
      "Bearer connected-openai",
    ],
    [
      "anthropic",
      "https://api.anthropic.com/v1/messages",
      "x-api-key",
      "connected-claude",
    ],
    [
      "gemini",
      "https://generativelanguage.googleapis.com/v1beta/models/account-saved-model:generateContent",
      "x-goog-api-key",
      "connected-gemini",
    ],
  ] as const)(
    "uses the saved %s connection and extracts only bounded, photo-linked work",
    async (provider, endpoint, header, key) => {
      const fetchMock = vi
        .fn<typeof fetch>()
        .mockResolvedValue(
          providerReply(provider, JSON.stringify({ evidence: [evidence] })),
        );
      vi.stubGlobal("fetch", fetchMock);

      await expect(
        extractServiceEvidence(input, connection(provider)),
      ).resolves.toEqual([evidence]);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, init] = fetchMock.mock.calls[0]!;
      expect(url).toBe(endpoint);
      expect(new Headers(init?.headers).get(header)).toBe(key);
      expect(init?.redirect).toBe("error");
      const body = JSON.parse(String(init?.body));
      if (provider === "openai") {
        expect(body.store).toBe(false);
        expect(body.input[0].content[2]).toEqual({
          type: "input_image",
          image_url: "data:image/jpeg;base64,/9j/photoOne",
          detail: "high",
        });
      } else if (provider === "anthropic") {
        expect(body.messages[0].content[2]).toEqual({
          type: "image",
          source: {
            type: "base64",
            media_type: "image/jpeg",
            data: "/9j/photoOne",
          },
        });
      } else {
        expect(body.contents[0].parts[2]).toEqual({
          inlineData: { mimeType: "image/jpeg", data: "/9j/photoOne" },
        });
      }
      expect(String(init?.body)).toContain("Photo index 1");
      expect(String(init?.body)).not.toMatch(
        /private-vin|private-report|142901|131778/,
      );
    },
  );

  it("drops nonexistent photo references and does not match invented task identifiers", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        providerReply(
          "openai",
          JSON.stringify({
            evidence: [
              { ...evidence, photoIndex: 2 },
              { ...evidence, taskKey: "unlisted-task" },
            ],
          }),
        ),
      ),
    );
    await expect(
      extractServiceEvidence(input, connection("openai")),
    ).resolves.toEqual([{ ...evidence, taskKey: null }]);
  });

  it("rejects a malformed extraction without returning provider content", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        providerReply(
          "anthropic",
          JSON.stringify({
            evidence: [{ ...evidence, mileage: "not a distance" }],
          }),
        ),
      ),
    );
    await expect(
      extractServiceEvidence(input, connection("anthropic")),
    ).rejects.toMatchObject({
      code: "invalid_provider_reply",
      status: 502,
    });
  });

  it("rejects a truncated or oversized reply rather than displaying partial evidence", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        Response.json({
          status: "incomplete",
          output: [
            {
              content: [
                {
                  type: "output_text",
                  text: JSON.stringify({ evidence: [evidence] }),
                },
              ],
            },
          ],
        }),
      )
      .mockResolvedValueOnce(new Response("x".repeat(200_000)));
    vi.stubGlobal("fetch", fetchMock);
    for (let n = 0; n < 2; n++) {
      await expect(
        extractServiceEvidence(input, connection("openai")),
      ).rejects.toMatchObject({
        code: "invalid_provider_reply",
        status: 502,
      });
    }
  });

  it("does not retry a provider rate limit or repeat its private error payload", async () => {
    const privateText = "private-response-contents";
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(privateText, { status: 429 }));
    vi.stubGlobal("fetch", fetchMock);
    const result = await extractServiceEvidence(
      input,
      connection("openai"),
    ).catch((error: unknown) => error);
    expect(result).toBeInstanceOf(VisionReviewError);
    expect(result).toMatchObject({
      status: 429,
      code: "provider_rate_limited",
    });
    expect((result as Error).message).not.toContain(privateText);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("does not contact a provider after the caller cancels", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetchMock);
    await expect(
      extractServiceEvidence(input, connection("gemini"), AbortSignal.abort()),
    ).rejects.toMatchObject({ code: "review_cancelled" });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
