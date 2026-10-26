// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { createTripPlanStream, readTripPlanResponse } from "./trip-plan-stream";
import { planScenicTrip, tripPlannerRequestSchema } from "./trip-planner";

const request = tripPlannerRequestSchema.parse({
  vehicle: "BMW 318i",
  region: "Black Forest",
  startDate: "2026-10-30",
  duration: 2,
  pace: "scenic",
  interests: ["nature"],
});
const failure = () => ({
  error: "Provider busy",
  code: "gemini_timeout",
  status: 504,
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
describe("trip planning transport", () => {
  it("starts immediately, stays alive beyond 30 seconds and delivers the real plan", async () => {
    const plan = await planScenicTrip(request, undefined, {});
    vi.useFakeTimers();
    const response = createTripPlanStream(
      () => new Promise((resolve) => setTimeout(() => resolve(plan), 35000)),
      failure,
    );
    const reader = response.body!.getReader();
    expect(new TextDecoder().decode((await reader.read()).value)).toContain(
      '"type":"progress"',
    );
    await reader.cancel();
    // A separate response exercises the same protocol's client parser.
    const result = readTripPlanResponse(
      createTripPlanStream(
        () => new Promise((resolve) => setTimeout(() => resolve(plan), 35000)),
        failure,
      ),
    );
    await vi.advanceTimersByTimeAsync(35000);
    expect(await result).toEqual(plan);
    expect(vi.getTimerCount()).toBe(0);
  });
  it("preserves provider failures in the final error frame", async () => {
    const response = createTripPlanStream(async () => {
      throw new Error("offline");
    }, failure);
    expect(await readTripPlanResponse(response)).toEqual({
      error: "Provider busy",
    });
  });
  it("ends stalled work at the overall deadline and aborts it", async () => {
    vi.useFakeTimers();
    let signal: AbortSignal | undefined;
    const response = createTripPlanStream((s) => {
      signal = s;
      return new Promise(() => {});
    }, failure);
    const result = readTripPlanResponse(response);
    await vi.advanceTimersByTimeAsync(52000);
    expect(await result).toEqual({
      error: expect.stringContaining("taking too long"),
    });
    expect(signal?.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });
  it("aborts generation if the reader disconnects, ignoring its late result", async () => {
    const plan = await planScenicTrip(request, undefined, {});
    let finish!: (value: typeof plan) => void;
    let signal: AbortSignal | undefined;
    const response = createTripPlanStream((s) => {
      signal = s;
      return new Promise((resolve) => {
        finish = resolve;
      });
    }, failure);
    const reader = response.body!.getReader();
    await reader.read();
    await reader.cancel();
    expect(signal?.aborted).toBe(true);
    finish(plan);
    await Promise.resolve();
  });
  it("polls background work past 30 seconds and tolerates a transient status failure", async () => {
    vi.useFakeTimers();
    const started = Date.now();
    const fetch = vi.fn(async () =>
      Date.now() - started < 35000
        ? new Response(null, { status: 503 })
        : Response.json({
            status: "completed",
            result: { title: "Completed by AI" },
          }),
    );
    vi.stubGlobal("fetch", fetch);
    const result = readTripPlanResponse(
      Response.json(
        { jobId: "11111111-1111-4111-8111-111111111111" },
        { status: 202 },
      ),
    );
    await vi.advanceTimersByTimeAsync(36000);
    expect(await result).toEqual({ title: "Completed by AI" });
    expect(fetch).toHaveBeenCalledWith(
      "/api/ai/trips/jobs/11111111-1111-4111-8111-111111111111",
      expect.any(Object),
    );
  });
  it("reports a background provider error without submitting another paid generation", async () => {
    vi.useFakeTimers();
    const fetch = vi.fn(async () =>
      Response.json({ status: "failed", error: "Provider quota reached" }),
    );
    vi.stubGlobal("fetch", fetch);
    const result = readTripPlanResponse(
      Response.json(
        { jobId: "11111111-1111-4111-8111-111111111111" },
        { status: 202 },
      ),
    );
    await vi.advanceTimersByTimeAsync(2000);
    expect(await result).toEqual({ error: "Provider quota reached" });
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it("keeps buffered JSON errors compatible and rejects interrupted streams", async () => {
    expect(
      await readTripPlanResponse(
        Response.json({ error: "Sign in" }, { status: 401 }),
      ),
    ).toEqual({ error: "Sign in" });
    await expect(
      readTripPlanResponse(
        new Response('{"type":"progress"}\n', {
          headers: { "content-type": "application/x-ndjson" },
        }),
      ),
    ).rejects.toThrow("before the route was ready");
  });
});
