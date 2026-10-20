import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Vehicle } from "@/features/vehicles/vehicle-schema";
import { OfficialProblemRecords } from "./official-problem-records";
import { problemSourceCopy } from "@/features/problems/problem-source-copy";
const vehicle = {
  id: "PRIVATE-VEHICLE",
  vin: "PRIVATE-VIN",
  make: "Mazda",
  model: "3",
  platform: "BM",
  productionYear: 2015,
  engineCode: "UNKNOWN",
} as Vehicle;
const response = {
  profile: "mazda3-bm",
  year: 2015,
  status: "available",
  fetchedAt: "2026-01-01T00:00:00.000Z",
  source: "NHTSA",
  market: "US",
  matchedModels: ["MAZDA3"],
  records: [
    {
      campaign: "16V684000",
      component: "FUEL SYSTEM",
      summary: "Exact official wording",
      consequence: "Source consequence",
      remedy: "Source remedy",
      reportedAt: "22/09/2016",
      sourceUrl:
        "https://api.nhtsa.gov/recalls/recallsByCampaignNumber?campaignNumber=16V684000",
      parkIt: true,
      parkOutside: true,
    },
  ],
};
const fetcher = vi.fn<typeof fetch>();
beforeEach(() => {
  vi.stubGlobal("fetch", fetcher);
  fetcher.mockReset();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
describe("live source problem records", () => {
  it("renders honest source details, urgent flags, stale warnings and no private request data", async () => {
    fetcher.mockResolvedValue(Response.json(response));
    render(<OfficialProblemRecords vehicle={vehicle} />);
    expect(await screen.findByText("Exact official wording")).toBeVisible();
    expect(screen.getByText(/Source warning: do not drive/)).toBeVisible();
    expect(screen.getByText(/Source warning: park outside/)).toBeVisible();
    expect(screen.getByText(/Cached results are older/)).toBeVisible();
    expect(
      screen.getByRole("link", { name: /Open official campaign/ }),
    ).toHaveAttribute("href", response.records[0].sourceUrl);
    expect(fetcher.mock.calls[0][0]).toBe(
      "/api/problems?profile=mazda3-bm&year=2015",
    );
    expect(fetcher.mock.calls[0][1]).toMatchObject({ credentials: "omit" });
    expect(JSON.stringify(fetcher.mock.calls)).not.toMatch(
      /PRIVATE|vin|vehicleId/,
    );
    expect(localStorage.getItem("capcar.vehicles.v1")).toBeNull();
    expect(
      screen.getAllByText(/· .* · \d{4}–\d{4}/).length,
    ).toBeGreaterThanOrEqual(31);
  });
  it("does not show previous-car records when a profile changes and never fabricates a prototype retrieval date", async () => {
    const proto = {
      ...vehicle,
      make: "Nissan",
      model: "Z Proto",
      platform: "ZPROTO",
      productionYear: 2020,
    };
    fetcher.mockResolvedValue(
      Response.json({
        ...response,
        profile: "nissan-proto",
        year: 2020,
        status: "unsupported",
        reason: "concept",
        fetchedAt: null,
        matchedModels: [],
        records: [],
      }),
    );
    render(<OfficialProblemRecords vehicle={proto} />);
    expect(
      await screen.findByText(/This choice is a concept\/prototype/),
    ).toBeVisible();
    expect(screen.queryByText(/Source retrieved:/)).not.toBeInTheDocument();
    expect(
      screen.queryByText("Exact official wording"),
    ).not.toBeInTheDocument();
  });
  it("handles outages without claiming no problems, then lets the owner retry", async () => {
    const car = { ...vehicle, platform: "BN", productionYear: 2018 };
    fetcher
      .mockResolvedValueOnce(new Response("offline", { status: 503 }))
      .mockResolvedValueOnce(
        Response.json({
          ...response,
          profile: "mazda3-bn",
          year: 2018,
          records: [],
        }),
      );
    render(<OfficialProblemRecords vehicle={car} />);
    expect(
      await screen.findByText(/The official source is temporarily unavailable/),
    ).toBeVisible();
    expect(
      screen.queryByText(/No records were returned/),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText(/No records were returned/)).toBeVisible();
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it("keeps exact vehicle identity and lets owners distinguish US model year from production year", async () => {
    fetcher.mockResolvedValue(
      Response.json({
        ...response,
        profile: "mazda3-bn",
        year: 2019,
        records: [],
      }),
    );
    render(
      <OfficialProblemRecords
        vehicle={{ ...vehicle, platform: "BN", productionYear: 2018 }}
      />,
    );
    fireEvent.change(screen.getByLabelText("US model year to research"), {
      target: { value: "2019" },
    });
    await waitFor(() =>
      expect(
        fetcher.mock.calls.some(([url]) => String(url).includes("year=2019")),
      ).toBe(true),
    );
    expect(
      screen.getByText(/Production year and US model year can differ/),
    ).toBeVisible();
  });
  it("has complete safety and coverage labels in every supported language", () => {
    for (const locale of ["de", "el", "sq", "ja"] as const) {
      expect(Object.keys(problemSourceCopy[locale]).sort()).toEqual(
        Object.keys(problemSourceCopy.en).sort(),
      );
      expect(
        Object.values(problemSourceCopy[locale]).every(
          (text) => text.length > 0,
        ),
      ).toBe(true);
      expect(problemSourceCopy[locale].marketText).not.toBe(
        problemSourceCopy.en.marketText,
      );
    }
  });
});
