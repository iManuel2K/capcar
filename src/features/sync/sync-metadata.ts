import { z } from "zod";

export const GARAGE_SYNC_META_KEY = "capcar.sync-meta.v1";

const syncMetadataSchema = z.object({
  userId: z.string().min(1),
  changedAt: z.string().datetime(),
  lastSyncedAt: z.string().datetime().optional(),
});

export type GarageSyncMetadata = z.infer<typeof syncMetadataSchema>;
type ReadableStorage = Pick<Storage, "getItem">;
type WritableStorage = Pick<Storage, "setItem">;

export function readSyncMetadata(
  storage: ReadableStorage,
): GarageSyncMetadata | undefined {
  const raw = storage.getItem(GARAGE_SYNC_META_KEY);
  if (!raw) return undefined;

  try {
    return syncMetadataSchema.parse(JSON.parse(raw));
  } catch {
    return undefined;
  }
}

export function markGarageChanged(
  userId: string,
  storage: ReadableStorage & WritableStorage,
  changedAt = new Date().toISOString(),
) {
  const current = readSyncMetadata(storage);
  const next: GarageSyncMetadata = {
    userId,
    changedAt,
    lastSyncedAt: current?.userId === userId ? current.lastSyncedAt : undefined,
  };
  storage.setItem(GARAGE_SYNC_META_KEY, JSON.stringify(next));
  return next;
}

export function markGarageSynced(
  userId: string,
  storage: ReadableStorage & WritableStorage,
  syncedAt = new Date().toISOString(),
) {
  const current = readSyncMetadata(storage);
  const next: GarageSyncMetadata = {
    userId,
    changedAt: current?.userId === userId ? current.changedAt : syncedAt,
    lastSyncedAt: syncedAt,
  };
  storage.setItem(GARAGE_SYNC_META_KEY, JSON.stringify(next));
  return next;
}
