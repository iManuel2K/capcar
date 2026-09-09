import { describe, expect, it } from "vitest";

import {
  findCatalogPart,
  partCatalog,
  searchCatalogParts,
} from "@/features/parts/part-catalog";

describe("demo part catalogue", () => {
  it("uses unique identifiers and demo part numbers", () => {
    expect(new Set(partCatalog.map((part) => part.id)).size).toBe(
      partCatalog.length,
    );
    expect(
      partCatalog.every((part) => part.partNumber.startsWith("DEMO-")),
    ).toBe(true);
  });

  it("finds a part by its route identifier", () => {
    expect(findCatalogPart("demo-dark-rear-lamps-e90")?.category).toBe(
      "Lighting",
    );
  });

  it("searches names, cross-reference numbers and fitment without a vehicle", () => {
    expect(searchCatalogParts("DEMO-SVC-N43-14")[0]?.name).toContain(
      "spark-plug",
    );
    expect(searchCatalogParts("E90 brake").length).toBeGreaterThan(0);
    expect(searchCatalogParts("G20")[0]?.id).toBe("demo-g20-splitter");
  });

  it("provides a ready-looking E9x catalogue across core categories", () => {
    const e9xParts = partCatalog.filter((part) =>
      part.fitmentRules.some((rule) => rule.platforms.includes("E90")),
    );

    expect(e9xParts.length).toBeGreaterThanOrEqual(14);
    expect(
      new Set(e9xParts.map((part) => part.category)).size,
    ).toBeGreaterThanOrEqual(6);
  });
});
