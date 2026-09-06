export const interiorCameraNames = [
  "driver",
  "dashboard",
  "passenger",
  "rear",
] as const;

export type InteriorCameraName = (typeof interiorCameraNames)[number];
export type CameraVector = [number, number, number];
export type InteriorCamera = {
  position: CameraVector;
  target: CameraVector;
};
export type InteriorCameraPresets = Partial<
  Record<InteriorCameraName, InteriorCamera>
>;

export const defaultInteriorCameraPresets: Record<
  string,
  InteriorCameraPresets
> = {
  "683639e5ce0c477b882ed6311656d29d": {
    driver: {
      position: [0.19945758699512522, 0.2800138122878797, 0.7612965925970827],
      target: [0.0947198430361141, -0.32538411365701725, 0.4500162068083436],
    },
    dashboard: {
      position: [0.21057757122302553, -0.10138552833897979, 0.6041797473606006],
      target: [0.19763811945011495, -0.3689919709128543, 0.526341378172894],
    },
    passenger: {
      position: [-0.14209417758648463, 0.32823033794107154, 0.7690636013773514],
      target: [-0.10275254551159295, -0.11819079708082299, 0.5261597983975664],
    },
    rear: {
      position: [
        0.006155136842271284, 0.0035094719641908245, 0.7341926836621285,
      ],
      target: [0.021367128619959652, 0.2883696580276512, 0.6201597669857378],
    },
  },
};

function storageKey(modelUid: string) {
  return `capcar:interior-cameras:${modelUid}`;
}

function isVector(value: unknown): value is CameraVector {
  return (
    Array.isArray(value) &&
    value.length === 3 &&
    value.every((entry) => typeof entry === "number" && Number.isFinite(entry))
  );
}

function isCamera(value: unknown): value is InteriorCamera {
  if (!value || typeof value !== "object") return false;
  const camera = value as Partial<InteriorCamera>;
  return isVector(camera.position) && isVector(camera.target);
}

export function loadInteriorCameraPresets(
  modelUid: string,
  storage: Pick<Storage, "getItem">,
): InteriorCameraPresets {
  const defaults = defaultInteriorCameraPresets[modelUid] ?? {};
  try {
    const parsed: unknown = JSON.parse(
      storage.getItem(storageKey(modelUid)) ?? "{}",
    );
    if (!parsed || typeof parsed !== "object") return defaults;
    const saved = Object.fromEntries(
      interiorCameraNames.flatMap((name) => {
        const camera = (parsed as Record<string, unknown>)[name];
        return isCamera(camera) ? [[name, camera]] : [];
      }),
    );
    return { ...defaults, ...saved };
  } catch {
    return defaults;
  }
}

export function saveInteriorCameraPreset(
  modelUid: string,
  name: InteriorCameraName,
  camera: InteriorCamera,
  storage: Pick<Storage, "getItem" | "setItem">,
) {
  const presets = loadInteriorCameraPresets(modelUid, storage);
  const next = { ...presets, [name]: camera };
  storage.setItem(storageKey(modelUid), JSON.stringify(next));
  return next;
}
