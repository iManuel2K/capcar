import { z } from "zod";
import { vehicleInputSchema } from "@/features/vehicles/vehicle-schema";
import {
  findVehicle,
  readVehicles,
  saveVehicle,
  updateVehicle,
} from "@/features/vehicles/vehicle-storage";
import {
  createStarterBuild,
  readBuildState,
} from "@/features/builds/build-storage";
import { passportPhotoSchema } from "@/features/passport/passport-photo";

export const ONBOARDING_KEY = "capcar.onboarding.v1";
export const ONBOARDING_EVENT = "capcar:onboarding-changed";
const goalSchema = z.enum(["maintain", "modify", "drives"]);
export type GarageGoal = z.infer<typeof goalSchema>;
export const onboardingDraftSchema = z.object({
  id: z.string().uuid(),
  startedAt: z.number(),
  step: z.enum(["car", "goal", "action", "save"]),
  make: z.string().max(40),
  model: z.string().max(40),
  productionYear: z.string().max(4),
  platform: z.string().max(12),
  engineCode: z.string().max(20),
  mileage: z.string().max(7),
  goal: goalSchema.optional(),
  title: z.string().max(100),
  estimate: z.string().max(12),
  photo: passportPhotoSchema.optional(),
  existingVehicleId: z.string().max(200).optional(),
  skipAction: z.boolean().default(false),
});
export type OnboardingDraft = z.infer<typeof onboardingDraftSchema>;
const recordSchema = z.object({
  id: z.string().uuid(),
  vehicleId: z.string().min(1),
  goal: goalSchema.optional(),
  driveIdea: z.string().max(100).optional(),
  destination: z.string().max(500).optional(),
  activatedAt: z.iso.datetime().optional(),
  startedAt: z.number(),
});
type Writer = Pick<Storage, "getItem" | "setItem">;
export function readOnboarding(storage: Pick<Storage, "getItem">) {
  try {
    return recordSchema
      .array()
      .parse(JSON.parse(storage.getItem(ONBOARDING_KEY) ?? "[]"));
  } catch {
    return [];
  }
}
export function emptyOnboardingDraft(now = Date.now()): OnboardingDraft {
  return {
    id: crypto.randomUUID(),
    startedAt: now,
    step: "car",
    make: "",
    model: "",
    productionYear: "",
    platform: "",
    engineCode: "",
    mileage: "",
    title: "",
    estimate: "",
    skipAction: false,
  };
}
export function draftKey(userId: string | null) {
  return `capcar.onboarding-draft.v1:${userId || "guest"}`;
}
export function readOnboardingDraft(
  storage: Pick<Storage, "getItem"> & Partial<Pick<Storage, "removeItem">>,
  userId: string | null,
  now = Date.now(),
) {
  try {
    const draft = onboardingDraftSchema.parse(
      JSON.parse(storage.getItem(draftKey(userId)) ?? "null"),
    );
    if (now >= draft.startedAt && now - draft.startedAt < 7 * 86400000)
      return draft;
    storage.removeItem?.(draftKey(userId));
    return undefined;
  } catch {
    return undefined;
  }
}
export function onboardingVehicleInput(draft: OnboardingDraft) {
  return vehicleInputSchema.parse({
    make: draft.make,
    model: draft.model,
    productionYear: draft.productionYear,
    platform: draft.platform || "UNKNOWN",
    engineCode: draft.engineCode || "UNKNOWN",
    bodyStyle: "Unknown",
    transmission: "Unknown",
    mileage: draft.mileage || 0,
    mileageKnown: draft.mileage !== "",
    photoDataUrl: draft.photo,
    garageGoal: draft.goal,
    onboardingId: draft.id,
  });
}

export function saveOnboarding(
  draftInput: OnboardingDraft,
  storage: Writer,
  labels: { name: string; description: string },
  now = new Date().toISOString(),
) {
  const draft = onboardingDraftSchema.parse(draftInput);
  if (
    draft.goal &&
    !draft.skipAction &&
    (draft.title.trim().length < 2 ||
      (draft.estimate !== "" &&
        (!/^\d+$/.test(draft.estimate) || Number(draft.estimate) > 1000000)))
  )
    throw new Error("action");
  const records = readOnboarding(storage);
  const previous = records.find((record) => record.id === draft.id);
  let vehicle = draft.existingVehicleId
    ? findVehicle(draft.existingVehicleId, storage)
    : readVehicles(storage).find((entry) => entry.onboardingId === draft.id);
  if (draft.existingVehicleId && !vehicle) throw new Error("missing");
  const carAdded = !vehicle;
  if (!vehicle) vehicle = saveVehicle(onboardingVehicleInput(draft), storage);
  if (draft.goal && vehicle.garageGoal !== draft.goal)
    vehicle = updateVehicle(
      vehicle.id,
      { ...vehicle, garageGoal: draft.goal },
      storage,
    );
  const useful = Boolean(
    draft.goal && !draft.skipAction && draft.title.trim().length >= 2,
  );
  let destination = `/garage/${vehicle.id}`;
  if (useful && draft.goal !== "drives") {
    const state = readBuildState(storage);
    let build = state.builds.find((entry) => entry.onboardingId === draft.id);
    if (!build) {
      build = createStarterBuild(
        {
          vehicleId: vehicle.id,
          name: labels.name,
          description: labels.description,
          goal: "OEM+ daily",
          budget: 0,
          status: "planning",
        },
        {
          title: draft.title.trim(),
          estimatedCost: draft.estimate === "" ? 0 : Number(draft.estimate),
          estimatedCostKnown: draft.estimate !== "",
          stage: draft.goal === "maintain" ? "foundation" : "appearance",
          kind: draft.goal === "maintain" ? "maintenance" : "modification",
          priority: "now",
          status: "planned",
        },
        storage,
        { onboardingId: draft.id },
      );
    }
    destination = `/garage/${vehicle.id}/builds/${build.id}`;
  }
  const activatedAt = previous?.activatedAt ?? (useful ? now : undefined);
  const record = recordSchema.parse({
    id: draft.id,
    vehicleId: vehicle.id,
    goal: draft.goal,
    driveIdea:
      useful && draft.goal === "drives" ? draft.title.trim() : undefined,
    destination,
    activatedAt,
    startedAt: draft.startedAt,
  });
  storage.setItem(
    ONBOARDING_KEY,
    JSON.stringify([
      record,
      ...records.filter((entry) => entry.id !== draft.id),
    ]),
  );
  return {
    vehicle,
    record,
    carAdded,
    newlyActivated: Boolean(
      activatedAt &&
      !records.some(
        (entry) => entry.vehicleId === vehicle.id && entry.activatedAt,
      ),
    ),
  };
}
