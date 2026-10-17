import { z } from "zod";
import { isJournalSlug } from "./routes";
import type { AppLocale } from "@/i18n/config";

export const JOURNAL_CHECKLIST_KEY = "capcar.journal-checklists.v1";
export const JOURNAL_CHECKLIST_EVENT = "capcar:journal-checklists-changed";
export const JOURNAL_DRAFT_KEY = "capcar.journal-pending.v1";
const validSlug = z.string().refine(isJournalSlug);
export const checklistInputSchema = z.object({
  title: z.string().trim().min(2).max(120),
  notes: z.string().max(1500),
  checked: z.string().max(80).array().max(12),
});
export type ChecklistInput = z.infer<typeof checklistInputSchema>;
const recordSchema = checklistInputSchema.extend({
  articleSlug: validSlug,
  vehicleId: z.string().min(1).max(200),
  updatedAt: z.iso.datetime(),
});
export type JournalChecklistRecord = z.infer<typeof recordSchema>;
type StorageReader = Pick<Storage, "getItem">;
type StorageWriter = Pick<Storage, "getItem" | "setItem">;

export function readJournalChecklists(storage: StorageReader) {
  try {
    const result = recordSchema
      .array()
      .safeParse(JSON.parse(storage.getItem(JOURNAL_CHECKLIST_KEY) ?? "[]"));
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}

export function saveJournalChecklist(
  input: Omit<JournalChecklistRecord, "updatedAt">,
  storage: StorageWriter,
  vehicleIds: string[],
) {
  const record = recordSchema.parse({
    ...input,
    updatedAt: new Date().toISOString(),
  });
  if (!vehicleIds.includes(record.vehicleId)) throw new Error("vehicle");
  const records = readJournalChecklists(storage);
  storage.setItem(
    JOURNAL_CHECKLIST_KEY,
    JSON.stringify([
      record,
      ...records.filter(
        (item) =>
          item.vehicleId !== record.vehicleId ||
          item.articleSlug !== record.articleSlug,
      ),
    ]),
  );
  return record;
}

// Unassigned drafts stay on this browser for one day. Import requires an explicit
// save against a selected vehicle after the account boundary has finished syncing.
export function readJournalDraft(
  slug: string,
  storage: StorageReader & Partial<Pick<Storage, "removeItem">>,
  now = Date.now(),
): ChecklistInput | undefined {
  try {
    const draft = z
      .object({
        articleSlug: validSlug,
        savedAt: z.number(),
        data: checklistInputSchema,
      })
      .parse(JSON.parse(storage.getItem(JOURNAL_DRAFT_KEY) ?? "null"));
    if (now - draft.savedAt > 86_400_000 || draft.savedAt > now) {
      storage.removeItem?.(JOURNAL_DRAFT_KEY);
      return;
    }
    if (draft.articleSlug !== slug) return;
    return draft.data;
  } catch {
    return;
  }
}
export function saveJournalDraft(
  slug: string,
  data: ChecklistInput,
  storage: Pick<Storage, "setItem">,
) {
  storage.setItem(
    JOURNAL_DRAFT_KEY,
    JSON.stringify({
      articleSlug: validSlug.parse(slug),
      data: checklistInputSchema.parse(data),
      savedAt: Date.now(),
    }),
  );
}

export function journalWorkspacePath(
  slug: string,
  locale: AppLocale,
  vehicleId?: string,
) {
  const params = new URLSearchParams({ article: slug, locale });
  if (vehicleId) params.set("vehicle", vehicleId);
  return `/garage/journal?${params}`;
}

export function journalFeaturePath(slug: string, vehicleId: string) {
  const root = `/garage/${encodeURIComponent(vehicleId)}`;
  if (slug === "ruesselsheim-rheingau-tagesausflug")
    return `/ai?journal=ruesselsheim-rheingau-tagesausflug&vehicle=${encodeURIComponent(vehicleId)}`;
  if (slug === "bmw-diy-wartung-dokumentieren") return `${root}/maintenance`;
  if (slug === "bmw-wartung-ohne-garage" || slug === "guide-to-vehicle-history")
    return `${root}/guides`;
  return `${root}/builds/new?journal=${encodeURIComponent(slug)}`;
}
