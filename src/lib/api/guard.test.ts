import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  productApiError,
  readJsonRequest,
  RequestTooLargeError,
} from "@/lib/api/guard";

describe("API request protection", () => {
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
