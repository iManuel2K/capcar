import { describe, expect, it } from "vitest";
import { importScan, parseScan } from "./scan-import";
import { DIAGNOSTIC_STORAGE_KEY } from "./diagnostic-storage";
describe("scan import", () => {
  const text = JSON.stringify({
    version: 1,
    scannedAt: "2026-01-01T12:00:00.000Z",
    codes: ["p0300", "P0300", "P0420"],
  });
  it("normalizes and deduplicates without inventing a diagnosis", () => {
    expect(parseScan(text).codes).toEqual(["P0300", "P0420"]);
  });
  it("rejects unsupported fields, bad codes and oversized scans", () => {
    expect(() => parseScan(text.replace("P0420", "DROP TABLE"))).toThrow();
    expect(() =>
      parseScan(JSON.stringify({ ...JSON.parse(text), vin: "private" })),
    ).toThrow();
    expect(() => parseScan("x".repeat(65537))).toThrow();
  });
  it("imports atomically, skips open codes and preserves other vehicles", () => {
    const memory = new Map<string, string>();
    const storage = {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => {
        memory.set(key, value);
      },
    };
    expect(importScan(parseScan(text), "car-a", 1234, storage)).toBe(2);
    expect(importScan(parseScan(text), "car-a", 1234, storage)).toBe(0);
    expect(importScan(parseScan(text), "car-b", 1234, storage)).toBe(2);
    expect(JSON.parse(storage.getItem(DIAGNOSTIC_STORAGE_KEY)!)).toHaveLength(
      4,
    );
    storage.setItem(DIAGNOSTIC_STORAGE_KEY, "broken");
    expect(() => importScan(parseScan(text), "car-a", 1234, storage)).toThrow();
    expect(storage.getItem(DIAGNOSTIC_STORAGE_KEY)).toBe("broken");
  });
});
