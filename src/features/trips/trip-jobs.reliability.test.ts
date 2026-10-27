// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getTripJob, signTripJob, startTripJob } from "./trip-jobs";
import worker from "../../../netlify/functions/trip-plan-background";
import { createAdminClient } from "@/lib/supabase/admin";
import { planScenicTripWithFallback } from "./trip-planner";

vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: vi.fn() }));
vi.mock("@/features/connections/ai-connection", async (original) => ({
  ...(await original<object>()),
  getAiConnection: vi.fn(async () => ({ provider: "gemini" })),
  tripPlannerEnvironmentForConnection: vi.fn(() => ({
    CAPCAR_TRIP_PLANNER_MODE: "gemini",
  })),
}));
vi.mock("./trip-planner", async (original) => ({
  ...(await original<object>()),
  planScenicTripWithFallback: vi.fn(),
}));

const id = "11111111-1111-4111-8111-111111111111";
const input = {
  vehicle: "BMW",
  region: "Kosovo",
  duration: 2,
  startDate: "2026-10-30",
  interests: [],
  pace: "scenic" as const,
  inputMode: "places" as const,
  useConnectedContext: false,
};
type Row = Record<string, unknown>;

// Stateful database boundary: conditional updates and duplicate keys behave like PostgREST.
function database(initial: Row[] = []) {
  const rows = new Map(initial.map((row) => [row.id, { ...row }]));
  let completionFailures = 0;
  const writes: Row[] = [];
  const admin = {
    from() {
      let op = "select";
      let patch: Row = {};
      let selected = false;
      const filters: Array<(row: Row) => boolean> = [];
      const run = async () => {
        if (op === "insert") {
          if (rows.has(patch.id))
            return { data: null, error: { code: "23505" } };
          rows.set(patch.id, {
            status: "queued",
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 3600000).toISOString(),
            dispatched_at: null,
            ...patch,
          });
          return { data: null, error: null };
        }
        if (
          op === "update" &&
          patch.status === "completed" &&
          completionFailures-- > 0
        )
          return {
            data: null,
            error: { message: "Temporary database failure" },
          };
        const matches = [...rows.values()].filter((row) =>
          filters.every((test) => test(row)),
        );
        if (op === "delete") matches.forEach((row) => rows.delete(row.id));
        if (op === "update")
          matches.forEach((row) => {
            Object.assign(row, patch);
            writes.push({ ...patch });
          });
        return {
          data:
            selected || op === "select"
              ? matches.map((row) => ({ ...row }))
              : null,
          error: null,
        };
      };
      const chain = {
        insert(value: Row) {
          op = "insert";
          patch = value;
          return chain;
        },
        update(value: Row) {
          op = "update";
          patch = value;
          return chain;
        },
        delete() {
          op = "delete";
          return chain;
        },
        select() {
          selected = true;
          return chain;
        },
        eq(key: string, value: unknown) {
          filters.push((row) => row[key] === value);
          return chain;
        },
        gt(key: string, value: string) {
          filters.push((row) => String(row[key]) > value);
          return chain;
        },
        lt(key: string, value: string) {
          filters.push((row) => String(row[key]) < value);
          return chain;
        },
        lte(key: string, value: string) {
          filters.push((row) => String(row[key]) <= value);
          return chain;
        },
        in(key: string, values: unknown[]) {
          filters.push((row) => values.includes(row[key]));
          return chain;
        },
        or(value: string) {
          const cutoff = value.split(".lt.")[1];
          filters.push(
            (row) =>
              row.dispatched_at == null || String(row.dispatched_at) < cutoff,
          );
          return chain;
        },
        abortSignal() {
          return chain;
        },
        async maybeSingle() {
          const result = await run();
          return { ...result, data: result.data?.[0] ?? null };
        },
        then(resolve: (result: Awaited<ReturnType<typeof run>>) => unknown) {
          return run().then(resolve);
        },
      };
      return chain;
    },
  } as unknown as SupabaseClient;
  vi.mocked(createAdminClient).mockReturnValue(admin);
  return {
    admin,
    rows,
    writes,
    failCompletions(count: number) {
      completionFailures = count;
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("AI_CONNECTION_ENCRYPTION_KEY", "test-secret");
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(null, { status: 202 })),
  );
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
const signedRequest = () =>
  new Request("https://capcar.dev", {
    method: "POST",
    body: JSON.stringify({ id, signature: signTripJob(id) }),
  });
const queued = (age = 0): Row => ({
  id,
  user_id: "owner",
  input,
  context: { busyDates: [] },
  status: "queued",
  created_at: new Date(Date.now() - age).toISOString(),
  expires_at: new Date(Date.now() + 3600000).toISOString(),
});

