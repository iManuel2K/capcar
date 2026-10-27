import { describe, expect, it } from "vitest";
import { createSerialTask } from "./serial-task";

describe("snapshot write ordering", () => {
  it("waits for the older save before starting the next snapshot read/write", async () => {
    const run = createSerialTask();
    const writes: string[] = [];
    let release!: () => void;
    const first = run(async () => {
      await new Promise<void>((resolve) => {
        release = resolve;
      });
      writes.push("old");
    });
    const second = run(async () => {
      writes.push("new");
    });
    await Promise.resolve();
    expect(writes).toEqual([]);
    release();
    await Promise.all([first, second]);
    expect(writes).toEqual(["old", "new"]);
  });
  it("allows retry after a rejected save", async () => {
    const run = createSerialTask();
    await expect(
      run(async () => {
        throw new Error("offline");
      }),
    ).rejects.toThrow("offline");
    expect(await run(async () => "saved")).toBe("saved");
  });
});
