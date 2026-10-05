import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createMapLinks,
  getTripPlannerStatus,
  planScenicTrip,
  planScenicTripWithFallback,
  tripPlannerRequestSchema,
} from "@/features/trips/trip-planner";

const request = tripPlannerRequestSchema.parse({
  vehicle: "2011 BMW E90 318i",
  region: "Black Forest",
  startDate: "2026-10-16",
  duration: 3,
  pace: "scenic",
  interests: ["roads", "photography"],
  useConnectedContext: true,
});

describe("trip planner", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("builds a bounded multi-day draft", async () => {
    const plan = await planScenicTrip(request, {
      busyDates: ["2026-10-17"],
      mailSignals: [{ subject: "Hotel booking" }],
    });

    expect(plan.days).toHaveLength(3);
    expect(plan.days[2].date).toBe("2026-10-18");
    expect(plan.contextNotes.join(" ")).toContain("2026-10-17");
    expect(plan.verificationNote).toContain("Verify");
  });

  it("keeps the zero-cost deterministic fallback as the default", () => {
    expect(getTripPlannerStatus({})).toMatchObject({
      mode: "deterministic",
      configured: true,
    });
  });

  it("recognizes a configured native OpenAI planner", () => {
    expect(
      getTripPlannerStatus({
        CAPCAR_TRIP_PLANNER_MODE: "openai",
        OPENAI_API_KEY: "server-secret",
      }),
    ).toMatchObject({
      mode: "openai",
      configured: true,
      model: "gpt-5.4-mini",
    });
  });

  it("recognizes a configured Gemini planner", () => {
    expect(
      getTripPlannerStatus({
        CAPCAR_TRIP_PLANNER_MODE: "gemini",
        GEMINI_API_KEY: "user-secret",
      }),
    ).toMatchObject({
      mode: "gemini",
      configured: true,
      model: "gemini-2.5-flash-lite",
    });
  });

  it("uses a connected Gemini key for a structured trip plan", async () => {
    const fallback = await planScenicTrip(request);
    const generated = JSON.parse(JSON.stringify(fallback)) as Record<
      string,
      unknown
    >;
    for (const key of ["provider", "source", "researchSources", "mapLinks"])
      delete generated[key];
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        expect(input).toBe(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent",
        );
        expect(new Headers(init?.headers).get("x-goog-api-key")).toBe(
          "user-gemini-secret",
        );
        const requestBody = JSON.parse(String(init?.body)) as {
          generationConfig: {
            responseFormat: { text: { mimeType: string; schema: unknown } };
          };
        };
        expect(requestBody.generationConfig.responseFormat.text.mimeType).toBe(
          "application/json",
        );
        expect(
          requestBody.generationConfig.responseFormat.text.schema,
        ).toBeTruthy();
        return Response.json({
          candidates: [
            {
              content: { parts: [{ text: JSON.stringify(generated) }] },
            },
          ],
        });
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    const plan = await planScenicTrip(request, undefined, {
      CAPCAR_TRIP_PLANNER_MODE: "gemini",
      CAPCAR_TRIP_PLANNER_PROVIDER_NAME: "Your Gemini",
      CAPCAR_GEMINI_TRIP_PLANNER_MODEL: "gemini-2.5-flash-lite",
      GEMINI_API_KEY: "user-gemini-secret",
    });

    expect(plan.source).toBe("gemini");
    expect(plan.provider).toBe("Your Gemini");
    expect(plan.researchSources).toEqual([]);
  });

  it("requests a web-grounded structured plan from OpenAI", async () => {
    const fallback = await planScenicTrip(request);
    const generated = JSON.parse(JSON.stringify(fallback)) as Record<
      string,
      unknown
    >;
    for (const key of ["provider", "source", "researchSources", "mapLinks"])
      delete generated[key];
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        expect(input).toBe("https://api.openai.com/v1/responses");
        const requestBody = JSON.parse(String(init?.body)) as {
          tools: Array<{ type: string; search_context_size: string }>;
          input: Array<{ role: string; content: string }>;
          text: { format: { strict: boolean } };
        };
        expect(requestBody.tools).toEqual([
          { type: "web_search", search_context_size: "low" },
        ]);
        expect(requestBody.text.format.strict).toBe(true);
        const userInput = JSON.parse(requestBody.input[1].content) as {
          request: Record<string, unknown>;
          destinationInput: { type: string; prompt: string };
        };
        expect(userInput.request).not.toHaveProperty("region");
        expect(userInput.destinationInput).toMatchObject({
          type: "natural_language",
          prompt: "Drive from Rüsselsheim through Mainz",
        });
        return Response.json({
          output: [
            {
              type: "web_search_call",
              action: {
                sources: [
                  {
                    title: "Black Forest tourism",
                    url: "https://example.com/black-forest",
                  },
                ],
              },
            },
            {
              type: "message",
              content: [
                { type: "output_text", text: JSON.stringify(generated) },
              ],
            },
          ],
        });
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    const plan = await planScenicTrip(
      {
        ...request,
        inputMode: "prompt",
        prompt: "Drive from Rüsselsheim through Mainz",
      },
      undefined,
      {
        CAPCAR_TRIP_PLANNER_MODE: "openai",
        OPENAI_API_KEY: "server-secret",
      },
    );

    expect(plan.source).toBe("openai");
    expect(plan.researchSources).toHaveLength(1);
    expect(plan.mapLinks.google).toContain("google.com/maps/dir");
  });

  it("uses a connected Claude key for a structured trip plan", async () => {
    const fallback = await planScenicTrip(request);
    const generated = JSON.parse(JSON.stringify(fallback)) as Record<
      string,
      unknown
    >;
    for (const key of ["provider", "source", "researchSources", "mapLinks"])
      delete generated[key];
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        expect(input).toBe("https://api.anthropic.com/v1/messages");
        expect(new Headers(init?.headers).get("x-api-key")).toBe(
          "user-claude-secret",
        );
        const requestBody = JSON.parse(String(init?.body)) as {
          tools: Array<{ name: string; input_schema: unknown }>;
        };
        expect(requestBody.tools[0].name).toBe("save_trip_plan");
        return Response.json({
          content: [
            {
              type: "tool_use",
              name: "save_trip_plan",
              input: generated,
            },
          ],
        });
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    const plan = await planScenicTrip(request, undefined, {
      CAPCAR_TRIP_PLANNER_MODE: "anthropic",
      CAPCAR_TRIP_PLANNER_PROVIDER_NAME: "Your Claude",
      CAPCAR_ANTHROPIC_TRIP_PLANNER_MODEL: "claude-sonnet-4-5-20250929",
      ANTHROPIC_API_KEY: "user-claude-secret",
    });

    expect(plan.source).toBe("anthropic");
    expect(plan.provider).toBe("Your Claude");
    expect(plan.researchSources).toEqual([]);
  });

  it("returns a usable route draft when the live planner is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    const plan = await planScenicTripWithFallback(request, undefined, {
      CAPCAR_TRIP_PLANNER_MODE: "openai",
      OPENAI_API_KEY: "server-secret",
    });

    expect(plan.source).toBe("deterministic");
    expect(plan.days).toHaveLength(3);
    expect(plan.contextNotes.join(" ")).toContain("temporarily unavailable");
  });

  it("does not fabricate map destinations when prompt-based AI planning fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    await expect(
      planScenicTripWithFallback(
        {
          ...request,
          inputMode: "prompt",
          prompt: "Drive from Rüsselsheim through Mainz",
        },
        undefined,
        {
          CAPCAR_TRIP_PLANNER_MODE: "openai",
          OPENAI_API_KEY: "server-secret",
        },
      ),
    ).rejects.toThrow("could not compose this route");
  });

  it("surfaces missing OpenAI credits without exposing provider details", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json(
          {
            error: {
              message:
                "You exceeded your current quota. Check billing. insufficient_quota",
            },
          },
          { status: 429 },
        ),
      ),
    );

    await expect(
      planScenicTripWithFallback(
        {
          ...request,
          inputMode: "prompt",
          prompt: "Drive from Rüsselsheim through Mainz",
        },
        undefined,
        {
          CAPCAR_TRIP_PLANNER_MODE: "openai",
          OPENAI_API_KEY: "server-secret",
        },
      ),
    ).rejects.toMatchObject({
      code: "openai_quota",
      status: 402,
    });
  });

  it("surfaces a Gemini free-tier limit clearly", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          Response.json(
            { error: { message: "RESOURCE_EXHAUSTED: quota exceeded" } },
            { status: 429 },
          ),
        ),
    );

    await expect(
      planScenicTripWithFallback(
        {
          ...request,
          inputMode: "prompt",
          prompt: "Drive from Rüsselsheim through Mainz",
        },
        undefined,
        {
          CAPCAR_TRIP_PLANNER_MODE: "gemini",
          GEMINI_API_KEY: "user-secret",
        },
      ),
    ).rejects.toMatchObject({
      code: "gemini_rate_limit",
      status: 429,
    });
  });

  it("creates encoded route handoffs for all supported maps", () => {
    const links = createMapLinks("Black Forest", [
      { mapQuery: "Baden-Baden, Germany" },
      { mapQuery: "Mummelsee parking" },
      { mapQuery: "Triberg, Germany" },
    ]);

    expect(links.google).toContain("Mummelsee+parking");
    expect(links.apple).toContain("Triberg%2C+Germany");
    expect(links.waze).toContain("Triberg%2C+Germany");
    expect(links.openStreetMap).toContain("Triberg%2C+Germany");
  });

  it("rejects oversized requests", () => {
    expect(() =>
      tripPlannerRequestSchema.parse({
        ...request,
        vehicle: "x".repeat(121),
      }),
    ).toThrow();
  });
});
