import { describe, expect, it } from "vitest";

import {
  applyLocalSnapshot,
  collectLocalSnapshot,
} from "@/features/sync/local-snapshot";
import { VEHICLE_STORAGE_KEY } from "@/features/vehicles/vehicle-storage";

describe("local snapshot", () => {
  it("collects and safely restores only known CapCar keys", () => {
    localStorage.clear();
    localStorage.setItem(VEHICLE_STORAGE_KEY, "[]");
    localStorage.setItem("unrelated", "private");
    const snapshot = collectLocalSnapshot(
      localStorage,
      "2026-09-05T10:00:00.000Z",
    );
    expect(snapshot.data[VEHICLE_STORAGE_KEY]).toBe("[]");
    expect(snapshot.data.unrelated).toBeUndefined();
    const target = new Map<string, string>();
    applyLocalSnapshot(snapshot, {
      setItem: (key, value) => target.set(key, value),
    });
    expect(target.get(VEHICLE_STORAGE_KEY)).toBe("[]");
    expect(target.has("unrelated")).toBe(false);
  });
});
