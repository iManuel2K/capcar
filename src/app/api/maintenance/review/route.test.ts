import { beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

const mocks = vi.hoisted(() => ({
  guard: vi.fn(),
  setup: vi.fn(),
  connection: vi.fn(),
  extract: vi.fn(),
}));

vi.mock("@/lib/api/guard", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api/guard")>()),
  guardProductApi: mocks.guard,
}));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({}) }));
vi.mock("@/features/connections/ai-connection", () => ({
  getAiConnectionSetup: mocks.setup,
  getAiConnection: mocks.connection,
}));
vi.mock("@/features/service-review/vision-extraction", () => ({
  VisionReviewError: class extends Error {},
  extractServiceEvidence: mocks.extract,
}));

// Minimal fixture containing a JPEG frame header. The provider is mocked.
function samplePhoto(width = 1) {
  return Buffer.from([
    0xff,
    0xd8,
    0xff,
    0xc0,
    0x00,
    0x0b,
    0x08,
    0x00,
    0x01,
    width >> 8,
    width & 255,
    0x01,
    0x01,
    0x11,
    0x00,
    0xff,
    0xda,
    0x00,
    0x08,
    0x01,
    0x01,
    0x00,
    0x00,
    0x3f,
    0x00,
    0xff,
    0xd9,
  ]).toString("base64");
}

function reviewRequest(
  overrides: Record<string, unknown> = {},
  origin = "https://capcar.dev",
) {
  return new Request("https://capcar.dev/api/maintenance/review", {
    method: "POST",
    headers: { "Content-Type": "application/json", origin },
    body: JSON.stringify({
      consent: true,
      photos: [{ data: samplePhoto() }],
      vehicle: { make: "BMW", model: "318i", year: 2011, mileage: 143_000 },
      tasks: [
        {
          key: "engine-oil-filter",
          title: "Not a server-owned title",
          intervalMonths: 100,
        },
      ],
      ...overrides,
    }),
  });
}

describe("service record review API", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.guard.mockResolvedValue({ ok: true, userId: "signed-in-owner" });
    mocks.setup.mockReturnValue({ configured: true });
    mocks.connection.mockResolvedValue({ provider: "openai" });
    mocks.extract.mockResolvedValue([]);
  });

  it("rejects cross-origin requests before auth, body parsing or AI", async () => {
    expect(
      (await POST(reviewRequest({}, "https://example.invalid"))).status,
    ).toBe(403);
    expect(mocks.guard).not.toHaveBeenCalled();
    expect(mocks.extract).not.toHaveBeenCalled();
  });

  it("requires a real account even in browser-local mode", async () => {
    mocks.guard.mockResolvedValue({ ok: true });
    expect((await POST(reviewRequest())).status).toBe(401);
    expect(mocks.extract).not.toHaveBeenCalled();
  });

  it("requires explicit consent and bounded photos before loading credentials", async () => {
    expect((await POST(reviewRequest({ consent: false }))).status).toBe(400);
    expect(
      (await POST(reviewRequest({ photos: [{ data: samplePhoto(2049) }] })))
        .status,
    ).toBe(400);
    expect(
      (
        await POST(
          reviewRequest({
            photos: Array.from({ length: 4 }, () => ({ data: samplePhoto() })),
          }),
        )
      ).status,
    ).toBe(400);
    expect(mocks.connection).not.toHaveBeenCalled();
    expect(mocks.extract).not.toHaveBeenCalled();
  });

  it("does not use a shared provider if the signed-in owner has no connection", async () => {
    mocks.connection.mockResolvedValue(null);
    const response = await POST(reviewRequest());
    expect(response.status).toBe(409);
    expect(await response.json()).toMatchObject({
      code: "ai_connection_required",
    });
    expect(mocks.extract).not.toHaveBeenCalled();
  });

  it("loads only the authenticated owner's connection and ignores caller-edited intervals", async () => {
    mocks.extract.mockResolvedValue([
      {
        photoIndex: 0,
        taskKey: "engine-oil-filter",
        work: "Replaced engine oil and filter",
        date: "2022-09-01",
        mileage: 100_000,
        excerpt: "Oil and filter replaced",
      },
    ]);
    const response = await POST(reviewRequest());
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(mocks.connection).toHaveBeenCalledWith({}, "signed-in-owner");
    expect(mocks.extract.mock.calls[0][0].tasks[0].intervalMonths).toBe(12);
    const result = await response.json();
    expect(result.items).toContainEqual(
      expect.objectContaining({
        taskKey: "engine-oil-filter",
        status: "due",
        source: "photo",
        photoIndex: 0,
      }),
    );
    expect(result.items).toContainEqual(
      expect.objectContaining({
        taskKey: "brake-fluid",
        status: "unconfirmed",
      }),
    );
  });
});
