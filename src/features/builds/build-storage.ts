import {
  type Build,
  type BuildInput,
  type BuildItem,
  type BuildItemInput,
  type BuildItemStatus,
  buildStatuses,
  buildInputSchema,
  buildItemInputSchema,
  buildItemSchema,
  buildSchema,
} from "@/features/builds/build-schema";

export const BUILD_STORAGE_KEY = "capcar.builds.v1";
export const BUILD_STORAGE_EVENT = "capcar:builds-changed";

const buildStateSchema = {
  parse(value: unknown) {
    if (!value || typeof value !== "object") return { builds: [], items: [] };
    const state = value as { builds?: unknown; items?: unknown };
    const builds = buildSchema.array().safeParse(state.builds);
    const items = buildItemSchema.array().safeParse(state.items);
    return {
      builds: builds.success ? builds.data : [],
      items: items.success ? items.data : [],
    };
  },
};

type StorageState = { builds: Build[]; items: BuildItem[] };
type ReadableStorage = Pick<Storage, "getItem">;
type WritableStorage = Pick<Storage, "getItem" | "setItem">;

export function readBuildState(storage: ReadableStorage): StorageState {
  const raw = storage.getItem(BUILD_STORAGE_KEY);
  if (!raw) return { builds: [], items: [] };
  try {
    return buildStateSchema.parse(JSON.parse(raw));
  } catch {
    return { builds: [], items: [] };
  }
}

function writeBuildState(state: StorageState, storage: WritableStorage) {
  storage.setItem(BUILD_STORAGE_KEY, JSON.stringify(state));
}

export function createBuild(
  input: BuildInput,
  storage: WritableStorage,
  options?: { id?: string; createdAt?: string },
) {
  const normalized = buildInputSchema.parse(input);
  const build = buildSchema.parse({
    ...normalized,
    id: options?.id ?? crypto.randomUUID(),
    createdAt: options?.createdAt ?? new Date().toISOString(),
  });
  const state = readBuildState(storage);
  writeBuildState({ ...state, builds: [build, ...state.builds] }, storage);
  return build;
}

export function createBuildItem(
  input: BuildItemInput,
  storage: WritableStorage,
  options?: { id?: string; createdAt?: string },
) {
  const normalized = buildItemInputSchema.parse(input);
  const item = buildItemSchema.parse({
    ...normalized,
    id: options?.id ?? crypto.randomUUID(),
    createdAt: options?.createdAt ?? new Date().toISOString(),
  });
  const state = readBuildState(storage);
  writeBuildState({ ...state, items: [...state.items, item] }, storage);
  return item;
}

export function updateBuildItemStatus(
  itemId: string,
  status: BuildItemStatus,
  storage: WritableStorage,
) {
  const state = readBuildState(storage);
  const items = state.items.map((item) =>
    item.id === itemId ? buildItemSchema.parse({ ...item, status }) : item,
  );
  writeBuildState({ ...state, items }, storage);
}

export function updateBuildStatus(
  buildId: string,
  status: (typeof buildStatuses)[number],
  storage: WritableStorage,
) {
  const state = readBuildState(storage);
  const builds = state.builds.map((build) =>
    build.id === buildId ? buildSchema.parse({ ...build, status }) : build,
  );
  writeBuildState({ ...state, builds }, storage);
}

export function getVehicleBuilds(vehicleId: string, storage: ReadableStorage) {
  return readBuildState(storage).builds.filter(
    (build) => build.vehicleId === vehicleId,
  );
}

export function getBuild(buildId: string, storage: ReadableStorage) {
  return readBuildState(storage).builds.find((build) => build.id === buildId);
}

export function getBuildItems(buildId: string, storage: ReadableStorage) {
  return readBuildState(storage).items.filter(
    (item) => item.buildId === buildId,
  );
}

export function createStealthRearBuild(
  vehicleId: string,
  storage: WritableStorage,
) {
  const build = createBuild(
    {
      vehicleId,
      name: "Stealth Rear",
      goal: "Appearance",
      description:
        "A darker, cleaner rear treatment that remains coherent with the original vehicle design.",
      budget: 1_200,
      status: "planning",
    },
    storage,
  );
  const items: BuildItemInput[] = [
    {
      buildId: build.id,
      title: "Maintenance baseline",
      note: "Confirm lights, wiring and existing body condition before buying parts.",
      stage: "foundation",
      priority: "now",
      estimatedCost: 0,
      status: "planned",
    },
    {
      buildId: build.id,
      title: "Dark rear-light concept",
      note: "Fitment and road legality still require verification.",
      stage: "appearance",
      priority: "next",
      estimatedCost: 320,
      status: "planned",
    },
    {
      buildId: build.id,
      title: "Gloss-black rear badges",
      stage: "appearance",
      priority: "later",
      estimatedCost: 65,
      status: "planned",
    },
    {
      buildId: build.id,
      title: "Rear diffuser concept",
      note: "Verify bumper compatibility before purchase.",
      stage: "appearance",
      priority: "later",
      estimatedCost: 420,
      status: "planned",
    },
  ];
  for (const item of items) createBuildItem(item, storage);
  return build;
}

export function announceBuildChange() {
  window.dispatchEvent(new Event(BUILD_STORAGE_EVENT));
}
