import {
  type CostEntryInput,
  type CostState,
  costEntryInputSchema,
  costEntrySchema,
  costStateSchema,
} from "@/features/costs/cost-schema";
import { readBuildState } from "@/features/builds/build-storage";

export const COST_STORAGE_KEY = "capcar.costs.v1";
export const COST_STORAGE_EVENT = "capcar:costs-changed";

type ReadableStorage = Pick<Storage, "getItem">;
type WritableStorage = Pick<Storage, "getItem" | "setItem">;
const emptyState: CostState = { budgets: {}, entries: [] };

export function readCostState(storage: ReadableStorage): CostState {
  const stored = readStoredCosts(storage);
  const builds = readBuildState(storage);
  const linked = builds.items.flatMap((item) => {
    const purchase = item.workbench?.purchase;
    const build = builds.builds.find((entry) => entry.id === item.buildId);
    if (
      !purchase ||
      !build ||
      purchase.accounting !== "include" ||
      purchase.amount === purchase.refunded
    )
      return [];
    return [
      costEntrySchema.parse({
        id: `build-purchase-${item.id}`,
        vehicleId: build.vehicleId,
        sourceBuildId: build.id,
        sourceBuildItemId: item.id,
        label: item.title.slice(0, 120),
        category: "parts",
        amount: Math.round((purchase.amount - purchase.refunded) * 100) / 100,
        occurredOn: purchase.orderedAt,
        createdAt: purchase.updatedAt,
        note: "Linked build purchase · net of recorded refunds. Edit in the build workflow.",
      }),
    ];
  });
  return {
    ...stored,
    entries: [
      ...linked,
      ...stored.entries.filter((entry) => !entry.sourceBuildItemId),
    ],
  };
}

function readStoredCosts(storage: ReadableStorage): CostState {
  const raw = storage.getItem(COST_STORAGE_KEY);
  if (!raw) return emptyState;
  try {
    const result = costStateSchema.safeParse(JSON.parse(raw));
    return result.success ? result.data : emptyState;
  } catch {
    return emptyState;
  }
}

function write(state: CostState, storage: WritableStorage) {
  // Purchases have one source of truth in the build snapshot. Never persist a
  // second copy in the costs key, including during unrelated budget edits.
  storage.setItem(
    COST_STORAGE_KEY,
    JSON.stringify({
      ...state,
      entries: state.entries.filter((entry) => !entry.sourceBuildItemId),
    }),
  );
}

export function setVehicleBudget(
  vehicleId: string,
  amount: number,
  storage: WritableStorage,
) {
  const state = readCostState(storage);
  write(
    costStateSchema.parse({
      ...state,
      budgets: { ...state.budgets, [vehicleId]: amount },
    }),
    storage,
  );
}

export function saveCostEntry(
  input: CostEntryInput,
  storage: WritableStorage,
  options?: { id?: string; createdAt?: string },
) {
  const normalized = costEntryInputSchema.parse(input);
  const entry = costEntrySchema.parse({
    ...normalized,
    id: options?.id ?? crypto.randomUUID(),
    createdAt: options?.createdAt ?? new Date().toISOString(),
  });
  const state = readCostState(storage);
  write({ ...state, entries: [entry, ...state.entries] }, storage);
  return entry;
}

export function announceCostChange() {
  window.dispatchEvent(new Event(COST_STORAGE_EVENT));
}

export function updateCostEntry(
  id: string,
  input: CostEntryInput,
  storage: WritableStorage,
) {
  const normalized = costEntryInputSchema.parse(input);
  const state = readCostState(storage);
  const existing = state.entries.find(
    (entry) => entry.id === id && entry.vehicleId === normalized.vehicleId,
  );
  if (!existing)
    throw new Error(
      "This expense is no longer available. Refresh and try again.",
    );
  if (existing.sourceBuildItemId)
    throw new Error("Edit this purchase in its build workflow.");
  const updated = costEntrySchema.parse({ ...existing, ...normalized });
  write(
    {
      ...state,
      entries: state.entries.map((entry) =>
        entry === existing ? updated : entry,
      ),
    },
    storage,
  );
  return updated;
}

export function deleteCostEntry(
  id: string,
  vehicleId: string,
  storage: WritableStorage,
) {
  const state = readCostState(storage);
  if (
    state.entries.some(
      (entry) =>
        entry.id === id &&
        entry.vehicleId === vehicleId &&
        entry.sourceBuildItemId,
    )
  )
    throw new Error(
      "Record a refund or change accounting in the build workflow.",
    );
  write(
    {
      ...state,
      entries: state.entries.filter(
        (entry) => !(entry.id === id && entry.vehicleId === vehicleId),
      ),
    },
    storage,
  );
}

export function exportVehicleCostsCsv(vehicleId: string, state: CostState) {
  // Quote every field and neutralize spreadsheet formulas in user-entered text.
  const cell = (value: string | number) => {
    const text = String(value);
    const safe =
      /^[\s]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text) ? `'${text}` : text;
    return `"${safe.replaceAll('"', '""')}"`;
  };
  return [
    ["Date", "Expense", "Category", "Amount (EUR)", "Note"],
    ...state.entries
      .filter((entry) => entry.vehicleId === vehicleId)
      .map((entry) => [
        entry.occurredOn,
        entry.label,
        entry.category,
        entry.amount.toFixed(2),
        entry.note ?? "",
      ]),
  ]
    .map((row) => row.map(cell).join(","))
    .join("\r\n");
}

export function summarizeVehicleCosts(vehicleId: string, state: CostState) {
  const entries = state.entries.filter(
    (entry) => entry.vehicleId === vehicleId,
  );
  const categories = {
    parts: entries
      .filter((entry) => entry.category === "parts")
      .reduce((sum, entry) => sum + entry.amount, 0),
    labor: entries
      .filter((entry) => entry.category === "labor")
      .reduce((sum, entry) => sum + entry.amount, 0),
    maintenance: entries
      .filter((entry) => entry.category === "maintenance")
      .reduce((sum, entry) => sum + entry.amount, 0),
  };
  return {
    entries,
    categories,
    total: categories.parts + categories.labor + categories.maintenance,
    budget: state.budgets[vehicleId] ?? 5_000,
  };
}
