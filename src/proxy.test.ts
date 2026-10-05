import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const supabaseMocks = vi.hoisted(() => {
  const maybeSingle = vi.fn();
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    abortSignal: vi.fn(),
    maybeSingle,
  };
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  query.abortSignal.mockReturnValue(query);

  return {
    authGetUser: vi.fn(),
    createServerClient: vi.fn(),
    from: vi.fn(() => query),
    maybeSingle,
    query,
  };
});

vi.mock("@supabase/ssr", () => ({
  createServerClient: supabaseMocks.createServerClient,
}));

import { proxy } from "@/proxy";

describe("proxy public Passport guard", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_test";
    supabaseMocks.authGetUser.mockResolvedValue({ data: { user: null } });
    supabaseMocks.createServerClient.mockReturnValue({
      auth: { getUser: supabaseMocks.authGetUser },
      from: supabaseMocks.from,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns a branded HTTP 404 for a missing public Passport", async () => {
    supabaseMocks.maybeSingle.mockResolvedValue({ data: null, error: null });

    const response = await proxy(
      new NextRequest(
        "https://capcar.example/passport/00000000-0000-4000-8000-000000000000",
      ),
    );

    expect(response.status).toBe(404);
    expect(response.headers.get("content-type")).toBe(
      "text/html; charset=utf-8",
    );
    expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow");
    await expect(response.text()).resolves.toContain("Passport unavailable");
    expect(supabaseMocks.authGetUser).not.toHaveBeenCalled();
  });

  it("allows a verified public Passport through without an auth lookup", async () => {
    supabaseMocks.maybeSingle.mockResolvedValue({
      data: { share_id: "public-share" },
      error: null,
    });

    const response = await proxy(
      new NextRequest(
        "https://capcar.example/passport/00000000-0000-4000-8000-000000000001",
      ),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(supabaseMocks.authGetUser).not.toHaveBeenCalled();
  });
  it("does not cache outages or mislabel them as missing records", async () => {
    supabaseMocks.maybeSingle.mockResolvedValue({
      data: null,
      error: { message: "offline" },
    });
    const response = await proxy(
      new NextRequest(
        "https://capcar.example/passport/00000000-0000-4000-8000-000000000001",
        { headers: { "accept-language": "de" } },
      ),
    );
    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(await response.text()).toContain('lang="de"');
  });
  it("rejects malformed IDs without querying and handles missing configuration", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    expect(
      (
        await proxy(
          new NextRequest("https://capcar.example/passport/not-a-uuid"),
        )
      ).status,
    ).toBe(404);
    expect(supabaseMocks.from).not.toHaveBeenCalled();
    expect(
      (
        await proxy(
          new NextRequest(
            "https://capcar.example/passport/00000000-0000-4000-8000-000000000001",
          ),
        )
      ).status,
    ).toBe(503);
  });

  it("requires an account before opening CapCar AI", async () => {
    const response = await proxy(
      new NextRequest("https://capcar.example/ai?from=header"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://capcar.example/login?next=%2Fai%3Ffrom%3Dheader",
    );
  });
});
