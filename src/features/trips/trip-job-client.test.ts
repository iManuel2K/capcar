import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  readPendingTripJob,
  requestTripPlan,
  resumeTripPlan,
} from "./trip-job-client";
import type { TripPlannerRequest } from "./trip-planner";

const input: TripPlannerRequest = {
  vehicle: "BMW",
  region: "Kosovo",
  duration: 2,
  startDate: "2026-10-30",
  interests: [],
  pace: "scenic",
  inputMode: "places",
  useConnectedContext: false,
};
const plan = { title: "Recovered itinerary", days: [] };
beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("durable trip requests", () => {
  it("recovers a lost creation acknowledgement using the ID saved before POST", async () => {
    let id: string | undefined;
    const fetch = vi.fn(async (_url: string, init?: RequestInit) => {
      if (init?.method === "POST") {
        id = (init.headers as Record<string, string>)["idempotency-key"];
        expect(readPendingTripJob("owner")?.id).toBe(id);
        throw new Error("Acknowledgement lost after accepting the job");
      }
      expect(_url).toBe(`/api/ai/trips/jobs/${id}`);
      return Response.json({ status: "completed", result: plan });
    });
    vi.stubGlobal("fetch", fetch);
    const result = requestTripPlan(input, "owner");
    await vi.advanceTimersByTimeAsync(2000);
    expect(await result).toEqual(plan);
    expect(
      fetch.mock.calls.filter(([, init]) => init?.method === "POST"),
    ).toHaveLength(1);
    expect(readPendingTripJob("owner")).toBeNull();
  });

  it("resumes after leaving the page with the same ID and stops the old poll loop", async () => {
    const ids: string[] = [];
    let completed = false;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, init?: RequestInit) => {
        if (init?.method === "POST") {
          const id = (init.headers as Record<string, string>)[
            "idempotency-key"
          ];
          ids.push(id);
          return Response.json({ jobId: id }, { status: 202 });
        }
        return Response.json(
          completed
            ? { status: "completed", result: plan }
            : { status: "running" },
        );
      }),
    );
    const abort = new AbortController();
    const first = requestTripPlan(input, "owner", abort.signal);
    const rejected = expect(first).rejects.toMatchObject({
      name: "AbortError",
    });
    await vi.advanceTimersByTimeAsync(2000);
    abort.abort();
    await rejected;
    expect(readPendingTripJob("owner")?.input).toEqual(input);
    expect(vi.getTimerCount()).toBe(0);
    expect(await resumeTripPlan("another-owner")).toBeNull();
    completed = true;
    const resumed = resumeTripPlan("owner");
    await vi.advanceTimersByTimeAsync(2000);
    expect(await resumed).toEqual(plan);
    expect(ids).toHaveLength(2);
    expect(ids[0]).toBe(ids[1]);
    expect(readPendingTripJob("owner")).toBeNull();
  });

  it("retains the stable ID after a status outage and reuses it on retry", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, init?: RequestInit) => {
        if (init?.method === "POST")
          return Response.json(
            {
              jobId: (init.headers as Record<string, string>)[
                "idempotency-key"
              ],
            },
            { status: 202 },
          );
        return new Response(null, { status: 503 });
      }),
    );
    const task = requestTripPlan(input, "owner");
    const rejected = expect(task).rejects.toThrow();
    await vi.advanceTimersByTimeAsync(185000);
    await rejected;
    const id = readPendingTripJob("owner")?.id;
    expect(id).toBeTruthy();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, init?: RequestInit) => {
        if (init?.method === "POST") {
          expect(
            (init.headers as Record<string, string>)["idempotency-key"],
          ).toBe(id);
          return Response.json({ jobId: id }, { status: 202 });
        }
        return Response.json({
          status: "failed",
          error: "Provider quota reached",
        });
      }),
    );
    const retry = requestTripPlan(input, "owner");
    await vi.advanceTimersByTimeAsync(2000);
    expect(await retry).toEqual({ error: "Provider quota reached" });
    expect(readPendingTripJob("owner")).toBeNull();
  });
});