describe("trip job recovery", () => {
  it.each(["queued", "running"])(
    "persists a stale %s job's terminal failure and clears private input",
    async (status) => {
      const db = database([{ ...queued(181000), status }]);
      expect(await getTripJob(db.admin, id, "owner")).toMatchObject({
        status: "failed",
        error_code: "job_timeout",
      });
      expect(db.rows.get(id)).toMatchObject({
        status: "failed",
        input: null,
        context: null,
      });
      await worker(signedRequest());
      expect(planScenicTripWithFallback).not.toHaveBeenCalled();
    },
  );
  it("never starts an overdue queued job even before it is polled", async () => {
    database([queued(181000)]);
    await worker(signedRequest());
    expect(planScenicTripWithFallback).not.toHaveBeenCalled();
  });
  it("retries saving the same generated result without another paid generation", async () => {
    vi.useFakeTimers();
    const db = database([queued()]);
    db.failCompletions(1);
    const plan = { title: "Already paid itinerary" } as Awaited<
      ReturnType<typeof planScenicTripWithFallback>
    >;
    vi.mocked(planScenicTripWithFallback).mockResolvedValue(plan);
    const task = worker(signedRequest());
    await vi.runAllTimersAsync();
    await task;
    expect(db.rows.get(id)).toMatchObject({
      status: "completed",
      result: plan,
      input: null,
      context: null,
    });
    expect(planScenicTripWithFallback).toHaveBeenCalledTimes(1);
    expect(db.writes.some((write) => write.status === "failed")).toBe(false);
  });
  it("returns a recoverable stable ID when dispatch acknowledgement is lost", async () => {
    const db = database();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("Lost acknowledgement");
      }),
    );
    await expect(
      startTripJob(
        db.admin,
        "owner",
        input,
        undefined,
        "https://capcar.dev",
        id,
      ),
    ).resolves.toBe(id);
    expect(db.rows.get(id)).toMatchObject({
      status: "queued",
      user_id: "owner",
    });
  });
  it("reuses the same job for concurrent and repeated submissions", async () => {
    const db = database();
    const start = () =>
      startTripJob(
        db.admin,
        "owner",
        input,
        undefined,
        "https://capcar.dev",
        id,
      );
    expect(await Promise.all([start(), start()])).toEqual([id, id]);
    expect(await start()).toBe(id);
    expect(db.rows.size).toBe(1);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it("retries an unacknowledged dispatch through polling without creating a new job", async () => {
    vi.useFakeTimers();
    const db = database();
    const fetch = vi
      .fn()
      .mockRejectedValueOnce(new Error("Offline"))
      .mockResolvedValue(new Response(null, { status: 202 }));
    vi.stubGlobal("fetch", fetch);
    await startTripJob(
      db.admin,
      "owner",
      input,
      undefined,
      "https://capcar.dev",
      id,
    );
    await getTripJob(db.admin, id, "owner", "https://capcar.dev");
    expect(fetch).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(16000);
    await getTripJob(db.admin, id, "owner", "https://capcar.dev");
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(db.rows.size).toBe(1);
    expect(JSON.parse(fetch.mock.calls[1][1].body).id).toBe(id);
  });
  it("does not rerun a paid generation when all completion writes fail and later reconciles the crash", async () => {
    vi.useFakeTimers();
    const db = database([queued()]);
    db.failCompletions(3);
    vi.mocked(planScenicTripWithFallback).mockResolvedValue({
      title: "Paid plan",
    } as Awaited<ReturnType<typeof planScenicTripWithFallback>>);
    const task = worker(signedRequest());
    const rejected = expect(task).rejects.toMatchObject({
      message: "Temporary database failure",
    });
    await vi.runAllTimersAsync();
    await rejected;
    expect(db.rows.get(id)?.status).toBe("running");
    await worker(signedRequest());
    expect(planScenicTripWithFallback).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(181000);
    expect(await getTripJob(db.admin, id, "owner")).toMatchObject({
      status: "failed",
      input: null,
      context: null,
    });
  });
  it("never publishes a provider result after the job's terminal deadline", async () => {
    vi.useFakeTimers();
    const db = database([queued()]);
    vi.mocked(planScenicTripWithFallback).mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 181000));
      return { title: "Too late" } as Awaited<
        ReturnType<typeof planScenicTripWithFallback>
      >;
    });
    const task = worker(signedRequest());
    await vi.advanceTimersByTimeAsync(182000);
    await task;
    expect(db.rows.get(id)).toMatchObject({
      status: "failed",
      error_code: "job_timeout",
      input: null,
      context: null,
    });
    expect(db.rows.get(id)?.result).toBeUndefined();
  });
  it("rejects another owner's ID and reuse for a different request", async () => {
    const db = database();
    await startTripJob(
      db.admin,
      "owner",
      input,
      undefined,
      "https://capcar.dev",
      id,
    );
    await expect(
      startTripJob(
        db.admin,
        "other",
        input,
        undefined,
        "https://capcar.dev",
        id,
      ),
    ).rejects.toThrow();
    await expect(
      startTripJob(
        db.admin,
        "owner",
        { ...input, region: "Germany" },
        undefined,
        "https://capcar.dev",
        id,
      ),
    ).rejects.toThrow();
    expect(db.rows.size).toBe(1);
  });
});
