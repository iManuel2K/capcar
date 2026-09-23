import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ guard: vi.fn(), resolve: vi.fn() }));

vi.mock("@/lib/api/guard", async (original) => ({
  ...(await original<typeof import("@/lib/api/guard")>()),
  guardProductApi: mocks.guard,
}));
vi.mock("@/features/fitment/fitment-provider", async (original) => ({
  ...(await original<typeof import("@/features/fitment/fitment-provider")>()),
  resolveConnectedFitment: mocks.resolve,
}));

import { POST } from "./route";

const body = {
  vehicle: {
    make: "BMW",
    model: "318i",
    productionYear: 2011,
    platform: "E90",
    bodyStyle: "Sedan",
    engineCode: "N43B20",
    transmission: "Manual",
  },
  partNumber: "63217252093",
};

beforeEach(() => {
  mocks.guard.mockReset().mockResolvedValue({ ok: true, userId: "owner" });
  mocks.resolve.mockReset().mockResolvedValue({
    provider: "Fitment partner",
    checkedAt: "2026-09-15T12:00:00.000Z",
    records: [],
    warnings: [],
  });
});

it("rejects cross-origin fitment requests before provider access", async () => {
  const response = await POST(
    new Request("https://capcar.dev/api/fitment/resolve", {
      method: "POST",
      headers: {
        origin: "https://attacker.example",
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    }),
  );
  expect(response.status).toBe(403);
  expect(mocks.guard).not.toHaveBeenCalled();
  expect(mocks.resolve).not.toHaveBeenCalled();
});

it("validates and resolves an authenticated same-origin request", async () => {
  const response = await POST(
    new Request("https://capcar.dev/api/fitment/resolve", {
      method: "POST",
      headers: {
        origin: "https://capcar.dev",
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    }),
  );
  expect(response.status).toBe(200);
  expect(mocks.resolve).toHaveBeenCalledWith(body);
});
