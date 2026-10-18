import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { buildVisualSchema, studioModelIds } from "./build-visual-schema";
import { carModels, getCarModel, matchCarModel } from "./car-model-catalog";

const expectedIds = [
  "audi-r8",
  "audi-tt",
  "bmw-m3-e30",
  "bmw-e36-m3",
  "bmw-320i",
  "datsun-280z",
  "ford-mustang",
  "honda-civic",
  "honda-nsx",
  "lamborghini-countach-lp500s",
  "mazda-rx-7-fc",
  "mazda-rx-7-fd",
  "mercedes-benz-190",
  "mercedes-300sl",
  "mercedes-gclass",
  "mini-cooper",
  "nissan-gt-r",
  "nissan-proto",
  "nissan-s14",
  "porsche-911-carrera",
  "porsche-911",
  "subaru-impreza",
  "toyota-ae86",
  "toyota-supra-mk",
  "volkswagen-beetle",
];

type AssetManifest = {
  sourceRepository: string;
  sourceCommit: string;
  models: {
    id: string;
    file: string;
    finalBytes: number;
    credit: {
      author: string;
      authorUrl: string;
      license: string;
      sourceUrl: string;
    };
  }[];
};

type GlbDocument = {
  buffers: { byteLength: number; uri?: string }[];
  bufferViews: { buffer: number; byteOffset?: number; byteLength: number }[];
  images?: { bufferView?: number; mimeType?: string; uri?: string }[];
  materials?: { name?: string }[];
  meshes?: { primitives: { attributes: { POSITION?: number } }[] }[];
  extensionsRequired?: string[];
};

const assetDirectory = join(process.cwd(), "public", "models", "cars");
const manifest = JSON.parse(
  readFileSync(join(assetDirectory, "manifest.json"), "utf8"),
) as AssetManifest;
const attribution = readFileSync(
  join(assetDirectory, "ATTRIBUTION.md"),
  "utf8",
);

function readGlb(file: string) {
  const bytes = readFileSync(join(assetDirectory, file));
  expect(bytes.toString("ascii", 0, 4)).toBe("glTF");
  expect(bytes.readUInt32LE(4)).toBe(2);
  expect(bytes.readUInt32LE(8)).toBe(bytes.length);
  expect(bytes.readUInt32LE(16)).toBe(0x4e4f534a);
  const jsonLength = bytes.readUInt32LE(12);
  const document = JSON.parse(
    bytes.toString("utf8", 20, 20 + jsonLength),
  ) as GlbDocument;
  const binaryHeader = 20 + jsonLength;
  expect(bytes.readUInt32LE(binaryHeader + 4)).toBe(0x004e4942);
  const binaryLength = bytes.readUInt32LE(binaryHeader);
  expect(binaryHeader + 8 + binaryLength).toBe(bytes.length);
  return { bytes, document, binaryLength };
}

