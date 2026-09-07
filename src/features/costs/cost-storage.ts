import {
  type CostEntryInput,
  type CostState,
  costEntryInputSchema,
  costEntrySchema,
  costStateSchema,
} from "@/features/costs/cost-schema";

export const COST_STORAGE_KEY = "capcar.costs.v1";
export const COST_STORAGE_EVENT = "capcar:costs-changed";

type ReadableStorage = Pick<Storage, "getItem">;
type WritableStorage = Pick<Storage, "getItem" | "setItem">;
const emptyState: CostState = { budgets: {}, entries: [] };

export function readCostState(storage: ReadableStorage): CostState {
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
  storage.setItem(COST_STORAGE_KEY, JSON.stringify(state));
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

export function summarizeVehicleCosts(vehicleId: string, state: CostState) {
  const entries = state.entries.filter((entry) => entry.vehicleId === vehicleId);
  const categories = {
    parts: entries.filter((entry) => entry.category === "parts").reduce((sum, entry) => sum + entry.amount, 0),
    labor: entries.filter((entry) => entry.category === "labor").reduce((sum, entry) => sum + entry.amount, 0),
    maintenance: entries.filter((entry) => entry.category === "maintenance").reduce((sum, entry) => sum + entry.amount, 0),
  };
  return {
    entries,
    categories,
    total: categories.parts + categories.labor + categories.maintenance,
    budget: state.budgets[vehicleId] ?? 5_000,
  };
}
