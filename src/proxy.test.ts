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
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { config } from "@/proxy";

it("serves public sound and social assets without session middleware while protecting workspace routes", () => {
  for (const url of [
    "/sounds/honda-f20c.mp3",
    "/sounds/example.ogg",
    "/social/capcar-sound-studio-share.png",
  ]) {
    expect(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url })).toBe(
      false,
    );
  }
  for (const url of [
    "/garage",
    "/account",
    "/ai",
    "/passport/00000000-0000-4000-8000-000000000001",
  ]) {
    expect(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url })).toBe(
      true,
    );
  }
});

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

  it("keeps worksheet downloads outside the localized journal guard", async () => {
    const response = await proxy(
      new NextRequest(
        "https://capcar.example/downloads/journal/bmw-wochenendprojekt-planen.txt",
      ),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("x-robots-tag")).toBeNull();
  });

  it("allows the public AI preview without redirecting visitors to login", async () => {
    const response = await proxy(
      new NextRequest("https://capcar.example/ai?from=header"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it.each([
    "/en",
    "/en/platform",
    "/en/connected-parts",
    "/en/ai",
    "/en/project-car-planner",
  ])("consolidates %s without losing search parameters", async (path) => {
    const response = await proxy(
      new NextRequest(
        `https://capcar.example${path}?q=N43&utm_source=instagram`,
      ),
    );
    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      `https://capcar.example${path === "/en" ? "/" : path.slice(3)}?q=N43&utm_source=instagram`,
    );
    expect(supabaseMocks.authGetUser).not.toHaveBeenCalled();
  });

  it("preserves English journal URLs and explicit non-English public routes", async () => {
    for (const path of [
      "/en/journal/build-plan-first-job",
      "/de/platform",
      "/el/ai",
      "/sq/car-maintenance-tracker",
      "/ja/project-car-planner",
    ]) {
      const response = await proxy(
        new NextRequest(`https://capcar.example${path}`),
      );
      expect(response.status).toBe(200);
      expect(response.headers.get("location")).toBeNull();
    }
  });

  it("renders the canonical English public route independently of an old locale cookie", async () => {
    const response = await proxy(
      new NextRequest("https://capcar.example/platform", {
        headers: { cookie: "capcar_locale=de" },
      }),
    );
    expect(response.headers.get("x-middleware-request-x-capcar-locale")).toBe(
      "en",
    );
  });

  it.each([
    "/garage",
    "/garage/private-car",
    "/account",
    "/account/connections",
  ])("keeps %s protected while the AI preview is public", async (path) => {
    const response = await proxy(
      new NextRequest(`https://capcar.example${path}`),
    );
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      `https://capcar.example/login?next=${encodeURIComponent(path)}`,
    );
  });

  it("redirects the Journal entry to the selected language and preserves campaign parameters", async () => {
    const japanese = await proxy(
      new NextRequest("https://capcar.example/journal?utm_source=instagram", {
        headers: { "accept-language": "ja" },
      }),
    );
    expect(japanese.status).toBe(307);
    expect(japanese.headers.get("location")).toBe(
      "https://capcar.example/ja/journal?utm_source=instagram",
    );
    const albanian = await proxy(
      new NextRequest("https://capcar.example/journal", {
        headers: { cookie: "capcar_locale=sq", "accept-language": "en" },
      }),
    );
    expect(albanian.headers.get("location")).toBe(
      "https://capcar.example/sq/journal",
    );
    expect(supabaseMocks.authGetUser).not.toHaveBeenCalled();
  });

  it("returns HTTP 404 for missing journal articles and unsupported locales before streaming", async () => {
    for (const path of [
      "/de/journal/missing",
      "/fr/journal",
      "/de/journal/missing/child",
    ]) {
      const response = await proxy(
        new NextRequest(`https://capcar.example${path}`),
      );
      expect(response.status).toBe(404);
      expect(response.headers.get("x-robots-tag")).toContain("noindex");
    }
    expect(supabaseMocks.authGetUser).not.toHaveBeenCalled();
  });
});
