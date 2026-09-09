import { describe, expect, it } from "vitest";
import {
  buildVisualSchema,
  createDefaultBuildVisual,
} from "./build-visual-schema";
import { accessoryGeometry } from "./accessory-geometry";
import { createReferenceVehicleModel } from "./reference-vehicle-model";
import { exhaustRecordingSchema, recordingsForVehicle } from "./exhaust-audio";
import { vehicleSchema } from "@/features/vehicles/vehicle-schema";
const vehicle = vehicleSchema.parse({
  id: "v",
  make: "BMW",
  model: "318i",
  platform: "E90",
  productionYear: 2011,
  bodyStyle: "Sedan",
  engineCode: "N43",
  transmission: "Manual",
  mileage: 100000,
  createdAt: "2026-09-05T00:00:00.000Z",
});
const model = createReferenceVehicleModel(vehicle);
const initial = createDefaultBuildVisual("v", "b");
describe("visual accessories and sound eligibility", () => {
  it("loads legacy visual saves without losing the existing paint", () => {
    const legacy = {
      vehicleId: "v",
      buildId: "b",
      paint: "deep-green",
      wheels: "factory",
      stance: "stock",
      lighting: "factory",
      aero: "factory",
      updatedAt: "2026-09-05T00:00:00.000Z",
    };
    const migrated = buildVisualSchema.parse(legacy);
    expect(migrated.paint).toBe("deep-green");
    expect(migrated.exhaust).toBe("stock");
    expect(migrated.rearAero).toBe("none");
  });
  it("creates four exhaust bores and a raised wing with supports", () => {
    const mesh = accessoryGeometry(model, {
      ...initial,
      exhaust: "quad",
      rearAero: "wing",
    });
    expect(mesh.filter((face) => face.group === "exhaust-bore")).toHaveLength(
      4,
    );
    expect(mesh.some((face) => face.group === "wing-mount")).toBe(true);
    expect(
      mesh.every((face) =>
        face.points.every((point) => point.every(Number.isFinite)),
      ),
    ).toBe(true);
  });
  it("changes caliper color and emits slotted brake geometry", () => {
    const mesh = accessoryGeometry(model, {
      ...initial,
      calipers: "red",
      discs: "slotted",
    });
    expect(mesh.find((face) => face.group === "caliper")?.color).toBe(
      "#ed454b",
    );
    expect(mesh.filter((face) => face.group === "disc-slots")).toHaveLength(32);
  });
  it("does not borrow a recording from another engine or year", () => {
    const recording = exhaustRecordingSchema.parse({
      id: "recording",
      label: "Fixture only",
      platform: "E90",
      model: "318i",
      engineCode: "N43",
      productionYear: 2011,
      configuration: "stock",
      scenario: "idle",
      exhaustSystem: "Stock",
      otherModifications: "None",
      source: "https://example.com/source",
      rights: "Test fixture",
      permission: {
        rightsHolder: "Test fixture owner",
        reference: "Test permission only",
        reviewedAt: "2026-01-01T00:00:00.000Z",
        publicDistribution: true,
      },
      recordingNotes: "Test only",
      audioPath: "/audio/test.mp3",
    });
    expect(recordingsForVehicle(vehicle, [recording])).toHaveLength(1);
    expect(
      recordingsForVehicle({ ...vehicle, engineCode: "N46" }, [recording]),
    ).toHaveLength(0);
    expect(
      recordingsForVehicle({ ...vehicle, productionYear: 2012 }, [recording]),
    ).toHaveLength(0);
    expect(recordingsForVehicle(vehicle)).toHaveLength(0);
  });
});
