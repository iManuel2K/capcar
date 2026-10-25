import { afterEach, describe, expect, it, vi } from "vitest";
import { discoverTripPlaces } from "./trip-discovery";
import { tripPlannerRequestSchema } from "./trip-planner";

const request = tripPlannerRequestSchema.parse({
  origin: "Rüsselsheim",
  region: "nearby",
  vehicle: "BMW 318i",
  startDate: "2026-10-25",
  duration: 1,
  pace: "scenic",
  interests: ["nature"],
  hoursPerDay: 3,
});
afterEach(() => vi.unstubAllGlobals());
describe("bounded place discovery", () => {
  it("does not call a provider without a configured places key", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    expect(await discoverTripPlaces(request, {})).toEqual({
      status: "unavailable",
      candidates: [],
    });
    expect(fetch).not.toHaveBeenCalled();
  });
  it("retrieves a time-bounded shortlist and rejects unnamed/duplicate/non-geographic records", async () => {
    const place = {
      properties: {
        place_id: "one",
        name: "Viewpoint",
        formatted: "Viewpoint, Mainz",
        categories: ["tourism.sights.viewpoint"],
      },
      geometry: { coordinates: [8.3, 50] },
    };
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(
        Response.json({ features: [{ geometry: { coordinates: [8.4, 50] } }] }),
      )
      .mockResolvedValueOnce(
        Response.json({
          features: [
            {
              ...place,
              properties: {
                ...place.properties,
                place_id: "museum",
                categories: ["entertainment.museum"],
              },
            },
            place,
            place,
            {
              ...place,
              properties: { ...place.properties, place_id: "too-far" },
              geometry: { coordinates: [13.4, 52.5] },
            },
            { properties: { name: "unknown" } },
          ],
        }),
      );
    vi.stubGlobal("fetch", fetch);
    const result = await discoverTripPlaces(request, {
      GEOAPIFY_API_KEY: "test",
    });
    expect(result.candidates).toHaveLength(2);
    expect(result.candidates[0].id).toBe("one");
    expect(result.candidates[0].reason).toContain("need checking");
    expect(
      new URL(String(fetch.mock.calls[1][0])).searchParams.get("filter"),
    ).toBe("circle:8.4,50,30000");
  });
  it("exposes provider failure instead of calling the places verified", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    expect(
      (await discoverTripPlaces(request, { GEOAPIFY_API_KEY: "test" })).status,
    ).toBe("unavailable");
  });
});
