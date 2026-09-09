import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  configured: true,
  guard: vi.fn(),
  rpc: vi.fn(),
}));
vi.mock("@/features/auth/auth-config", () => ({
  getAuthStatus: () => ({ configured: mocks.configured }),
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ rpc: mocks.rpc }),
}));
vi.mock("@/lib/api/guard", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api/guard")>()),
  guardProductApi: mocks.guard,
}));
import { POST } from "@/app/api/community/route";
describe("community API boundary", () => {
  beforeEach(() => {
    mocks.configured = true;
    mocks.guard.mockReset();
    mocks.rpc.mockReset();
    mocks.guard.mockResolvedValue({ ok: true, userId: "user" });
  });
  function request(body: unknown, origin = "https://capcar.test") {
    return new Request("https://capcar.test/api/community", {
      method: "POST",
      headers: { origin, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }
  it("refuses cross-origin mutations before database access", async () => {
    expect((await POST(request({}, "https://untrusted.test"))).status).toBe(
      403,
    );
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("does not permit local-demo authentication for community writes", async () => {
    mocks.configured = false;
    expect((await POST(request({}))).status).toBe(503);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("rejects unknown operations and missing IDs", async () => {
    expect(
      (await POST(request({ action: "grant_role", data: {} }))).status,
    ).toBe(400);
    expect(
      (
        await POST(
          request({
            action: "moderate",
            data: { status: "published", reason: "This is a review" },
          }),
        )
      ).status,
    ).toBe(400);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("does not expose raw database errors", async () => {
    mocks.rpc.mockResolvedValue({
      error: { message: "internal table secret" },
    });
    const response = await POST(
      request({
        action: "withdraw",
        id: "00000000-0000-4000-8000-000000000001",
        data: {},
      }),
    );
    expect(response.status).toBe(409);
    expect(await response.text()).not.toContain("internal table secret");
  });
});
