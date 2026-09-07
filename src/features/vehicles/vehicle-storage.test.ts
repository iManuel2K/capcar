import { describe, expect, it } from "vitest";

import {
  readVehicles,
  removeVehicle,
  saveVehicle,
  seedShowcaseGarage,
  updateVehicle,
} from "@/features/vehicles/vehicle-storage";

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

  it("updates a vehicle without changing its identity", () => {
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
        nickname: "Project 318",
      },
      storage,
      { id: "bmw-318i", createdAt: "2026-09-04T10:00:00.000Z" },
    );

    const updated = updateVehicle(
      "bmw-318i",
      {
        make: "BMW",
        model: "318i",
        productionYear: 2011,
        platform: "E90",
        bodyStyle: "Sedan",
        engineCode: "N43B20",
        transmission: "Manual",
        mileage: 150000,
        nickname: "Street Terrorist",
      },
      storage,
    );

    expect(updated).toMatchObject({
      id: "bmw-318i",
      createdAt: "2026-09-04T10:00:00.000Z",
      mileage: 150000,
      nickname: "Street Terrorist",
    });
    expect(readVehicles(storage)).toHaveLength(1);
  });

  it("removes only the selected vehicle", () => {
    const storage = memoryStorage();
    seedShowcaseGarage(storage);

    expect(removeVehicle("demo-bmw-318i-e90", storage)).toBe(true);
    expect(removeVehicle("missing", storage)).toBe(false);
    expect(readVehicles(storage)).toHaveLength(3);
    expect(
      readVehicles(storage).some(
        (vehicle) => vehicle.id === "demo-bmw-318i-e90",
      ),
    ).toBe(false);
  });

  it("adds the showcase projects only once", () => {
    const storage = memoryStorage();

    expect(seedShowcaseGarage(storage)).toBe(true);
    expect(seedShowcaseGarage(storage)).toBe(false);
    expect(readVehicles(storage)).toHaveLength(4);
    expect(readVehicles(storage).map((vehicle) => vehicle.make)).toEqual(
      expect.arrayContaining(["BMW", "Ford", "Mercedes-Benz", "Volkswagen"]),
    );
  });
});
