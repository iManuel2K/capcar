import { describe, expect, it, vi } from "vitest";
import { garageCarCatalog } from "@/features/vehicles/garage-car-catalog";
import { fetchOfficialProblems } from "./official-records-provider";
import {
  findProblemProfile,
  getProblemProfile,
  problemSourceMappings,
} from "./source-profiles";

const row = {
  NHTSACampaignNumber: "16V684000",
  Component: "FUEL SYSTEM",
  Summary: "Source-supplied issue wording",
  Consequence: "Source-supplied consequence",
  Remedy: "Contact the manufacturer",
  ReportReceivedDate: "22/09/2016",
  ModelYear: "2015",
  Make: "MAZDA",
  Model: "MAZDA3",
  parkIt: true,
  parkOutSide: true,
};
const json = (value: unknown) => Response.json(value);
function source() {
  return vi
    .fn<typeof fetch>()
    .mockResolvedValueOnce(
      json({
        results: [{ make: "MAZDA", model: "MAZDA3", modelYear: "2015" }],
      }),
    )
    .mockResolvedValueOnce(
      json({
        results: [
          row,
          { ...row, parkIt: false, parkOutSide: false },
          { ...row, NHTSACampaignNumber: "16V685000", ModelYear: "2014" },
          { ...row, NHTSACampaignNumber: "16V686000", Model: "MAZDA6" },
        ],
      }),
    );
}
describe("source-aware problem coverage", () => {
  it("has an explicit source policy and precise identity match for every selectable car", () => {
    expect(garageCarCatalog).toHaveLength(31);
    expect(Object.keys(problemSourceMappings).sort()).toEqual(
      garageCarCatalog.map((car) => car.id).sort(),
    );
    for (const car of garageCarCatalog) {
      expect(getProblemProfile(car.id)).toBeDefined();
      expect(
        findProblemProfile({ ...car, productionYear: car.years[0] })?.id,
      ).toBe(car.id);
    }
    expect(
      findProblemProfile({
        make: "Ford",
        model: "318i",
        platform: "E90",
        productionYear: 2011,
      }),
    ).toBeUndefined();
    expect(
      findProblemProfile({
        make: "BMW",
        model: "M3",
        platform: "E30",
        productionYear: 2000,
      }),
    ).toBeUndefined();
  });
  it("does not invent production faults or substitute US models for market-specific choices", async () => {
    const fetcher = vi.fn<typeof fetch>();
    for (const id of [
      "nissan-proto",
      "nissan-gt-r",
      "honda-civic",
      "honda-nsx",
      "auris-e180",
      "bmw-318i-e90",
      "bmw-320i",
      "mercedes-300sl",
    ]) {
      const profile = getProblemProfile(id)!;
      const result = await fetchOfficialProblems(id, profile.years[0], fetcher);
      expect(result.status).toBe("unsupported");
      expect(result.records).toEqual([]);
    }
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("uses exact year/make/model index matches, deduplicates campaigns and preserves source wording and urgent flags", async () => {
    const fetcher = source();
    const result = await fetchOfficialProblems("mazda3-bm", 2015, fetcher);
    expect(result.records).toHaveLength(1);
    expect(result.records[0]).toMatchObject({
      summary: row.Summary,
      consequence: row.Consequence,
      remedy: row.Remedy,
      parkIt: true,
      parkOutside: true,
      sourceUrl:
        "https://api.nhtsa.gov/recalls/recallsByCampaignNumber?campaignNumber=16V684000",
    });
    expect(result.matchedModels).toEqual(["MAZDA3"]);
    for (const [url, options] of fetcher.mock.calls) {
      expect(new URL(String(url)).host).toBe("api.nhtsa.gov");
      expect(options).toMatchObject({ redirect: "error", cache: "no-store" });
      expect(JSON.stringify(options)).not.toMatch(
        /vin|cookie|authorization|vehicleId/i,
      );
    }
  });
  it("does not query another model when the official index has no exact match", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      json({
        results: [{ make: "MAZDA", model: "MAZDA6", modelYear: "2015" }],
      }),
    );
    expect(
      (await fetchOfficialProblems("mazda3-bm", 2015, fetcher)).status,
    ).toBe("not-listed");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("does not mix generations where US model years differ from the global catalog", async () => {
    const fetcher = vi.fn<typeof fetch>();
    for (const [id, year] of [
      ["golf-vii", 2013],
      ["mazda3-bn", 2019],
      ["mazda-rx-7-fd", 2000],
      ["toyota-supra-mk", 1999],
    ] as const) {
      expect(await fetchOfficialProblems(id, year, fetcher)).toMatchObject({
        status: "unsupported",
        reason: "year",
        fetchedAt: null,
        records: [],
      });
    }
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("distinguishes an empty official response from an outage or malformed source data", async () => {
    const empty = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        json({
          results: [{ make: "MAZDA", model: "MAZDA3", modelYear: "2015" }],
        }),
      )
      .mockResolvedValueOnce(json({ results: [] }));
    expect(await fetchOfficialProblems("mazda3-bm", 2015, empty)).toMatchObject(
      { status: "available", records: [] },
    );
    await expect(
      fetchOfficialProblems(
        "mazda3-bm",
        2015,
        vi
          .fn<typeof fetch>()
          .mockResolvedValue(new Response("error", { status: 503 })),
      ),
    ).rejects.toThrow();
    await expect(
      fetchOfficialProblems(
        "mazda3-bm",
        2015,
        vi
          .fn<typeof fetch>()
          .mockResolvedValue(json({ results: "not-an-array" })),
      ),
    ).rejects.toThrow();
    await expect(
      fetchOfficialProblems("mazda3-bm", 1990, source()),
    ).rejects.toThrow();
    await expect(
      fetchOfficialProblems("https://evil.example/", 2015, source()),
    ).rejects.toThrow();
  });
  it("rejects unexpected HTML, oversized payloads and aborted source requests instead of inventing an empty list", async () => {
    await expect(
      fetchOfficialProblems(
        "mazda3-bm",
        2015,
        vi.fn<typeof fetch>().mockResolvedValue(
          new Response("<html>blocked</html>", {
            headers: { "Content-Type": "text/html" },
          }),
        ),
      ),
    ).rejects.toThrow("Unexpected source format");
    await expect(
      fetchOfficialProblems(
        "mazda3-bm",
        2015,
        vi.fn<typeof fetch>().mockResolvedValue(
          new Response("x".repeat(1_000_001), {
            headers: { "Content-Type": "application/json" },
          }),
        ),
      ),
    ).rejects.toThrow("Source response exceeds limit");
    await expect(
      fetchOfficialProblems(
        "mazda3-bm",
        2015,
        vi
          .fn<typeof fetch>()
          .mockRejectedValue(new DOMException("timeout", "AbortError")),
      ),
    ).rejects.toThrow("timeout");
  });
});
