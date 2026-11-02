import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { from, query } = vi.hoisted(() => ({
  from: vi.fn(),
  query: { select: vi.fn(), eq: vi.fn(), abortSignal: vi.fn() },
}));
vi.mock("@/lib/supabase/client", () => ({ createClient: () => ({ from }) }));

beforeEach(() => {
  vi.resetModules();
  vi.useFakeTimers();
  vi.clearAllMocks();
  from.mockReturnValue(query);
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  query.abortSignal.mockReturnValue(query);
});
afterEach(() => {
  vi.useRealTimers();
  delete (query as Record<string, unknown>).then;
});

async function respond(count: number | null, error: object | null = null) {
  Object.assign(query, {
    then: (resolve: (result: unknown) => void) => resolve({ count, error }),
  });
  return (await import("./roadbook-client")).fetchRoadbookCatalogCount;
}

describe("public Roadbook catalog count", () => {
  it("counts only published places, requests no venue bodies and respects cancellation", async () => {
    const fetchCount = await respond(125);
    const controller = new AbortController();
    expect(await fetchCount(controller.signal)).toBe(125);
    expect(from).toHaveBeenCalledWith("roadbook_venues");
    expect(query.select).toHaveBeenCalledWith("id", {
      count: "exact",
      head: true,
    });
    expect(query.eq).toHaveBeenCalledWith("published", true);
    expect(query.abortSignal).toHaveBeenCalledWith(controller.signal);
  });
  it("caches successful totals for five minutes, including zero", async () => {
    const fetchCount = await respond(0);
    expect(await fetchCount()).toBe(0);
    expect(await fetchCount()).toBe(0);
    expect(from).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(300001);
    await fetchCount();
    expect(from).toHaveBeenCalledTimes(2);
  });
  it("does not turn an unavailable count into zero or cache a failure", async () => {
    const fetchCount = await respond(null, { message: "unavailable" });
    await expect(fetchCount()).rejects.toThrow("ROADBOOK_COUNT_UNAVAILABLE");
    Object.assign(query, {
      then: (resolve: (result: unknown) => void) =>
        resolve({ count: 126, error: null }),
    });
    expect(await fetchCount()).toBe(126);
    expect(from).toHaveBeenCalledTimes(2);
  });
});
