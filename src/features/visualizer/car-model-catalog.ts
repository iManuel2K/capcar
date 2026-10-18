/**
 * Downloadable creator models, available equally in the public studio and garage.
 * Source assets: pedrosoandre/carros@0a56de377f02f2574d781f6920fed08d6423ec2f.
 * Original Sketchfab licenses and creator descriptions checked 2026-10-18.
 * These are visual references, never dimensional or part-fitment evidence.
 */
export type CarModel = {
  id: string;
  name: string;
  make: string;
  model: string;
  platforms: string[];
  years: [number, number];
  sourceUrl: string;
  author: string;
  authorUrl: string;
  license: "CC BY 4.0" | "CC BY-SA 4.0";
  licenseUrl: string;
  assetPath: `/models/cars/${string}.glb`;
  paintMaterials: string[];
  notes: string;
  bytes: number;
  rotationY?: number;
  excludedMaterialNames?: string[];
};

type ModelDefinition = Omit<
  CarModel,
  "sourceUrl" | "assetPath" | "license" | "licenseUrl"
> & {
  sourceId: string;
  shareAlike?: boolean;
};

function defineCar({
  sourceId,
  shareAlike = false,
  ...model
}: ModelDefinition): CarModel {
  return {
    ...model,
    sourceUrl: `https://sketchfab.com/3d-models/${sourceId}`,
    assetPath: `/models/cars/${model.id}.glb`,
    license: shareAlike ? "CC BY-SA 4.0" : "CC BY 4.0",
    licenseUrl: shareAlike
      ? "https://creativecommons.org/licenses/by-sa/4.0/"
      : "https://creativecommons.org/licenses/by/4.0/",
  };
}

const lex = {
  author: "Lexyc16",
  authorUrl: "https://sketchfab.com/Lexyc16",
};
const martin = {
  author: "Martin Trafas",
  authorUrl: "https://sketchfab.com/TinoD2",
};
const wallon = {
  author: "wallon",
  authorUrl: "https://sketchfab.com/realwallon",
};

