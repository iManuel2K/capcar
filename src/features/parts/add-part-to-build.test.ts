import { describe, expect, it } from "vitest";

import { createBuild } from "@/features/builds/build-storage";
import { addCatalogPartToBuild } from "@/features/parts/add-part-to-build";
import { findCatalogPart } from "@/features/parts/part-catalog";

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  };
}

describe("catalogue to build", () => {
  it("prevents the same catalogue item from being added twice", () => {
    const storage = memoryStorage();
    createBuild(
      {
        vehicleId: "vehicle-1",
        name: "Stealth Rear",
        goal: "Appearance",
        description: "A darker and cleaner rear treatment.",
        budget: 1200,
        status: "planning",
      },
      storage,
      { id: "build-1", createdAt: "2026-09-04T10:00:00.000Z" },
    );
    const part = findCatalogPart("demo-dark-rear-lamps-e90");
    if (!part) throw new Error("Fixture missing");

    expect(addCatalogPartToBuild(part, "build-1", storage).status).toBe(
      "added",
    );
    expect(addCatalogPartToBuild(part, "build-1", storage).status).toBe(
      "duplicate",
    );
  });
});
