import { z } from "zod";
import { diagnosticLogSchema, type DiagnosticLog } from "./diagnostic-schema";
import { DIAGNOSTIC_STORAGE_KEY } from "./diagnostic-storage";
import { diagnosticInsightFor } from "./diagnostic-inspector";

const legacyScanSchema = z
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

const scanSchema = z.object({
  version: z.literal(1),
  scannedAt: z.string().datetime(),
  codes: z.array(z.string().regex(/^[PBCU][0-9A-F]{4}$/)).max(100),
  sourceFormat: z.enum([
    "capcar-json",
    "json",
    "csv",
    "elm327",
    "bimmerlink",
    "text",
  ]),
  duplicateCount: z.number().int().nonnegative(),
});

export type ScanImport = z.infer<typeof scanSchema>;

const MAX_SCAN_BYTES = 1024 * 1024;

function extractCodes(value: string) {
  const normalized = value
    .replace(/^\uFEFF/, "")
    .replaceAll("\0", "")
    .toUpperCase();
  const matches = normalized.matchAll(
    /(?:^|[^A-Z0-9])([PBCU])[\s:_-]*([0-9A-F]{4})(?![A-Z0-9])/g,
  );
  return [...matches].map((match) => `${match[1]}${match[2]}`);
}

function detectFormat(
  text: string,
  parsed: unknown,
): ScanImport["sourceFormat"] {
  if (legacyScanSchema.safeParse(parsed).success) return "capcar-json";
  if (/bimmerlink/i.test(text)) return "bimmerlink";
  if (/ELM327|SEARCHING\.{0,3}|NO DATA|ATZ\b|41\s*0[1347]/i.test(text))
    return "elm327";
  if (parsed !== undefined) return "json";
  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  if (firstLine.includes(",") || firstLine.includes(";")) return "csv";
  return "text";
}

function extractDate(parsed: unknown) {
  if (!parsed || typeof parsed !== "object") return undefined;
  const record = parsed as Record<string, unknown>;
  for (const key of ["scannedAt", "scanDate", "date", "timestamp"]) {
    const value = record[key];
    if (typeof value === "string" && !Number.isNaN(Date.parse(value)))
      return new Date(value).toISOString();
  }
  return undefined;
}

export function parseScan(text: string, now = new Date()): ScanImport {
  if (new TextEncoder().encode(text).length > MAX_SCAN_BYTES)
    throw new Error("Scan must be smaller than 1 MB.");
  if (!text.trim()) throw new Error("Scan is empty.");
  let parsed: unknown;
  try {
    parsed = JSON.parse(text.replace(/^\uFEFF/, ""));
  } catch {
    parsed = undefined;
  }
  const matches = extractCodes(text);
  const codes = [...new Set(matches)].slice(0, 100);
  if (!codes.length) throw new Error("No valid OBD-II fault codes were found.");
  const scannedAt = extractDate(parsed) ?? now.toISOString();
  if (Date.parse(scannedAt) > now.getTime() + 300000)
    throw new Error("Scan date is in the future.");
  return scanSchema.parse({
    version: 1,
    scannedAt,
    codes,
    sourceFormat: detectFormat(text, parsed),
    duplicateCount: matches.length - codes.length,
  });
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
  const records = additions.map((code) => {
    const insight = diagnosticInsightFor(code);
    return diagnosticLogSchema.parse({
      id: crypto.randomUUID(),
      vehicleId,
      mileage,
      code,
      title: insight.title,
      severity: insight.severity,
      status: "open",
      symptoms: `Imported ${parsed.sourceFormat} scan dated ${parsed.scannedAt}. ${insight.summary}`,
      createdAt: now,
      updatedAt: now,
    });
  });
  storage.setItem(
    DIAGNOSTIC_STORAGE_KEY,
    JSON.stringify([...records, ...existing]),
  );
  return records.length;
}
