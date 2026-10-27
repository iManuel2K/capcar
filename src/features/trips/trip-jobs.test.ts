// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  signTripJob,
  verifyTripJob,
  getTripJob,
  startTripJob,
} from "./trip-jobs";
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
function database() {
  const chain = {
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn(),
    then: (resolve: (result: { error: null }) => void) =>
      resolve({ error: null }),
  };
  const admin = { from: vi.fn(() => chain) };
  vi.mocked(createAdminClient).mockReturnValue(
    admin as unknown as ReturnType<typeof createAdminClient>,
  );
  return { chain, admin };
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("AI_CONNECTION_ENCRYPTION_KEY", "test-secret-not-a-user-key");
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
describe("private trip jobs", () => {
  it("binds worker signatures to exactly one job", () => {
    expect(verifyTripJob(id, signTripJob(id))).toBe(true);
    expect(
      verifyTripJob("22222222-2222-4222-8222-222222222222", signTripJob(id)),
    ).toBe(false);
    expect(verifyTripJob(id, "invalid")).toBe(false);
  });
  it("rejects unauthenticated worker requests before reading the database", async () => {
    await worker(
      new Request("https://capcar.dev", {
        method: "POST",
        body: JSON.stringify({ id, signature: "invalid" }),
      }),
    );
    expect(createAdminClient).not.toHaveBeenCalled();
    expect(planScenicTripWithFallback).not.toHaveBeenCalled();
  });
  it("claims queued jobs once, loads their owner's AI, and saves the result", async () => {
    const { chain } = database();
    chain.maybeSingle
      .mockResolvedValueOnce({
        data: {
          id,
          user_id: "owner",
          input: {
            vehicle: "7 seater",
            region: "Kosovo",
            duration: 2,
            startDate: "2026-10-30",
            interests: [],
            pace: "scenic",
          },
          context: null,
        },
        error: null,
      })
      .mockResolvedValueOnce({ data: null, error: null });
    const result = { title: "Provider itinerary" } as Awaited<
      ReturnType<typeof planScenicTripWithFallback>
    >;
    vi.mocked(planScenicTripWithFallback).mockResolvedValue(result);
    const makeRequest = () =>
      new Request("https://capcar.dev", {
        method: "POST",
        body: JSON.stringify({ id, signature: signTripJob(id) }),
      });
    await worker(makeRequest());
    await worker(makeRequest());
    expect(chain.eq).toHaveBeenCalledWith("status", "queued");
    expect(planScenicTripWithFallback).toHaveBeenCalledTimes(1);
    expect(chain.update).toHaveBeenCalledWith({
      status: "completed",
      result,
      input: null,
      context: null,
    });
  });
  it("scopes status lookups to the signed-in owner and hides expired/missing jobs", async () => {
    const { chain, admin } = database();
    chain.maybeSingle.mockResolvedValue({ data: null, error: null });
    expect(
      await getTripJob(
        admin as unknown as ReturnType<typeof createAdminClient>,
        id,
        "owner",
      ),
    ).toBeNull();
    expect(chain.eq).toHaveBeenCalledWith("user_id", "owner");
    expect(chain.gt).toHaveBeenCalledWith("expires_at", expect.any(String));
  });
});

describe("background dispatch acknowledgement", () => {
  function dispatchDatabase() {
    const chain = {
      delete: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      then: (resolve: (result: { error: null }) => void) =>
        resolve({ error: null }),
    };
    return {
      chain,
      admin: { from: vi.fn(() => chain) } as unknown as Parameters<
        typeof startTripJob
      >[0],
    };
  }
  const input = {
    inputMode: "prompt",
    useConnectedContext: false,
    vehicle: "BMW 318i",
    region: "Kosovo",
    duration: 2,
    startDate: "2026-10-30",
    interests: [],
    pace: "scenic",
  } as Parameters<typeof startTripJob>[2];
  it("returns the existing job for polling when the worker acknowledgement is lost", async () => {
    const { chain, admin } = dispatchDatabase();
    const fetch = vi.fn().mockRejectedValue(new TypeError("connection closed"));
    vi.stubGlobal("fetch", fetch);
    const jobId = await startTripJob(
      admin,
      "owner",
      input,
      undefined,
      "https://capcar.dev",
    );
    expect(verifyTripJob(jobId, signTripJob(jobId))).toBe(true);
    expect(chain.update).not.toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it("marks a rejected queued dispatch failed, without changing running jobs", async () => {
    const { chain, admin } = dispatchDatabase();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 503 })),
    );
    const jobId = await startTripJob(
      admin,
      "owner",
      input,
      undefined,
      "https://capcar.dev",
    );
    expect(chain.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "failed",
        error_code: "dispatch_failed",
        input: null,
        context: null,
      }),
    );
    expect(chain.eq).toHaveBeenCalledWith("id", jobId);
    expect(chain.eq).toHaveBeenCalledWith("status", "queued");
  });
});
