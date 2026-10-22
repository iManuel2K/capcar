// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ guard: vi.fn() }));
vi.mock("@/lib/api/guard", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api/guard")>()),
  guardProductApi: mocks.guard,
}));
import { POST as catalog } from "@/app/api/catalog/search/route";
import { POST as offers } from "@/app/api/offers/search/route";
import { POST as vehicle } from "@/app/api/vehicle-data/resolve/route";
import { POST as copilot } from "@/app/api/copilot/chat/route";
import { POST as routeMap } from "@/app/api/ai/trips/route-map/route";

describe("product request origins", () => {
  it.each([catalog, offers, vehicle, copilot, routeMap])(
    "rejects cross-site and missing origins before auth or body parsing",
    async (handler) => {
      for (const origin of [undefined, "https://attacker.test"]) {
        const response = await handler(
          new Request("https://capcar.test/api/tool", {
            method: "POST",
            headers: origin ? { origin } : {},
            body: "invalid JSON",
          }),
        );
        expect(response.status).toBe(403);
        expect(response.headers.get("cache-control")).toBe("no-store");
      }
      expect(mocks.guard).not.toHaveBeenCalled();
    },
  );
  it("enforces the route provider quota before reading the body", async () => {
    mocks.guard.mockResolvedValue({
      ok: false,
      response: new Response(null, { status: 429 }),
    });
    const response = await routeMap(
      new Request("https://capcar.test/api/tool", {
        method: "POST",
        headers: { origin: "https://capcar.test" },
        body: "invalid JSON",
      }),
    );
    expect(response.status).toBe(429);
    expect(mocks.guard).toHaveBeenCalledWith("trip-route", { limit: 10 });
  });
});