export const carModels: CarModel[] = [
  defineCar({
    id: "audi-r8",
    name: "Audi R8",
    make: "Audi",
    model: "R8",
    platforms: [],
    years: [2006, 2024],
    sourceId: "e17e438f076f4427a58d93aa779edaed",
    ...wallon,
    paintMaterials: [],
    bytes: 3715692,
    notes:
      "Creator-built R8 reference. Generation and trim are not documented; choose this model manually.",
  }),
  defineCar({
    id: "audi-tt",
    name: "Audi TT Roadster · 2015",
    make: "Audi",
    model: "TT Roadster",
    platforms: ["8S", "FV"],
    years: [2015, 2023],
    sourceId: "80cc29628e1b407d8e14d5ae0710f6fe",
    author: "razor24",
    authorUrl: "https://sketchfab.com/razor24",
    paintMaterials: [],
    bytes: 1122528,
    notes:
      "2015 third-generation convertible reference. It does not represent the TT Coupe or earlier 8N/8J generations.",
  }),
  defineCar({
    id: "bmw-m3-e30",
    name: "BMW M3 · E30",
    make: "BMW",
    model: "M3",
    platforms: ["E30"],
    years: [1986, 1991],
    sourceId: "ac3c7013434e403e8faff87948caf422",
    ...martin,
    paintMaterials: ["BMW_E30_M3_PAINT"],
    bytes: 4600692,
    notes:
      "E30 M3 coupe reference, with its M-specific arches and bodywork. Other E30 trims have different bodywork.",
  }),
  defineCar({
    id: "bmw-e36-m3",
    excludedMaterialNames: ["Scene"],
    name: "BMW M3 · E36",
    make: "BMW",
    model: "M3",
    platforms: ["E36"],
    years: [1992, 1999],
    sourceId: "762b90efd3dc413cb61c3e3c8097b8ac",
    ...martin,
    paintMaterials: ["CarPaint"],
    bytes: 2224104,
    notes:
      "E36 M3 coupe reference. Sedan, Touring and convertible body styles are not represented.",
  }),
  defineCar({
    id: "bmw-320i",
    name: "BMW 320i · E90",
    make: "BMW",
    model: "320i",
    platforms: ["E90"],
    years: [2005, 2012],
    sourceId: "28f0bc2f0083417a8e521150529034d6",
    author: "rifdanzz",
    authorUrl: "https://sketchfab.com/rifdanzz",
    paintMaterials: [],
    bytes: 766576,
    notes:
      "Low-poly E90 320i sedan reference. Facelift details are approximate; it does not represent E91, E92 or E93 bodies.",
  }),
  defineCar({
    id: "datsun-280z",
    name: "Datsun 280Z · S30",
    make: "Datsun",
    model: "280Z",
    platforms: ["S30"],
    years: [1975, 1978],
    sourceId: "0789ab2ece9442de94b3c41595e0ecbd",
    ...martin,
    paintMaterials: ["280z_CarPaint"],
    bytes: 4918336,
    notes:
      "S30 280Z coupe reference. 240Z, 260Z and later 280ZX bodywork are not interchangeable with this model.",
  }),
  defineCar({
    id: "ford-mustang",
    name: "Ford Mustang Shelby GT500",
    make: "Ford",
    model: "Mustang Shelby GT500",
    platforms: [],
    years: [1967, 2022],
    sourceId: "0eaa7a16796540f29461ddae05ecdeb3",
    author: "Jiaxing",
    authorUrl: "https://sketchfab.com/saitoyang",
    paintMaterials: ["carpaint"],
    bytes: 4262028,
    notes:
      "Creator-built Shelby GT500 reference with an unfinished interior. The exact model year is not documented; select manually.",
  }),
  defineCar({
    id: "honda-civic",
    name: "Honda Civic SiR · EG6",
    make: "Honda",
    model: "Civic SiR",
    platforms: ["EG6"],
    years: [1991, 1995],
    sourceId: "f81da34570b145deb463fa091604d251",
    author: "rifdanzz",
    authorUrl: "https://sketchfab.com/rifdanzz",
    paintMaterials: ["Car_Paint"],
    bytes: 250560,
    notes:
      "Low-poly 1991 EG6 hatchback reference. Sedan, coupe and later Civic generations are not represented.",
  }),
  defineCar({
    id: "honda-nsx",
    name: "Honda NSX · NA1",
    make: "Honda",
    model: "NSX",
    platforms: ["NA1"],
    years: [1990, 2001],
    sourceId: "1cc15628a00a4739a6b6c01128927c8d",
    ...lex,
    paintMaterials: [],
    bytes: 1012988,
    notes:
      "1990 pop-up-headlight coupe reference. Facelift, NSX-T, NA2 and later NC1 body variants are not represented.",
  }),
  defineCar({
    id: "lamborghini-countach-lp500s",
    rotationY: Math.PI,
    name: "Lamborghini Countach · LP500S",
    make: "Lamborghini",
    model: "Countach LP500S",
    platforms: ["LP500S"],
    years: [1982, 1985],
    sourceId: "32e9ee8d129e4c2992e1753b4fc3094c",
    author: "SDC PERFORMANCE™️; rims by Lexyc16",
    authorUrl: "https://sketchfab.com/Lambo_SC04",
    paintMaterials: [],
    bytes: 1439752,
    notes:
      "LP500S reference by SDC PERFORMANCE, with rims credited to Lexyc16. LP400, 5000QV and Anniversary versions differ.",
  }),
  defineCar({
    id: "mazda-rx-7-fc",
    name: "Mazda RX-7 · FC",
    make: "Mazda",
    model: "RX-7",
    platforms: ["FC", "FC3S"],
    years: [1985, 1992],
    sourceId: "8ac0df459f514950ab83ac37109a06ab",
    ...lex,
    paintMaterials: [],
    bytes: 1131928,
    notes:
      "Second-generation FC coupe reference. The convertible FC3C and later FD use different bodies.",
  }),
  defineCar({
    id: "mazda-rx-7-fd",
    name: "Mazda RX-7 · FD",
    make: "Mazda",
    model: "RX-7",
    platforms: ["FD", "FD3S"],
    years: [1991, 2002],
    sourceId: "d35ff630df614771b82e7b2f59035b1e",
    ...lex,
    paintMaterials: [],
    bytes: 1333848,
    notes:
      "Third-generation FD coupe reference. Market, facelift and trim details can differ from an individual vehicle.",
  }),
  defineCar({
    id: "mercedes-benz-190",
    name: "Mercedes-Benz 190 · W201",
    make: "Mercedes-Benz",
    model: "190",
    platforms: ["W201"],
    years: [1982, 1993],
    sourceId: "f379fc4d8efb4754abbab933b4c94e3d",
    ...wallon,
    paintMaterials: [],
    bytes: 195152,
    notes:
      "Pixel-textured W201 sedan reference. Sport trims and Evolution bodywork are not represented; the original textured finish is preserved.",
  }),
  defineCar({
    id: "mercedes-300sl",
    name: "Mercedes-Benz 300 SL Gullwing",
    make: "Mercedes-Benz",
    model: "300 SL",
    platforms: ["W198", "W198I"],
    years: [1954, 1957],
    sourceId: "505241c829c540a4921533000736904e",
    ...lex,
    paintMaterials: [],
    bytes: 877072,
    notes:
      "W198 gullwing coupe reference. It does not represent the later 300 SL Roadster or modern SL generations.",
  }),
  defineCar({
    id: "mercedes-gclass",
    name: "Mercedes-Benz G-Class",
    make: "Mercedes-Benz",
    model: "G-Class",
    platforms: [],
    years: [1979, 2018],
    sourceId: "1a2a52b16cad4e618af347461817895c",
    ...lex,
    paintMaterials: [],
    bytes: 581184,
    notes:
      "Classic box-body G-Class reference. The creator labels it W263, so an exact chassis/trim match is not claimed; select manually.",
  }),
  defineCar({
    id: "mini-cooper",
    rotationY: Math.PI,
    name: "MINI Cooper S · weathered",
    make: "MINI",
    model: "Cooper S",
    platforms: [],
    years: [1963, 2024],
    sourceId: "b262744901a04cda823f17289d1a4847",
    author: "cenobyte",
    authorUrl: "https://sketchfab.com/cenobyte",
    paintMaterials: [],
    bytes: 3845304,
    notes:
      "Artist's intentionally damaged and rusted Cooper S. Generation is not documented; this is a manually selected styling reference.",
  }),
  defineCar({
    id: "nissan-gt-r",
    name: "Nissan Skyline GT-R · R34",
    make: "Nissan",
    model: "Skyline GT-R",
    platforms: ["R34", "BNR34"],
    years: [1999, 2002],
    sourceId: "ff8fb2251dfa4bb9979e7022c5a6666c",
    ...lex,
    paintMaterials: [],
    bytes: 1278372,
    notes:
      "R34 GT-R coupe reference. This is not an R35 GT-R or a standard R34 sedan. The creator notes some geometry imperfections.",
  }),
  defineCar({
    id: "nissan-proto",
    name: "Nissan Z Proto · concept",
    make: "Nissan",
    model: "Z Proto",
    platforms: ["ZPROTO"],
    years: [2020, 2021],
    sourceId: "db9a5f7ae9d84a0fb01cac96afe3e69c",
    ...lex,
    paintMaterials: [],
    bytes: 660736,
    notes:
      "Z Proto show-car reference, introduced in 2020. It is not an exact model of the later production RZ34 Nissan Z.",
  }),
  defineCar({
    id: "nissan-s14",
    name: "Nissan Silvia / 200SX · S14",
    make: "Nissan",
    model: "Silvia / 200SX",
    platforms: ["S14"],
    years: [1993, 1998],
    sourceId: "f2a917a924734a89a020e7f970e55e7c",
    ...lex,
    paintMaterials: [],
    bytes: 919488,
    notes:
      "Low-poly S14 coupe reference. Market and facelift details may differ; S13 and S15 bodies are not represented.",
  }),
  defineCar({
    id: "porsche-911-carrera",
    name: "Porsche 911 Carrera 4S",
    make: "Porsche",
    model: "911 Carrera 4S",
    platforms: [],
    years: [1995, 2024],
    sourceId: "d01b254483794de3819786d93e0e1ebf",
    shareAlike: true,
    author: "Lionsharp Studios",
    authorUrl: "https://sketchfab.com/lionsharp",
    paintMaterials: ["paint"],
    bytes: 5478552,
    notes:
      "Creator's WebGL-configurator model. Exact generation is not documented; select manually. Asset adaptations remain CC BY-SA 4.0.",
  }),
  defineCar({
    id: "porsche-911",
    name: "Porsche 911 Turbo · 930",
    make: "Porsche",
    model: "911 Turbo",
    platforms: ["930"],
    years: [1975, 1989],
    sourceId: "de1ffd344c41481892511f7fd332c136",
    ...lex,
    paintMaterials: [],
    bytes: 1121852,
    notes:
      "1975 930 Turbo reference. Later engines, bumpers and wheel specifications differ; later 911 generations are not represented.",
  }),
  defineCar({
    id: "subaru-impreza",
    name: "Subaru Impreza WRX STI · 2004 custom",
    make: "Subaru",
    model: "Impreza WRX STI",
    platforms: ["GD", "GDB"],
    years: [2004, 2005],
    sourceId: "08296bc950364621b6174a3078bb19e0",
    author: "MAC ULT ARTS",
    authorUrl: "https://sketchfab.com/MACULTARTS",
    paintMaterials: ["Car_Paint"],
    bytes: 1158668,
    notes:
      "Creator's tuned 2004 STI sedan. Existing modifications are part of this model; it is not a factory-stock or wagon representation.",
  }),
  defineCar({
    id: "toyota-ae86",
    name: "Toyota Sprinter Trueno · AE86",
    make: "Toyota",
    model: "Sprinter Trueno",
    platforms: ["AE86"],
    years: [1983, 1987],
    sourceId: "fe02fba6302e450ea8424591493341ea",
    ...lex,
    paintMaterials: [],
    bytes: 1213648,
    notes:
      "Initial D-inspired AE86 Trueno liftback. Levin fixed-headlight and two-door coupe bodies are not represented.",
  }),
  defineCar({
    id: "toyota-supra-mk",
    name: "Toyota Supra · A80",
    make: "Toyota",
    model: "Supra",
    platforms: ["A80", "JZA80"],
    years: [1993, 2002],
    sourceId: "eb9bb1eb41db431cb078088ae1ce45f8",
    ...martin,
    paintMaterials: ["TOYOTA_SUPRA_CAR_PAINT"],
    bytes: 5146544,
    notes:
      "1994 Mk IV / A80 Supra reference. Market and facelift details may differ; A70 and A90 generations are not represented.",
  }),
  defineCar({
    id: "volkswagen-beetle",
    name: "Volkswagen Beetle · 1963",
    make: "Volkswagen",
    model: "Beetle",
    platforms: ["TYPE1", "TYP1"],
    years: [1963, 1963],
    sourceId: "f03e5ba5e81b4562958645fe27565f3a",
    author: "aleksey.matveenko",
    authorUrl: "https://sketchfab.com/aleksey.matveenko",
    paintMaterials: [],
    bytes: 1819396,
    notes:
      "Artist's 1963 Type 1 texturing project. Other classic Beetle years, New Beetle and A5 Beetle bodies differ.",
  }),
];