describe("free Concept Studio car library", () => {
  it("contains the 25 distinct car assets supported by persisted garage selection", () => {
    const ids = carModels.map((car) => car.id);
    expect(ids).toHaveLength(25);
    expect(new Set(ids).size).toBe(25);
    expect(ids.toSorted()).toEqual(expectedIds.toSorted());
    expect([...studioModelIds].toSorted()).toEqual(expectedIds.toSorted());
    expect(manifest.models.map((model) => model.id).toSorted()).toEqual(
      expectedIds.toSorted(),
    );
    for (const id of ids) {
      expect(getCarModel(id)?.id).toBe(id);
      expect(buildVisualSchema.shape.studioModelId.safeParse(id).success).toBe(
        true,
      );
    }
    expect(getCarModel("missing-car")).toBeUndefined();
    expect(
      buildVisualSchema.shape.studioModelId.safeParse(
        "https://example.com/model.glb",
      ).success,
    ).toBe(false);
  });

  it("retains original source credits, commercial Creative Commons licenses and pinned asset provenance", () => {
    expect(manifest.sourceRepository).toBe(
      "https://github.com/pedrosoandre/carros",
    );
    expect(manifest.sourceCommit).toBe(
      "0a56de377f02f2574d781f6920fed08d6423ec2f",
    );
    expect(attribution).toContain(manifest.sourceCommit);
    expect(attribution).toContain("CC BY-SA 4.0");
    expect(attribution).toContain("Meshopt");
    expect(attribution).toContain("JPEG");
    for (const car of carModels) {
      const asset = manifest.models.find((model) => model.id === car.id);
      expect(asset).toBeDefined();
      expect(car.sourceUrl).toMatch(
        /^https:\/\/sketchfab\.com\/3d-models\/[a-f0-9]{32}$/,
      );
      expect(car.sourceUrl.endsWith(asset!.credit.sourceUrl.slice(-32))).toBe(
        true,
      );
      expect(car.authorUrl).toBe(asset!.credit.authorUrl);
      expect(car.license).toBe(
        asset!.credit.license.includes("ShareAlike")
          ? "CC BY-SA 4.0"
          : "CC BY 4.0",
      );
      expect(car.licenseUrl).toBe(
        car.license === "CC BY-SA 4.0"
          ? "https://creativecommons.org/licenses/by-sa/4.0/"
          : "https://creativecommons.org/licenses/by/4.0/",
      );
      expect(attribution).toContain(`${car.id}.glb`);
      expect(attribution).toContain(car.sourceUrl);
      expect(attribution).toContain(car.authorUrl);
      expect(attribution).toContain(car.licenseUrl);
      expect(car.years[0]).toBeLessThanOrEqual(car.years[1]);
      expect(car.notes.length).toBeGreaterThan(30);
    }
  });

  it.each(carModels)(
    "serves $id as a self-contained GLB without an external compression decoder",
    (car) => {
      expect(car.assetPath).toBe(`/models/cars/${car.id}.glb`);
      const { bytes, document, binaryLength } = readGlb(`${car.id}.glb`);
      const asset = manifest.models.find((model) => model.id === car.id)!;
      expect(car.bytes).toBe(asset.finalBytes);
      expect(car.bytes).toBe(bytes.length);
      expect(document.buffers).toHaveLength(1);
      expect(document.buffers[0].uri).toBeUndefined();
      expect(document.buffers[0].byteLength).toBeLessThanOrEqual(binaryLength);
      expect(document.meshes?.length).toBeGreaterThan(0);
      expect(
        document.meshes?.every((mesh) =>
          mesh.primitives.every(
            (primitive) => primitive.attributes.POSITION !== undefined,
          ),
        ),
      ).toBe(true);
      for (const view of document.bufferViews) {
        expect(view.buffer).toBe(0);
        expect((view.byteOffset ?? 0) + view.byteLength).toBeLessThanOrEqual(
          binaryLength,
        );
      }
      for (const image of document.images ?? []) {
        if (image.uri)
          expect(image.uri).toMatch(/^data:image\/(?:png|jpeg);base64,/);
        else {
          expect(image.bufferView).toBeDefined();
          expect(document.bufferViews[image.bufferView!]).toBeDefined();
          expect(["image/png", "image/jpeg"]).toContain(image.mimeType);
        }
      }
      for (const extension of document.extensionsRequired ?? []) {
        expect([
          "EXT_meshopt_compression",
          "KHR_draco_mesh_compression",
          "KHR_texture_basisu",
        ]).not.toContain(extension);
      }
      const materialNames = (document.materials ?? []).map(
        (material) => material.name,
      );
      for (const material of car.paintMaterials)
        expect(materialNames).toContain(material);
    },
  );
});

