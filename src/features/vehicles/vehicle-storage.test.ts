import { describe, expect, it } from "vitest";

import { readVehicles, saveVehicle } from "@/features/vehicles/vehicle-storage";

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  };
}

describe("vehicle storage", () => {
  it("saves and restores a normalized vehicle", () => {
    const storage = memoryStorage();
    saveVehicle(
      {
        make: "BMW",
        model: "318i",
        productionYear: 2011,
        platform: "E90",
        bodyStyle: "Sedan",
        engineCode: "N43B20",
        transmission: "Manual",
        mileage: 148200,
        color: "Space Grey",
        nickname: "",
      },
      storage,
      { id: "bmw-318i", createdAt: "2026-09-04T10:00:00.000Z" },
    );

    expect(readVehicles(storage)).toMatchObject([
      {
        id: "bmw-318i",
        model: "318i",
        platform: "E90",
        mileage: 148200,
      },
    ]);
  });

  it("returns an empty list for damaged local data", () => {
    const storage = memoryStorage();
    storage.setItem("capcar.vehicles.v1", "not-json");

    expect(readVehicles(storage)).toEqual([]);
  });
});
