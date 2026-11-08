// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
const mocks = vi.hoisted(() => ({
  user: vi.fn(),
  guard: vi.fn(),
  connection: vi.fn(),
  review: vi.fn(),
  bounded: vi.fn(),
}));
vi.mock("@/lib/supabase/current-user", () => ({ currentUser: mocks.user }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({}) }));
vi.mock("@/features/connections/ai-connection", () => ({
  getAiConnection: mocks.connection,
  getAiConnectionSetup: () => ({ configured: true }),
}));
vi.mock("@/features/driving-review/review-service", async (original) => ({
  ...(await original<object>()),
  reviewDrivingFrames: mocks.review,
  isBoundedJpeg: mocks.bounded,
}));
vi.mock("@/lib/api/guard", async (original) => ({
  ...(await original<object>()),
  guardProductApi: mocks.guard,
}));
import { POST } from "./route";
const input = {
  consent: true,
  locale: "en",
  duration: 10,
  focus: "space",
  frames: [
    { time: 1, image: "data:image/jpeg;base64,YWJjZA==" },
    { time: 2, image: "data:image/jpeg;base64,YWJjZA==" },
  ],
};
const request = (body: unknown = input, headers: Record<string, string> = {}) =>
  new Request("https://capcar.dev/api/ai/driving-review", {
    method: "POST",
    headers: {
      origin: "https://capcar.dev",
      "content-type": "application/json",
      "x-capcar-owner": "owner",
      ...headers,
    },
    body: JSON.stringify(body),
  });
beforeEach(() => {
  vi.resetAllMocks();
  mocks.user.mockResolvedValue({ id: "owner" });
  mocks.guard.mockResolvedValue({ ok: true });
  mocks.connection.mockResolvedValue({ provider: "openai" });
  mocks.bounded.mockReturnValue(true);
  mocks.review.mockResolvedValue({
    summary: "Reflection",
    limitations: ["Sparse frames"],
    tips: [],
  });
});
describe("private driving review API", () => {
  it("rejects cross-origin requests before auth or processing", async () => {
    expect(
      (await POST(request(input, { origin: "https://other.example" }))).status,
    ).toBe(403);
    expect(mocks.user).not.toHaveBeenCalled();
  });
  it("requires authentication", async () => {
    mocks.user.mockResolvedValue(null);
    expect((await POST(request())).status).toBe(401);
    expect(mocks.review).not.toHaveBeenCalled();
  });
  it("rejects stale account requests", async () => {
    expect(
      (await POST(request(input, { "x-capcar-owner": "different-owner" })))
        .status,
    ).toBe(409);
    expect(mocks.connection).not.toHaveBeenCalled();
  });
  it("requires consent before looking up credentials", async () => {
    expect((await POST(request({ ...input, consent: false }))).status).toBe(
      400,
    );
    expect(mocks.connection).not.toHaveBeenCalled();
  });
  it("rejects oversized bodies", async () => {
    expect(
      (await POST(request({ payload: "x".repeat(2_200_001) }))).status,
    ).toBe(413);
    expect(mocks.review).not.toHaveBeenCalled();
  });
  it("rejects malformed image payloads", async () => {
    mocks.bounded.mockReturnValue(false);
    expect((await POST(request())).status).toBe(400);
    expect(mocks.review).not.toHaveBeenCalled();
  });
  it("enforces the existing account rate limit", async () => {
    mocks.guard.mockResolvedValue({
      ok: false,
      response: new Response(null, { status: 429 }),
    });
    expect((await POST(request())).status).toBe(429);
    expect(mocks.connection).not.toHaveBeenCalled();
  });
  it("requires the owner's connected key", async () => {
    mocks.connection.mockResolvedValue(null);
    expect((await POST(request())).status).toBe(409);
    expect(mocks.connection).toHaveBeenCalledWith({}, "owner");
  });
  it("returns no-store results without storing images or returning keys", async () => {
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toContain("no-store");
    const body = await response.json();
    expect(Object.keys(body).sort()).toEqual(["provider", "review"]);
  });
});
