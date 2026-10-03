import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  isSameOriginRequest,
  productApiError,
  readJsonRequest,
  RequestTooLargeError,
} from "@/lib/api/guard";

describe("API request protection", () => {
  it("accepts the configured public origin behind an internal deployment URL", () => {
    const request = new Request("https://internal-runtime.test/api/tool", {
      method: "POST",
      headers: { origin: "https://capcar-im.netlify.app" },
    });
    expect(
      isSameOriginRequest(request, {
        NEXT_PUBLIC_SITE_URL: "https://capcar-im.netlify.app",
      }),
    ).toBe(true);
  });

  it("accepts a Netlify deploy origin but rejects untrusted origins", () => {
    const deployment = "https://deploy-preview-90--capcar-im.netlify.app";
    expect(
      isSameOriginRequest(
        new Request("https://internal-runtime.test/api/tool", {
          method: "POST",
          headers: { origin: deployment },
        }),
        { DEPLOY_PRIME_URL: deployment },
      ),
    ).toBe(true);
    expect(
      isSameOriginRequest(
        new Request("https://internal-runtime.test/api/tool", {
          method: "POST",
          headers: { origin: "https://attacker.test" },
        }),
        { NEXT_PUBLIC_SITE_URL: "https://capcar-im.netlify.app" },
      ),
    ).toBe(false);
  });

  it("accepts the browser origin reconstructed from trusted proxy headers", () => {
    const deployment = "deploy-preview-33--capcar-im.netlify.app";
    const request = new Request("https://internal-runtime.test/api/tool", {
      method: "POST",
      headers: {
        origin: `https://${deployment}`,
        host: "internal-runtime.test",
        "x-forwarded-host": deployment,
        "x-forwarded-proto": "https",
      },
    });

    expect(isSameOriginRequest(request, {})).toBe(true);
  });

  it("requires a syntactically exact browser origin", () => {
    const environment = {
      NEXT_PUBLIC_SITE_URL: "https://capcar-im.netlify.app",
    };
    expect(
      isSameOriginRequest(
        new Request("https://internal-runtime.test/api/tool", {
          method: "POST",
        }),
        environment,
      ),
    ).toBe(false);
    expect(
      isSameOriginRequest(
        new Request("https://internal-runtime.test/api/tool", {
          method: "POST",
          headers: { origin: "https://capcar-im.netlify.app/path" },
        }),
        environment,
      ),
    ).toBe(false);
  });

  it("validates a bounded JSON body", async () => {
    const request = new Request("https://capcar.test/api/tool", {
      method: "POST",
      body: JSON.stringify({ query: "E90 brakes" }),
    });
    await expect(
      readJsonRequest(request, z.object({ query: z.string().min(1) })),
    ).resolves.toEqual({ query: "E90 brakes" });
  });

  it("rejects oversized requests", async () => {
    const request = new Request("https://capcar.test/api/tool", {
      method: "POST",
      body: JSON.stringify({ query: "x".repeat(200) }),
    });
    await expect(
      readJsonRequest(request, z.object({ query: z.string() }), 32),
    ).rejects.toBeInstanceOf(RequestTooLargeError);
  });

  it("does not expose internal errors", async () => {
    const response = productApiError(
      new Error("provider-secret-internal-detail"),
      "Search failed.",
    );
    await expect(response.json()).resolves.toEqual({ error: "Search failed." });
  });
});
