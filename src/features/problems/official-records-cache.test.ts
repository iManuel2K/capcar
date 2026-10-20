import { describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ cache: vi.fn(), lookup: vi.fn() }));
vi.mock("next/cache", () => ({
  unstable_cache: mocks.cache.mockImplementation((fn) => fn),
}));
vi.mock("./official-records-provider", () => ({
  PROBLEM_CACHE_SECONDS: 21600,
  fetchOfficialProblems: mocks.lookup,
}));
describe("shared official-record cache", () => {
  it("uses a persistent six-hour cache and collapses concurrent requests, including failure cleanup", async () => {
    vi.resetModules();
    const { getOfficialProblems } = await import("./official-records-cache");
    expect(mocks.cache).toHaveBeenCalledWith(
      mocks.lookup,
      ["problem-records-nhtsa-v1"],
      { revalidate: 21600, tags: ["official-problem-records"] },
    );
    let finish!: (value: unknown) => void;
    mocks.lookup.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const one = getOfficialProblems("mazda3-bm", 2015);
    const two = getOfficialProblems("mazda3-bm", 2015);
    expect(one).toBe(two);
    expect(mocks.lookup).toHaveBeenCalledTimes(1);
    finish({ status: "available" });
    await one;
    mocks.lookup.mockRejectedValueOnce(new Error("offline"));
    await expect(getOfficialProblems("mazda3-bm", 2015)).rejects.toThrow(
      "offline",
    );
    mocks.lookup.mockResolvedValueOnce({ status: "available" });
    await expect(getOfficialProblems("mazda3-bm", 2015)).resolves.toEqual({
      status: "available",
    });
  });
});
