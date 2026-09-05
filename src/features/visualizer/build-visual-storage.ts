import {
  buildVisualSchema,
  type BuildVisual,
} from "@/features/visualizer/build-visual-schema";

export const BUILD_VISUAL_STORAGE_KEY = "capcar.build-visuals.v1";
export const BUILD_VISUAL_STORAGE_EVENT = "capcar:build-visuals-changed";

type ReadableStorage = Pick<Storage, "getItem">;
type WritableStorage = Pick<Storage, "getItem" | "setItem">;

export function readBuildVisuals(storage: ReadableStorage): BuildVisual[] {
  const raw = storage.getItem(BUILD_VISUAL_STORAGE_KEY);
  if (!raw) return [];
  try {
    const result = buildVisualSchema.array().safeParse(JSON.parse(raw));
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}

export function saveBuildVisual(
  input: Omit<BuildVisual, "updatedAt"> & { updatedAt?: string },
  storage: WritableStorage,
  now = new Date().toISOString(),
) {
  const visual = buildVisualSchema.parse({ ...input, updatedAt: now });
  const others = readBuildVisuals(storage).filter(
    (candidate) => candidate.buildId !== visual.buildId,
  );
  storage.setItem(
    BUILD_VISUAL_STORAGE_KEY,
    JSON.stringify([visual, ...others]),
  );
  return visual;
}

export function announceBuildVisualChange() {
  window.dispatchEvent(new Event(BUILD_VISUAL_STORAGE_EVENT));
}
