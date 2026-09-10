import { beforeEach, expect, it, vi } from "vitest";
const rpc = vi.hoisted(() => vi.fn());
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ rpc }),
}));
import { guardPublicRetail } from "./public-retail-guard";
beforeEach(() => rpc.mockReset());
it("allows anonymous search only with an explicit database allowance", async () => {
  rpc.mockResolvedValue({ data: true, error: null });
  expect(await guardPublicRetail()).toBeNull();
  expect(rpc).toHaveBeenCalledWith("consume_public_retail_budget");
});
it("stops exhausted budgets", async () => {
  rpc.mockResolvedValue({ data: false, error: null });
  expect((await guardPublicRetail())?.status).toBe(429);
});
it("fails closed without leaking database errors", async () => {
  rpc.mockResolvedValue({ data: null, error: { message: "secret" } });
  const response = await guardPublicRetail();
  expect(response?.status).toBe(503);
  expect(await response?.text()).not.toContain("secret");
});