type MatchInput = Parameters<typeof matchCarModel>[0];
const bmw: MatchInput = {
  make: "BMW",
  model: "M3",
  platform: "E30",
  productionYear: 1990,
  bodyStyle: "Coupe",
};
const matchCases: { name: string; vehicle: MatchInput; id?: string }[] = [
  { name: "E30 M3 coupe", vehicle: bmw, id: "bmw-m3-e30" },
  {
    name: "E36 M3 coupe",
    vehicle: { ...bmw, model: "M3 E36", platform: "E36", productionYear: 1997 },
    id: "bmw-e36-m3",
  },
  {
    name: "wrong M3 generation",
    vehicle: { ...bmw, platform: "E90", productionYear: 2009 },
  },
  { name: "non-M E30 trim", vehicle: { ...bmw, model: "325i" } },
  {
    name: "unsupported convertible M3",
    vehicle: { ...bmw, bodyStyle: "Convertible" },
  },
  {
    name: "year outside generation",
    vehicle: { ...bmw, productionYear: 2019 },
  },
  { name: "invalid year", vehicle: { ...bmw, productionYear: Number.NaN } },
  {
    name: "year alone cannot guess M3 generation",
    vehicle: { ...bmw, platform: undefined },
  },
  {
    name: "generation embedded in an exact model name",
    vehicle: { ...bmw, model: "M3 E30", platform: undefined },
    id: "bmw-m3-e30",
  },
  {
    name: "contradictory embedded and explicit generations",
    vehicle: { ...bmw, model: "M3 E36" },
  },
  {
    name: "E90 320i sedan",
    vehicle: {
      make: "BMW",
      model: "320i",
      platform: "E90",
      productionYear: 2011,
      bodyStyle: "Sedan",
    },
    id: "bmw-320i",
  },
  {
    name: "E91 estate cannot use an E90 sedan",
    vehicle: {
      make: "BMW",
      model: "320i",
      platform: "E91",
      productionYear: 2011,
      bodyStyle: "Touring",
    },
  },
  {
    name: "RX-7 FC",
    vehicle: {
      make: "Mazda",
      model: "RX-7",
      platform: "FC3S",
      productionYear: 1990,
      bodyStyle: "Coupe",
    },
    id: "mazda-rx-7-fc",
  },
  {
    name: "RX-7 FD",
    vehicle: {
      make: "Mazda",
      model: "RX-7",
      platform: "FD3S",
      productionYear: 1995,
      bodyStyle: "Coupe",
    },
    id: "mazda-rx-7-fd",
  },
  {
    name: "RX-7 convertible cannot use the coupe",
    vehicle: {
      make: "Mazda",
      model: "RX-7",
      platform: "FC3C",
      productionYear: 1990,
      bodyStyle: "Convertible",
    },
  },
  {
    name: "R34 GT-R",
    vehicle: {
      make: "Nissan",
      model: "Skyline GT-R",
      platform: "BNR34",
      productionYear: 2001,
      bodyStyle: "Coupe",
    },
    id: "nissan-gt-r",
  },
  {
    name: "R35 is not an R34",
    vehicle: {
      make: "Nissan",
      model: "GT-R",
      platform: "R35",
      productionYear: 2012,
      bodyStyle: "Coupe",
    },
  },
  {
    name: "standard Skyline is not a GT-R",
    vehicle: {
      make: "Nissan",
      model: "Skyline",
      platform: "R34",
      productionYear: 2001,
      bodyStyle: "Coupe",
    },
  },
  {
    name: "TT Roadster",
    vehicle: {
      make: "Audi",
      model: "TT",
      platform: "8S",
      productionYear: 2015,
      bodyStyle: "Convertible",
    },
    id: "audi-tt",
  },
  {
    name: "TT coupe cannot use a Roadster",
    vehicle: {
      make: "Audi",
      model: "TT",
      platform: "8S",
      productionYear: 2015,
      bodyStyle: "Coupe",
    },
  },
  {
    name: "older TT generation",
    vehicle: {
      make: "Audi",
      model: "TT",
      platform: "8J",
      productionYear: 2010,
      bodyStyle: "Convertible",
    },
  },
  {
    name: "Civic EG6 hatchback",
    vehicle: {
      make: "Honda",
      model: "Civic",
      platform: "EG6",
      productionYear: 1993,
      bodyStyle: "Hatchback",
    },
    id: "honda-civic",
  },
  {
    name: "Civic sedan cannot use the hatchback",
    vehicle: {
      make: "Honda",
      model: "Civic",
      platform: "EG6",
      productionYear: 1993,
      bodyStyle: "Sedan",
    },
  },
  {
    name: "A80 Supra",
    vehicle: {
      make: "Toyota",
      model: "Supra",
      platform: "JZA80",
      productionYear: 1994,
      bodyStyle: "Coupe",
    },
    id: "toyota-supra-mk",
  },
  {
    name: "A90 Supra is not an A80",
    vehicle: {
      make: "Toyota",
      model: "Supra",
      platform: "A90",
      productionYear: 2020,
      bodyStyle: "Coupe",
    },
  },
  {
    name: "AE86 Trueno",
    vehicle: {
      make: "Toyota",
      model: "Sprinter Trueno",
      platform: "AE86",
      productionYear: 1985,
      bodyStyle: "Hatchback",
    },
    id: "toyota-ae86",
  },
  {
    name: "AE86 Levin has different headlights",
    vehicle: {
      make: "Toyota",
      model: "Corolla Levin",
      platform: "AE86",
      productionYear: 1985,
      bodyStyle: "Coupe",
    },
  },
  {
    name: "VW make and accented model alias",
    vehicle: {
      make: "VW",
      model: "Käfer",
      platform: "Type 1",
      productionYear: 1963,
      bodyStyle: "Coupe",
    },
    id: "volkswagen-beetle",
  },
  {
    name: "Mercedes make punctuation",
    vehicle: {
      make: "Mercedes Benz",
      model: "190E",
      platform: "W201",
      productionYear: 1988,
      bodyStyle: "Sedan",
    },
    id: "mercedes-benz-190",
  },
  {
    name: "rusted Mini is only a manual reference",
    vehicle: {
      make: "MINI",
      model: "Cooper S",
      platform: "R53",
      productionYear: 2005,
      bodyStyle: "Hatchback",
    },
  },
  {
    name: "tuned Subaru is only a manual reference",
    vehicle: {
      make: "Subaru",
      model: "Impreza WRX STI",
      platform: "GDB",
      productionYear: 2004,
      bodyStyle: "Sedan",
    },
  },
  {
    name: "unknown R8 generation is only a manual reference",
    vehicle: {
      make: "Audi",
      model: "R8",
      platform: "4S",
      productionYear: 2017,
      bodyStyle: "Coupe",
    },
  },
  {
    name: "production Z is not the Z Proto concept",
    vehicle: {
      make: "Nissan",
      model: "Z",
      platform: "RZ34",
      productionYear: 2023,
      bodyStyle: "Coupe",
    },
  },
];

describe("safe garage model matching", () => {
  it.each(matchCases)("$name", ({ vehicle, id }) => {
    expect(matchCarModel(vehicle)?.id).toBe(id);
  });
});
