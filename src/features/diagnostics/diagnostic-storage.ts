import {
  type DiagnosticInput,
  type DiagnosticLog,
  type DiagnosticStatus,
  diagnosticInputSchema,
  diagnosticLogSchema,
} from "@/features/diagnostics/diagnostic-schema";

export const DIAGNOSTIC_STORAGE_KEY = "capcar.diagnostics.v1";
export const DIAGNOSTIC_STORAGE_EVENT = "capcar:diagnostics-changed";

type ReadableStorage = Pick<Storage, "getItem">;
type WritableStorage = Pick<Storage, "getItem" | "setItem">;

export function readDiagnostics(storage: ReadableStorage): DiagnosticLog[] {
  const raw = storage.getItem(DIAGNOSTIC_STORAGE_KEY);
  if (!raw) return [];
  try {
    const result = diagnosticLogSchema.array().safeParse(JSON.parse(raw));
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}

function write(records: DiagnosticLog[], storage: WritableStorage) {
  storage.setItem(DIAGNOSTIC_STORAGE_KEY, JSON.stringify(records));
}

export function saveDiagnostic(
  input: DiagnosticInput,
  storage: WritableStorage,
  options?: { id?: string; now?: string },
) {
  const normalized = diagnosticInputSchema.parse(input);
  const now = options?.now ?? new Date().toISOString();
  const record = diagnosticLogSchema.parse({
    ...normalized,
    id: options?.id ?? crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    resolvedAt: normalized.status === "resolved" ? now : undefined,
  });
  write([record, ...readDiagnostics(storage)], storage);
  return record;
}

export function updateDiagnosticStatus(
  id: string,
  status: DiagnosticStatus,
  resolution: string,
  storage: WritableStorage,
  now = new Date().toISOString(),
) {
  const records = readDiagnostics(storage).map((record) =>
    record.id === id
      ? diagnosticLogSchema.parse({
          ...record,
          status,
          resolution: resolution || record.resolution,
          updatedAt: now,
          resolvedAt: status === "resolved" ? now : undefined,
        })
      : record,
  );
  write(records, storage);
}

export function announceDiagnosticChange() {
  window.dispatchEvent(new Event(DIAGNOSTIC_STORAGE_EVENT));
}
