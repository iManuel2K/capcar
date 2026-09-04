import { describe, expect, it } from "vitest";

import { findCatalogPart, partCatalog } from "@/features/parts/part-catalog";

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
});
