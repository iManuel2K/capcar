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
    ).rejects.toThrow("offline");
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
