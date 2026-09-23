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
      headers: { origin: "https://capcar.dev" },
    });
    expect(
      isSameOriginRequest(request, {
        NEXT_PUBLIC_SITE_URL: "https://capcar.dev",
      }),
    ).toBe(true);
  });

  it("accepts a Netlify deploy origin but rejects untrusted origins", () => {
    const deployment = "https://deploy-preview-90--capcar.dev";
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
        { NEXT_PUBLIC_SITE_URL: "https://capcar.dev" },
      ),
    ).toBe(false);
  });

  it("requires a syntactically exact browser origin", () => {
    const environment = {
      NEXT_PUBLIC_SITE_URL: "https://capcar.dev",
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
          headers: { origin: "https://capcar.dev/path" },
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
