import {
  roadbookVisitRecordSchema,
  type RoadbookVisitRecord,
} from "@/features/roadbook/roadbook-schema";

export const ROADBOOK_VISITS_STORAGE_KEY = "capcar.roadbook-visits.v1";
export const ROADBOOK_VISITS_STORAGE_EVENT = "capcar:roadbook-visits-changed";

type ReadableStorage = Pick<Storage, "getItem">;
type WritableStorage = Pick<Storage, "getItem" | "setItem">;

export function readRoadbookVisits(storage: ReadableStorage) {
  const raw = storage.getItem(ROADBOOK_VISITS_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    const result = roadbookVisitRecordSchema.array().safeParse(parsed);
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}

export function saveRoadbookVisit(
  input: RoadbookVisitRecord,
  storage: WritableStorage,
) {
  const visit = roadbookVisitRecordSchema.parse(input);
  const current = readRoadbookVisits(storage);
  storage.setItem(
    ROADBOOK_VISITS_STORAGE_KEY,
    JSON.stringify([visit, ...current.filter((item) => item.id !== visit.id)]),
  );
  window.dispatchEvent(new Event(ROADBOOK_VISITS_STORAGE_EVENT));
  return visit;
}
