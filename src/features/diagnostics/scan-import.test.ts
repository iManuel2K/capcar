import { describe, expect, it } from "vitest";
import { importScan, parseScan } from "./scan-import";
import { DIAGNOSTIC_STORAGE_KEY } from "./diagnostic-storage";
describe("scan import", () => {
  const text = JSON.stringify({
    version: 1,
    scannedAt: "2026-01-01T12:00:00.000Z",
    codes: ["p0300", "P0300", "P0420"],
  });
  it("normalizes and deduplicates a CapCar JSON scan", () => {
    const scan = parseScan(text);
    expect(scan.codes).toEqual(["P0300", "P0420"]);
    expect(scan.sourceFormat).toBe("capcar-json");
    expect(scan.duplicateCount).toBe(1);
  });
  it.each([
    ["ELM327 v1.5\rSEARCHING...\r43 01\rP-0301", "elm327", "P0301"],
    ["BimmerLink export\nFault code: P0171", "bimmerlink", "P0171"],
    ["code,description\nP0420,catalyst", "csv", "P0420"],
    [JSON.stringify({ faults: [{ code: "U0100" }] }), "json", "U0100"],
    ["Stored: C 0035 and noise 0xBEEF", "text", "C0035"],
  ])("reads flexible %s input", (input, format, code) => {
    const scan = parseScan(input, new Date("2026-09-09T10:00:00.000Z"));
    expect(scan.sourceFormat).toBe(format);
    expect(scan.codes).toContain(code);
  });
  it("rejects empty, code-free and oversized scans", () => {
    expect(() => parseScan("DROP TABLE")).toThrow(/No valid/);
    expect(() => parseScan(" ")).toThrow(/empty/);
    expect(() => parseScan(`P0300 ${"x".repeat(1024 * 1024)}`)).toThrow(/1 MB/);
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