export function getCarModel(id: string): CarModel | undefined {
  return carModels.find((model) => model.id === id);
}

type VehicleIdentity = {
  make: string;
  model: string;
  platform?: string;
  productionYear?: number;
  bodyStyle?: string;
};

type MatchRule = { aliases: string[]; bodyStyles: string[] };

// A platform match alone must never turn a normal trim into an M/GT-R/STI model.
// Undocumented generations and artist-altered models stay manually selectable.
const matchRules: Record<string, MatchRule> = {
  "audi-tt": { aliases: ["TT", "TT Roadster"], bodyStyles: ["Convertible"] },
  "bmw-m3-e30": { aliases: ["M3"], bodyStyles: ["Coupe"] },
  "bmw-e36-m3": { aliases: ["M3"], bodyStyles: ["Coupe"] },
  "bmw-320i": { aliases: ["320i", "3 Series 320i"], bodyStyles: ["Sedan"] },
  "datsun-280z": { aliases: ["280Z"], bodyStyles: ["Coupe"] },
  "honda-civic": {
    aliases: ["Civic", "Civic SiR", "Civic SiR II", "Civic VTi"],
    bodyStyles: ["Hatchback"],
  },
  "honda-nsx": { aliases: ["NSX"], bodyStyles: ["Coupe"] },
  "lamborghini-countach-lp500s": {
    aliases: ["Countach LP500S", "Countach LP 500 S"],
    bodyStyles: ["Coupe"],
  },
  "mazda-rx-7-fc": { aliases: ["RX-7", "RX7"], bodyStyles: ["Coupe"] },
  "mazda-rx-7-fd": { aliases: ["RX-7", "RX7"], bodyStyles: ["Coupe"] },
  "mercedes-benz-190": {
    aliases: ["190", "190 E", "190E", "190 D", "190D"],
    bodyStyles: ["Sedan"],
  },
  "mercedes-300sl": {
    aliases: ["300 SL", "300SL", "300 SL Gullwing"],
    bodyStyles: ["Coupe"],
  },
  "nissan-gt-r": {
    aliases: ["Skyline GT-R", "Skyline GTR", "GT-R", "GTR"],
    bodyStyles: ["Coupe"],
  },
  "nissan-s14": {
    aliases: ["Silvia", "200SX", "240SX"],
    bodyStyles: ["Coupe"],
  },
  "porsche-911": {
    aliases: ["911 Turbo", "930 Turbo", "930"],
    bodyStyles: ["Coupe"],
  },
  "toyota-ae86": {
    aliases: ["Sprinter Trueno", "Corolla Trueno", "Trueno"],
    bodyStyles: ["Hatchback", "Coupe"],
  },
  "toyota-supra-mk": {
    aliases: ["Supra", "Supra Mk IV", "Supra Mk4"],
    bodyStyles: ["Coupe"],
  },
  "volkswagen-beetle": {
    aliases: ["Beetle", "Type 1", "Kafer", "Käfer"],
    bodyStyles: ["Coupe"],
  },
};

