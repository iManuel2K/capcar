import type { VehicleDataRequest } from "@/features/providers/provider-contracts";
import type {
  Vector3,
  VehicleModel,
  VehicleModelFace,
} from "@/features/visualizer/vehicle-model-schema";

type Dimensions = VehicleModel["dimensions"];

const platformDimensions: Record<string, Dimensions> = {
  E90: dimensions(4531, 1817, 1421, 2760, 1500, 1513, 632),
  E91: dimensions(4527, 1817, 1418, 2760, 1500, 1513, 632),
  F20: dimensions(4324, 1765, 1421, 2690, 1521, 1556, 632),
  F21: dimensions(4324, 1765, 1421, 2690, 1521, 1556, 632),
  F30: dimensions(4624, 1811, 1429, 2810, 1531, 1572, 650),
  F31: dimensions(4624, 1811, 1429, 2810, 1531, 1572, 650),
  F10: dimensions(4899, 1860, 1464, 2968, 1600, 1627, 660),
  F11: dimensions(4907, 1860, 1462, 2968, 1600, 1627, 660),
};

function dimensions(
  length: number,
  width: number,
  height: number,
  wheelbase: number,
  trackFront: number,
  trackRear: number,
  referenceWheelDiameter: number,
): Dimensions {
  return {
    length,
    width,
    height,
    wheelbase,
    trackFront,
    trackRear,
    referenceWheelDiameter,
  };
}

function fallbackDimensions(
  bodyStyle: VehicleDataRequest["bodyStyle"],
): Dimensions {
  if (bodyStyle === "SUV")
    return dimensions(4700, 1900, 1680, 2820, 1620, 1630, 720);
  if (bodyStyle === "Hatchback")
    return dimensions(4350, 1780, 1430, 2700, 1530, 1550, 640);
  return dimensions(4600, 1820, 1430, 2800, 1540, 1560, 650);
}

function buildReferenceMesh(modelDimensions: Dimensions) {
  const { length, width, height } = modelDimensions;
  const sections = [
    [-0.5, 0.34, 0.38, 0.54],
    [-0.4, 0.49, 0.27, 0.58],
    [-0.22, 0.48, 0.25, 0.68],
    [-0.08, 0.43, 0.25, 0.98],
    [0.22, 0.43, 0.25, 0.94],
    [0.39, 0.48, 0.26, 0.64],
    [0.5, 0.35, 0.35, 0.57],
  ] as const;
  const vertices: Vector3[] = sections.flatMap(
    ([z, halfWidth, lowerY, upperY]) => [
      [-width * halfWidth, height * lowerY, length * z],
      [width * halfWidth, height * lowerY, length * z],
      [-width * halfWidth, height * upperY, length * z],
      [width * halfWidth, height * upperY, length * z],
    ],
  );
  const faces: VehicleModelFace[] = [];
  for (let index = 0; index < sections.length - 1; index += 1) {
    const current = index * 4;
    const next = (index + 1) * 4;
    const roofMaterial = index >= 2 && index <= 3 ? "glass" : "body";
    const sideMaterial = index >= 2 && index <= 3 ? "glass" : "body";
    faces.push(
      {
        indices: [current, next, next + 2, current + 2],
        material: sideMaterial,
      },
      {
        indices: [current + 1, current + 3, next + 3, next + 1],
        material: sideMaterial,
      },
      {
        indices: [current + 2, next + 2, next + 3, current + 3],
        material: roofMaterial,
      },
      { indices: [current, current + 1, next + 1, next], material: "trim" },
    );
  }
  faces.push(
    { indices: [0, 2, 3, 1], material: "light-front" },
    {
      indices: [
        vertices.length - 4,
        vertices.length - 3,
        vertices.length - 1,
        vertices.length - 2,
      ],
      material: "light-rear",
    },
  );
  return { vertices, faces };
}

export function createReferenceVehicleModel(
  vehicle: VehicleDataRequest,
): VehicleModel {
  const platform = vehicle.platform.toUpperCase();
  const selected = platformDimensions[platform];
  const modelDimensions = selected ?? fallbackDimensions(vehicle.bodyStyle);
  const mesh = buildReferenceMesh(modelDimensions);
  return {
    provider: "Capcar reference geometry",
    source: "demo",
    accuracy: "concept",
    assetId: `reference-${platform.toLowerCase()}-${vehicle.bodyStyle.toLowerCase()}`,
    vehicleKey: `${vehicle.productionYear}-${vehicle.make}-${vehicle.model}-${platform}`,
    revision: "2026.09",
    coordinateUnit: "mm",
    dimensions: modelDimensions,
    ...mesh,
    mappedSlots: [
      "paint",
      "front-wheels",
      "rear-wheels",
      "stance",
      "lighting",
      "aero",
    ],
    license: {
      commercialUse: false,
      attribution: "Capcar-generated reference geometry",
    },
    warnings: [
      selected
        ? "Platform reference dimensions are present but have not been verified against a licensed asset."
        : "Generic body-style dimensions are being used for this platform.",
      "Body surfaces and modification geometry are conceptual, not fitment evidence.",
    ],
  };
}
