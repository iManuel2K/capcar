// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ guard: vi.fn(), client: vi.fn() }));
vi.mock("@/lib/api/guard", async (original) => ({
  ...(await original<typeof import("@/lib/api/guard")>()),
  guardProductApi: mocks.guard,
}));
vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.client }));
import { POST } from "./route";

describe("listing upload boundaries", () => {
  beforeEach(() => {
    mocks.guard.mockReset().mockResolvedValue({ ok: true, userId: "owner" });
    mocks.client.mockReset();
  });
  it("cancels an oversized multipart stream before parsing or storage", async () => {
    const cancel = vi.fn();
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array(1_100_001));
      },
      cancel,
    });
    const request = new Request("https://capcar.test/api/community/photo", {
      method: "POST",
      body,
      duplex: "half",
      headers: {
        origin: "https://capcar.test",
        "content-type": "multipart/form-data; boundary=test",
        "content-length": "1",
      },
    } as RequestInit);
    const response = await POST(request);
    expect(response.status).toBe(413);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(cancel).toHaveBeenCalledOnce();
    expect(mocks.client).not.toHaveBeenCalled();
  });
  it("rejects an active-content upload even if its filename ends in jpg", async () => {
    const form = new FormData();
    form.set("id", "11111111-1111-4111-8111-111111111111");
    form.set(
      "file",
      new File(['<svg onload="alert(1)"></svg>'], "photo.jpg", {
        type: "image/svg+xml",
      }),
    );
    const response = await POST(
      new Request("https://capcar.test/api/community/photo", {
        method: "POST",
        headers: { origin: "https://capcar.test" },
        body: form,
      }),
    );
    expect(response.status).toBe(400);
    expect(mocks.client).not.toHaveBeenCalled();
  });
});
