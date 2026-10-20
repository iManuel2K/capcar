import { afterEach, describe, expect, it, vi } from "vitest";
const lookup = vi.hoisted(() => vi.fn());
vi.mock("@/features/problems/official-records-cache", () => ({
  getOfficialProblems: lookup,
}));
import { GET } from "./route";
afterEach(() => lookup.mockReset());
describe("public model-only problem lookup", () => {
  it("rejects arbitrary hosts, private details, duplicate keys and out-of-range years without fetching", async () => {
    for (const query of [
      "profile=unknown&year=2015",
      "profile=mazda3-bm&year=1990",
      "profile=mazda3-bm&year=2015&vin=PRIVATE",
      "profile=mazda3-bm&profile=auris-e180&year=2015",
      "profile=mazda3-bm&year=2015&url=https://evil.example",
    ]) {
      const response = await GET(
        new Request(`https://capcar.dev/api/problems?${query}`),
      );
      expect(response.status).toBe(400);
      expect(response.headers.get("Cache-Control")).toBe("no-store");
    }
    expect(lookup).not.toHaveBeenCalled();
  });
  it("shares only non-personal profile/year results through the CDN and never caches outages", async () => {
    lookup.mockResolvedValueOnce({ status: "available", records: [] });
    const response = await GET(
      new Request(
        "https://capcar.dev/api/problems?profile=mazda3-bm&year=2015",
      ),
    );
    expect(response.headers.get("Netlify-Vary")).toBe("query=profile|year");
    expect(response.headers.get("Netlify-CDN-Cache-Control")).toContain(
      "durable",
    );
    expect(response.headers.get("Set-Cookie")).toBeNull();
    expect(lookup).toHaveBeenCalledWith("mazda3-bm", 2015);
    lookup.mockRejectedValueOnce(new Error("source offline"));
    const failure = await GET(
      new Request(
        "https://capcar.dev/api/problems?profile=mazda3-bm&year=2015",
      ),
    );
    expect(failure.status).toBe(503);
    expect(failure.headers.get("Netlify-CDN-Cache-Control")).toBe("no-store");
  });
  it("never puts credentialed response headers into a shared CDN cache", async () => {
    lookup.mockResolvedValue({ status: "available", records: [] });
    const response = await GET(
      new Request(
        "https://capcar.dev/api/problems?profile=mazda3-bm&year=2015",
        { headers: { cookie: "private-session=secret" } },
      ),
    );
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(response.headers.get("Netlify-CDN-Cache-Control")).toBe("no-store");
    expect(JSON.stringify(await response.json())).not.toContain("secret");
  });
});