function normalize(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function normalizeMake(value: string) {
  const make = normalize(value);
  if (make === "vw") return "volkswagen";
  if (make === "mercedes" || make === "benz") return "mercedesbenz";
  return make;
}

/**
 * Safe automatic garage matching: require a known generation/chassis, matching
 * trim, compatible year and (when supplied) the correct body style. A broad name
 * such as "M3" or "RX-7" and a year alone never picks a generation silently.
 */
export function matchCarModel(vehicle: VehicleIdentity): CarModel | undefined {
  const make = normalizeMake(vehicle.make);
  const inputModel = normalize(vehicle.model);
  const explicitPlatform = vehicle.platform?.trim();
  const platform = explicitPlatform ? normalize(explicitPlatform) : undefined;
  const matches = carModels.filter((car) => {
    const rule = matchRules[car.id];
    if (!rule || normalizeMake(car.make) !== make) return false;
    if (
      vehicle.productionYear !== undefined &&
      (!Number.isInteger(vehicle.productionYear) ||
        vehicle.productionYear < car.years[0] ||
        vehicle.productionYear > car.years[1])
    )
      return false;
    if (
      vehicle.bodyStyle &&
      !rule.bodyStyles.some(
        (body) => normalize(body) === normalize(vehicle.bodyStyle!),
      )
    )
      return false;

    const platforms = car.platforms.map(normalize);
    if (platform && !platforms.includes(platform)) return false;
    return rule.aliases.some((alias) => {
      const model = normalize(alias);
      if (platform)
        return (
          inputModel === model ||
          platforms.some(
            (code) =>
              inputModel === `${model}${code}` ||
              inputModel === `${code}${model}`,
          )
        );
      // An embedded generation is acceptable only with an exact known model name.
      return platforms.some(
        (code) =>
          inputModel === `${model}${code}` || inputModel === `${code}${model}`,
      );
    });
  });
  return matches.length === 1 ? matches[0] : undefined;
}
