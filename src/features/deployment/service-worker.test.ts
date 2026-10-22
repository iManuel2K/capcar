// @vitest-environment node
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { describe, expect, it, vi } from "vitest";

const script = readFileSync("public/sw.js", "utf8");
function worker(response: Response) {
  const handlers: Record<string, (event: unknown) => void> = {};
  const put = vi.fn();
  const fetch = vi.fn(async () => response);
  runInNewContext(script, {
    URL,
    Promise,
    self: {
      location: { origin: "https://capcar.test" },
      skipWaiting: vi.fn(),
      addEventListener: (name: string, handler: (event: unknown) => void) => {
        handlers[name] = handler;
      },
    },
    caches: {
      match: vi.fn(async () => undefined),
      open: async () => ({ put }),
    },
    fetch,
  });
  async function request(
    path: string,
    headers = new Headers(),
    destination = "document",
  ) {
    const respondWith = vi.fn();
    handlers.fetch({
      request: {
        url: `https://capcar.test${path}`,
        method: "GET",
        headers,
        mode: destination === "document" ? "navigate" : "same-origin",
        destination,
      },
      respondWith,
    });
    if (respondWith.mock.calls.length) await respondWith.mock.calls[0][0];
    return respondWith;
  }
  async function install() {
    const waitUntil = vi.fn();
    handlers.install({ waitUntil });
    await waitUntil.mock.calls[0][0];
  }
  return { put, fetch, request, install };
}

describe("public offline cache privacy", () => {
  it("applies the privacy rules during initial shell precaching too", async () => {
    const sw = worker(
      new Response("private page", {
        headers: { "cache-control": "private, no-store" },
      }),
    );
    await sw.install();
    expect(sw.fetch).toHaveBeenCalled();
    expect(sw.put).not.toHaveBeenCalled();
  });
  it.each(["private, max-age=0", "no-store", "no-cache"])(
    "never caches %s navigation or asset responses",
    async (control) => {
      for (const destination of ["document", "script"]) {
        const sw = worker(
          new Response("private data", {
            headers: { "cache-control": control },
          }),
        );
        await sw.request("/roadmap", new Headers(), destination);
        expect(sw.put).not.toHaveBeenCalled();
      }
    },
  );
  it.each(["Cookie", "Accept-Encoding, Cookie", "Authorization", "*"])(
    "does not cache responses varying on %s",
    async (vary) => {
      const sw = worker(new Response("data", { headers: { vary } }));
      await sw.request("/roadmap");
      expect(sw.put).not.toHaveBeenCalled();
    },
  );
  it("retains public offline navigation caching", async () => {
    const sw = worker(
      new Response("public page", {
        headers: { "cache-control": "public, max-age=60" },
      }),
    );
    await sw.request("/roadmap");
    expect(sw.put).toHaveBeenCalledOnce();
  });
  it.each([
    "/account",
    "/garage/car-a",
    "/passport/token",
    "/api/community",
    "/roadmap?_rsc=1",
  ])("bypasses private path %s", async (path) => {
    const sw = worker(new Response("data"));
    expect(await sw.request(path)).not.toHaveBeenCalled();
    expect(sw.fetch).not.toHaveBeenCalled();
  });
  it("bypasses RSC and authenticated requests even without a private URL", async () => {
    for (const headers of [
      new Headers({ rsc: "1" }),
      new Headers({ authorization: "Bearer test" }),
    ]) {
      const sw = worker(new Response("data"));
      expect(await sw.request("/roadmap", headers)).not.toHaveBeenCalled();
      expect(sw.put).not.toHaveBeenCalled();
    }
  });
});
