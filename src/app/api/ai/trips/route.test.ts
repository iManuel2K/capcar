// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  user: vi.fn(),
  admin: vi.fn(),
  connection: vi.fn(),
  guard: vi.fn(),
  existing: vi.fn(),
  start: vi.fn(),
}));
vi.mock("@/lib/supabase/current-user", () => ({ currentUser: mocks.user }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: mocks.admin }));
vi.mock("@/features/connections/ai-connection", () => ({
  getAiConnection: mocks.connection,
  tripPlannerEnvironmentForConnection: () => ({
    CAPCAR_TRIP_PLANNER_MODE: "gemini",
  }),
}));
vi.mock("@/features/trips/trip-jobs", async (original) => ({
  ...(await original<object>()),
  findTripJobForRequest: mocks.existing,
  startTripJob: mocks.start,
}));
vi.mock("@/lib/api/guard", async (original) => ({
  ...(await original<object>()),
  guardProductApi: mocks.guard,
}));

import { POST } from "./route";
import { TripJobConflictError } from "@/features/trips/trip-jobs";

const id = "11111111-1111-4111-8111-111111111111";
const input = {
  vehicle: "BMW",
  region: "Kosovo",
  duration: 2,
  startDate: "2026-10-30",
  interests: [],
  pace: "scenic",
  useConnectedContext: false,
};
const request = (key = id) =>
  new Request("https://capcar.dev/api/ai/trips", {
    method: "POST",
    headers: {
      origin: "https://capcar.dev",
      "content-type": "application/json",
      prefer: "respond-async",
      "idempotency-key": key,
    },
    body: JSON.stringify(input),
  });

beforeEach(() => {
  vi.resetAllMocks();
  mocks.user.mockResolvedValue({ id: "owner" });
  mocks.admin.mockReturnValue({});
  mocks.connection.mockResolvedValue({ provider: "gemini" });
  mocks.guard.mockResolvedValue({ ok: true });
  mocks.existing.mockResolvedValue(false);
  mocks.start.mockResolvedValue(id);
});

describe("idempotent trip creation API", () => {
  it("passes the caller's stable ID to job creation", async () => {
    const response = await POST(request());
    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({ jobId: id });
    expect(mocks.start).toHaveBeenCalledWith(
      {},
      "owner",
      expect.objectContaining({ inputMode: "places" }),
      undefined,
      "https://capcar.dev",
      id,
    );
  });
  it("resumes existing jobs before provider and rate-limit checks", async () => {
    mocks.existing.mockResolvedValue(true);
    mocks.connection.mockResolvedValue(null);
    const response = await POST(request());
    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({ jobId: id });
    expect(mocks.connection).not.toHaveBeenCalled();
    expect(mocks.guard).not.toHaveBeenCalled();
    expect(mocks.start).not.toHaveBeenCalled();
  });
  it.each(["invalid", ""])(
    "rejects an invalid idempotency key (%s) without creating a job",
    async (key) => {
      expect((await POST(request(key))).status).toBe(400);
      expect(mocks.start).not.toHaveBeenCalled();
    },
  );
  it("reports conflicting reuse without revealing an existing job", async () => {
    mocks.existing.mockRejectedValue(new TripJobConflictError());
    const response = await POST(request());
    expect(response.status).toBe(409);
    expect(await response.json()).toMatchObject({ code: "trip_job_conflict" });
    expect(mocks.start).not.toHaveBeenCalled();
  });
});
