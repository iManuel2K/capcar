// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { serviceReviewCopy } from "@/features/service-review/service-review-copy";
import { vehicleSchema } from "@/features/vehicles/vehicle-schema";

import { ServiceReviewPanel } from "./service-review-panel";

vi.mock("next-intl", () => ({ useLocale: () => "en" }));
vi.mock("@/features/service-review/prepare-service-photo", () => ({
  prepareServicePhoto: vi.fn().mockResolvedValue("/9j/prepared"),
  ServicePhotoError: class extends Error {},
}));

const c = serviceReviewCopy.en;
const vehicle = vehicleSchema.parse({
  id: "local-car",
  make: "BMW",
  model: "318i",
  productionYear: 2011,
  platform: "E90",
  engineCode: "N43",
  bodyStyle: "Sedan",
  transmission: "Manual",
  mileage: 0,
  mileageKnown: false,
  vin: "WBAAB12345CD67890",
  createdAt: "2026-01-01T00:00:00.000Z",
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("service record review panel", () => {
  it("waits for consent, omits unknown odometer/VIN, and separates evidence from the checklist", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        items: [
          {
            taskKey: "brake-fluid",
            title: "Brake fluid",
            status: "due",
            date: "2020-01-01",
            mileage: 50_000,
            source: "photo",
            photoIndex: 0,
            nextDueDate: "2022-01-01",
            nextDueMileage: null,
          },
          {
            taskKey: "battery",
            title: "Battery",
            status: "unconfirmed",
            date: null,
            mileage: null,
            source: null,
            photoIndex: null,
            nextDueDate: null,
            nextDueMileage: null,
          },
        ],
        evidence: [
          {
            photoIndex: 0,
            taskKey: "brake-fluid",
            work: "Brake fluid replaced",
            date: "2020-01-01",
            mileage: 50_000,
            excerpt: "Brake fluid",
          },
        ],
        warnings: ["history-mileage-conflict"],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    render(<ServiceReviewPanel vehicle={vehicle} tasks={[]} />);

    const fileInput = screen.getByLabelText(c.fileLabel);
    fireEvent.change(fileInput, {
      target: {
        files: [new File(["private"], "service.jpg", { type: "image/jpeg" })],
      },
    });
    await screen.findByText(/service\.jpg/);
    fireEvent.click(screen.getByRole("button", { name: c.submit }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      c.missingConsent,
    );
    expect(fetchMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText(c.historyHeading));
    fireEvent.change(screen.getByLabelText(c.date), {
      target: { value: "2019-01-01" },
    });
    fireEvent.change(screen.getByLabelText(c.mileage), {
      target: { value: "51000" },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: c.consent }));
    fireEvent.click(screen.getByRole("button", { name: c.submit }));
    await screen.findByRole("heading", { name: c.results });
    expect(screen.getByText("Due by plan · 1")).toBeInTheDocument();
    expect(screen.getByText("Not confirmed · 1")).toBeInTheDocument();
    expect(
      screen.getByText(c.warnings["history-mileage-conflict"]),
    ).toBeInTheDocument();
    expect(screen.getByText(c.notSaved)).toBeInTheDocument();
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/maintenance/review");
    const body = JSON.parse(options.body);
    expect(body.vehicle).not.toHaveProperty("vin");
    expect(body.vehicle).not.toHaveProperty("mileage");
    expect(body.history).toEqual({ date: "2019-01-01", mileage: 51_000 });
    expect(body.photos).toEqual([{ data: "/9j/prepared" }]);
    fireEvent.click(screen.getByRole("button", { name: c.clear }));
    await waitFor(() =>
      expect(screen.queryByText(/service\.jpg/)).not.toBeInTheDocument(),
    );
    expect(
      screen.queryByRole("heading", { name: c.results }),
    ).not.toBeInTheDocument();
  });
});
