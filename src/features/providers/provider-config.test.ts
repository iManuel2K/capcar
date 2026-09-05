import { describe, expect, it } from "vitest";

import { getProviderStatuses } from "@/features/providers/provider-config";

describe("provider configuration", () => {
  it("uses demo providers by default", () => {
    const statuses = getProviderStatuses({});
    expect(statuses).toHaveLength(4);
    expect(statuses.every((status) => status.mode === "demo")).toBe(true);
    expect(statuses.every((status) => status.configured)).toBe(true);
  });

  it("does not expose or accept an incomplete external provider", () => {
    const statuses = getProviderStatuses({
      CAPCAR_CATALOG_PROVIDER_MODE: "external",
      CAPCAR_CATALOG_PROVIDER_ENDPOINT: "https://provider.example/search",
    });
    const catalog = statuses.find((status) => status.domain === "catalog");
    expect(catalog?.configured).toBe(false);
    expect(JSON.stringify(catalog)).not.toContain("API_KEY");
  });
});
