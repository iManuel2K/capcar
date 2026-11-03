import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  guard: vi.fn(),
  connection: vi.fn(),
  connected: vi.fn(),
  rules: vi.fn(),
  admin: vi.fn(),
}));
vi.mock("@/lib/api/guard", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api/guard")>()),
  guardProductApi: mocks.guard,
}));
vi.mock("@/features/connections/ai-connection", () => ({
  getAiConnectionSetup: () => ({ configured: true }),
  getAiConnection: mocks.connection,
}));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: mocks.admin }));
vi.mock("@/features/copilot/connected-copilot", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("@/features/copilot/connected-copilot")
  >()),
  askConnectedCopilot: mocks.connected,
}));
vi.mock("@/features/copilot/copilot-provider", () => ({
  askCopilot: mocks.rules,
}));
import { POST } from "./route";
import { readCopilotResponse } from "@/features/copilot/chat-transport";
const payload = {
  message: "Help with chip tuning",
  vehicle: {
    id: "car",
    model: "318i",
    productionYear: 2011,
    platform: "E90",
    engineCode: "N43",
    mileage: 0,
  },
  buildItems: [],
};
const request = (body: Record<string, unknown> = payload) =>
  new Request("https://capcar.dev/api/copilot/chat", {
    method: "POST",
    headers: {
      origin: "https://capcar.dev",
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
beforeEach(() => {
  vi.clearAllMocks();
  mocks.guard.mockResolvedValue({ ok: true, userId: "authenticated-owner" });
  mocks.connected.mockResolvedValue({ answer: "AI answer" });
  mocks.rules.mockResolvedValue({ answer: "Rules answer" });
});
describe("copilot authentication and dispatch", () => {
  it("streams a real connected reply without changing the account boundary", async () => {
    mocks.connection.mockResolvedValue({ provider: "gemini", model: "saved" });
    mocks.connected.mockResolvedValue({
      answer: "Actual reply",
      source: "external",
      provider: "Your Gemini",
      evidence: [],
      warnings: [],
      nextActions: [],
    });
    const input = request();
    input.headers.set("accept", "application/x-ndjson");
    const response = await POST(input);
    expect(response.headers.get("content-type")).toContain(
      "application/x-ndjson",
    );
    expect((await readCopilotResponse(response)).answer).toBe("Actual reply");
    expect(mocks.connection.mock.calls[0][1]).toBe("authenticated-owner");
    expect(mocks.connected).toHaveBeenCalledOnce();
  });
  it("handles account-service exceptions as a clear service failure", async () => {
    mocks.guard.mockRejectedValueOnce(new Error("private account failure"));
    const response = await POST(request());
    expect(response.status).toBe(503);
    expect((await response.json()).code).toBe("account_guard_unavailable");
    expect(mocks.connected).not.toHaveBeenCalled();
  });
  it("requires a connected provider for tuning reviews and prompt improvement", async () => {
    mocks.connection.mockResolvedValue(null);
    for (const intent of ["tuning_prompt", "tuning_review"]) {
      const response = await POST(request({ ...payload, intent }));
      expect(response.status).toBe(409);
      expect((await response.json()).code).toBe("ai_connection_required");
    }
    expect(mocks.rules).not.toHaveBeenCalled();
    expect(mocks.connected).not.toHaveBeenCalled();
  });
  it("loads credentials only for the authenticated account and uses its provider", async () => {
    const connection = { provider: "gemini", model: "saved" };
    mocks.connection.mockResolvedValue(connection);
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(mocks.connection.mock.calls[0][1]).toBe("authenticated-owner");
    expect(mocks.connected.mock.calls[0][1]).toBe(connection);
    expect(mocks.rules).not.toHaveBeenCalled();
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
  it("does not look up keys for unauthenticated requests", async () => {
    mocks.guard.mockResolvedValue({
      ok: false,
      response: new Response("Sign in", { status: 401 }),
    });
    expect((await POST(request())).status).toBe(401);
    expect(mocks.connection).not.toHaveBeenCalled();
    expect(mocks.connected).not.toHaveBeenCalled();
  });
  it("uses explicit rules mode only when no connection exists", async () => {
    mocks.connection.mockResolvedValue(null);
    expect((await POST(request())).status).toBe(200);
    expect(mocks.rules).toHaveBeenCalledOnce();
    expect(mocks.connected).not.toHaveBeenCalled();
  });
  it("does not silently fall back when connection lookup fails", async () => {
    mocks.connection.mockRejectedValue(new Error("private database failure"));
    const response = await POST(request());
    expect(response.status).toBeGreaterThanOrEqual(500);
    expect(await response.text()).not.toContain("private database");
    expect(mocks.rules).not.toHaveBeenCalled();
  });
});
