import { z } from "zod";

export const INSTALL_STAMP_STORAGE_KEY = "capcar.install-stamps.v1";
export const INSTALL_STAMP_STORAGE_EVENT = "capcar:install-stamps-changed";

export const installStampSchema = z.object({
  id: z.string().min(1),
  vehicleId: z.string().min(1),
  specialistId: z.string().min(1),
  specialistName: z.string().min(1),
  work: z.string().trim().min(2).max(160),
  installedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  createdAt: z.string().datetime(),
  verification: z.literal("beta_shop_stamp"),
});
export type InstallStamp = z.infer<typeof installStampSchema>;
type ReadableStorage = Pick<Storage, "getItem">;
type WritableStorage = Pick<Storage, "getItem" | "setItem">;

export function readInstallStamps(storage: ReadableStorage): InstallStamp[] {
  const raw = storage.getItem(INSTALL_STAMP_STORAGE_KEY);
  if (!raw) return [];
  try {
    const result = installStampSchema.array().safeParse(JSON.parse(raw));
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}

export function createBetaInstallStamp(
  input: Omit<InstallStamp, "id" | "createdAt" | "verification">,
  storage: WritableStorage,
) {
  const stamp = installStampSchema.parse({
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    verification: "beta_shop_stamp",
  });
  storage.setItem(
    INSTALL_STAMP_STORAGE_KEY,
    JSON.stringify([stamp, ...readInstallStamps(storage)]),
  );
  return stamp;
}

export function announceInstallStampChange() {
  window.dispatchEvent(new Event(INSTALL_STAMP_STORAGE_EVENT));
}
