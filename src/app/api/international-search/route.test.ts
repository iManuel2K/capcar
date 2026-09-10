import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ guard: vi.fn(), search: vi.fn() }));
vi.mock("@/lib/api/public-retail-guard", () => ({
  guardPublicRetail: mocks.guard,
}));
vi.mock("@/features/international/ebay", () => ({
  searchInternational: mocks.search,
}));
import { POST } from "./route";
function request() {
  return new Request("https://capcar.test/api/international-search", {
    method: "POST",
    headers: {
      origin: "https://capcar.test",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: "E90 rear lights", postcode: "65428" }),
  });
}
beforeEach(() => {
  mocks.guard.mockReset().mockResolvedValue(null);
  mocks.search.mockReset().mockResolvedValue({ items: [] });
});
it("rejects cross-origin requests before quota or provider access", async () => {
  const response = await POST(
    new Request("https://capcar.test/api/international-search", {
      method: "POST",
      headers: { origin: "https://other.test" },
    }),
  );
  expect(response.status).toBe(403);
  expect(mocks.guard).not.toHaveBeenCalled();
});
it("allows a valid anonymous query through the public budget", async () => {
  expect((await POST(request())).status).toBe(200);
  expect(mocks.guard).toHaveBeenCalledOnce();
  expect(mocks.search).toHaveBeenCalledOnce();
});
it("does not contact the provider after budget rejection", async () => {
  mocks.guard.mockResolvedValue(new Response(null, { status: 429 }));
  expect((await POST(request())).status).toBe(429);
  expect(mocks.search).not.toHaveBeenCalled();
});
