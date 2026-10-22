// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getUser: vi.fn(), rpc: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: mocks.getUser },
    rpc: mocks.rpc,
  }),
}));
import { guardProductApi } from "@/lib/api/guard";

describe("product API access", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("NEXT_PUBLIC_DEPLOYMENT_ENV", "");
    vi.stubEnv("CONTEXT", "");
    vi.stubEnv("VERCEL_ENV", "");
    mocks.getUser.mockReset();
    mocks.rpc.mockReset();
  });
  afterEach(() => vi.unstubAllEnvs());
  it("preserves unconfigured local demo tools", async () => {
    await expect(guardProductApi("catalog-search")).resolves.toEqual({
      ok: true,
    });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it.each(["NODE_ENV", "NEXT_PUBLIC_DEPLOYMENT_ENV", "CONTEXT", "VERCEL_ENV"])(
    "fails closed with missing auth in %s production",
    async (key) => {
      vi.stubEnv(key, "production");
      const result = await guardProductApi("catalog-search");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.response.status).toBe(503);
        expect(result.response.headers.get("cache-control")).toBe("no-store");
      }
      expect(mocks.getUser).not.toHaveBeenCalled();
    },
  );
  it("denies a missing user before consuming provider quota", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "test-publishable-key");
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
    const result = await guardProductApi("trip-route");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(401);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("fails closed when the quota service fails", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "test-publishable-key");
    mocks.getUser.mockResolvedValue({
      data: { user: { id: "owner" } },
      error: null,
    });
    mocks.rpc.mockResolvedValue({
      data: null,
      error: { message: "Unavailable" },
    });
    const result = await guardProductApi("trip-route");
    if (result.ok) throw new Error("Unexpected quota bypass");
    expect(result.response.status).toBe(503);
  });
});
