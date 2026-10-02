import { describe, expect, it } from "vitest";
import { decodePid, decodeStoredCodes, Elm327 } from "./elm327";
describe("ELM327 read-only protocol", () => {
  it("initializes a serial adapter with only the approved read-only setup sequence", async () => {
    const commands: string[] = [];
    let controller!: ReadableStreamDefaultController<Uint8Array>;
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const adapter = new Elm327({
      readable: new ReadableStream({
        start(nextController) {
          controller = nextController;
        },
      }),
      writable: new WritableStream({
        write(chunk) {
          const command = decoder.decode(chunk).trim();
          commands.push(command);
          controller.enqueue(
            encoder.encode(command === "ATZ" ? "ELM327 v1.5\r>" : "OK\r>"),
          );
        },
      }),
      open: async () => {},
      close: async () => {},
    });

    await adapter.initialize();

    expect(commands).toEqual(["ATZ", "ATE0", "ATL0", "ATH0", "ATSP0"]);
    expect(commands).not.toContain("04");
  });

  it("decodes DTC byte pairs and deduplicates ECU replies", () => {
    expect(
      decodeStoredCodes("03\r43 03 01 01 71 04 20\r43 03 01 00 00 00 00"),
    ).toEqual(["P0301", "P0171", "P0420"]);
    expect(decodeStoredCodes("43 00 00 00 00 00 00")).toEqual([]);
  });
  it("rejects missing and unsupported frame responses instead of reporting a healthy car", () => {
    expect(() => decodeStoredCodes("NO DATA")).toThrow();
    expect(() => decodeStoredCodes("43 01 02 03")).toThrow();
  });
  it("decodes physical units without guessing unsupported PIDs", () => {
    expect(decodePid("41 0C 1A F8", "0C")).toBe(1726);
    expect(decodePid("41 05 7B", "05")).toBe(83);
    expect(decodePid("41 0D 00", "0D")).toBe(0);
    expect(decodePid("NO DATA", "05")).toBeNull();
  });
  it("never sends a code-clearing command", async () => {
    const adapter = new Elm327({
      readable: null,
      writable: null,
      open: async () => {},
      close: async () => {},
    });
    await expect(adapter.command("04")).rejects.toThrow("Unsupported command");
  });
});
