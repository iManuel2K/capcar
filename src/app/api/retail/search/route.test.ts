import { afterEach, beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ guard: vi.fn(), search: vi.fn() }));

vi.mock("@/lib/api/public-retail-guard", () => ({
  guardPublicRetail: mocks.guard,
}));
vi.mock("@/features/retail/multi-retailer-provider", () => ({
  searchRetailers: mocks.search,
}));

import { POST } from "./route";
import { RETAIL_STREAM_TYPE } from "@/features/retail/retail-contracts";
import { RetailUnavailable } from "@/features/retail/ebay-provider";

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

it("returns a retryable gateway timeout without substituting demo offers", async () => {
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://capcar-im.netlify.app");
  mocks.search.mockRejectedValue(
    new RetailUnavailable("eBay timed out", "timeout"),
  );
  const response = await POST(request());
  expect(response.status).toBe(504);
  await expect(response.json()).resolves.toMatchObject({
    code: "retailer_unavailable",
    reason: "timeout",
  });
});

it("preserves the provider retry window when the request allowance is reached", async () => {
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://capcar-im.netlify.app");
  mocks.search.mockRejectedValue(
    new RetailUnavailable("Rate limited", "rate_limit", 180),
  );
  const response = await POST(request());
  expect(response.status).toBe(429);
  expect(response.headers.get("Retry-After")).toBe("180");
});

it("streams partial results before the complete response for opted-in clients", async () => {
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://capcar-im.netlify.app");
  const partial = {
    source: "partner",
    checkedAt: "2026-09-11T12:00:00Z",
    hasMore: false,
    warning: "Check fitment",
    items: [],
  };
  const complete = { ...partial, source: "multi" };
  let finishSearch!: (response: typeof complete) => void;
  const remaining = new Promise<typeof complete>((resolve) => {
    finishSearch = resolve;
  });
  mocks.search.mockImplementation((_input, _env, sendPartial) => {
    sendPartial(partial);
    return remaining;
  });

  const response = await POST(request(RETAIL_STREAM_TYPE));
  expect(response.status).toBe(200);
  expect(response.headers.get("Content-Type")).toContain(RETAIL_STREAM_TYPE);
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  const first = await reader.read();
  expect(JSON.parse(decoder.decode(first.value))).toEqual({
    type: "partial",
    data: partial,
  });

  finishSearch(complete);
  const last = await reader.read();
  expect(JSON.parse(decoder.decode(last.value))).toEqual({
    type: "complete",
    data: complete,
  });
  await expect(reader.read()).resolves.toMatchObject({ done: true });
});

function request(accept?: string) {
  return new Request("https://internal-runtime.test/api/retail/search", {
    method: "POST",
    headers: {
      origin: "https://capcar-im.netlify.app",
      "Content-Type": "application/json",
      ...(accept ? { Accept: accept } : {}),
    },
    body: JSON.stringify(payload),
  });
}
