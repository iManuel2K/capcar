import { z } from "zod";
import { diagnosticLogSchema, type DiagnosticLog } from "./diagnostic-schema";
import { DIAGNOSTIC_STORAGE_KEY } from "./diagnostic-storage";

const scanSchema = z
  .object({
    version: z.literal(1),
    scannedAt: z.string().datetime(),
    codes: z
      .array(
        z
          .string()
          .trim()
          .toUpperCase()
          .regex(/^[PBCU][0-9A-F]{4}$/),
      )
      .max(100),
  })
  .strict();
export type ScanImport = z.infer<typeof scanSchema>;

export function parseScan(text: string): ScanImport {
  if (new TextEncoder().encode(text).length > 65536)
    throw new Error("Scan must be smaller than 64 KB.");
  const scan = scanSchema.parse(JSON.parse(text));
  if (Date.parse(scan.scannedAt) > Date.now() + 300000)
    throw new Error("Scan date is in the future.");
  return { ...scan, codes: [...new Set(scan.codes)] };
}

export function importScan(
  scan: ScanImport,
  vehicleId: string,
  mileage: number,
  storage: Pick<Storage, "getItem" | "setItem">,
) {
  const parsed = scanSchema.parse(scan);
  const raw = storage.getItem(DIAGNOSTIC_STORAGE_KEY);
  // Refuse to overwrite an unreadable existing log.
  const existing: DiagnosticLog[] = raw
    ? diagnosticLogSchema.array().parse(JSON.parse(raw))
    : [];
  const now = new Date().toISOString();
  const additions = [...new Set(parsed.codes)].filter(
    (code) =>
      !existing.some(
        (record) =>
          record.vehicleId === vehicleId &&
          record.code === code &&
          record.status !== "resolved",
      ),
  );
  const records = additions.map((code) =>
    diagnosticLogSchema.parse({
      id: crypto.randomUUID(),
      vehicleId,
      mileage,
      code,
      title: `Imported fault ${code}`,
      severity: "warning",
      status: "open",
      symptoms: `Imported scan dated ${parsed.scannedAt}. Add observed symptoms before interpreting this code.`,
      createdAt: now,
      updatedAt: now,
    }),
  );
  storage.setItem(
    DIAGNOSTIC_STORAGE_KEY,
    JSON.stringify([...records, ...existing]),
  );
  return records.length;
}
