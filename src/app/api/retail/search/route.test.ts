import { afterEach, beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ guard: vi.fn(), search: vi.fn() }));

vi.mock("@/lib/api/public-retail-guard", () => ({
  guardPublicRetail: mocks.guard,
}));
vi.mock("@/features/retail/multi-retailer-provider", () => ({
  searchRetailers: mocks.search,
}));

import { POST } from "./route";

const payload = {
  query: "BMW 328i E90 Automatik",
  market: "DE",
  destination: "DE",
  page: 0,
};

beforeEach(() => {
  mocks.guard.mockReset().mockResolvedValue(null);
  mocks.search.mockReset().mockResolvedValue({
    source: "ebay",
    checkedAt: "2026-09-11T12:00:00Z",
    hasMore: false,
    warning: "Check fitment",
    items: [],
  });
});

afterEach(() => vi.unstubAllEnvs());

it("accepts CapCar's public origin when Netlify supplies an internal request URL", async () => {
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://capcar-im.netlify.app");
  const response = await POST(
    new Request("https://internal-runtime.test/api/retail/search", {
      method: "POST",
      headers: {
        origin: "https://capcar-im.netlify.app",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }),
  );
  expect(response.status).toBe(200);
  expect(mocks.guard).toHaveBeenCalledOnce();
  expect(mocks.search).toHaveBeenCalledWith({
    ...payload,
    condition: "all",
    sort: "bestMatch",
  });
});

it("still rejects a cross-site request before quota or eBay access", async () => {
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://capcar-im.netlify.app");
  const response = await POST(
    new Request("https://internal-runtime.test/api/retail/search", {
      method: "POST",
      headers: {
        origin: "https://attacker.test",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }),
  );
  expect(response.status).toBe(403);
  expect(mocks.guard).not.toHaveBeenCalled();
  expect(mocks.search).not.toHaveBeenCalled();
});
