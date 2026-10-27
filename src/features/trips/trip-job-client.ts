import {
  tripPlannerRequestSchema,
  type TripPlannerRequest,
} from "./trip-planner";
import { readTripPlanResponse } from "./trip-plan-stream";

type PendingTripJob = {
  id: string;
  input: TripPlannerRequest;
  createdAt: number;
};
const storageKey = (ownerId: string) => `capcar:trip-job:${ownerId}`;

export function readPendingTripJob(ownerId: string): PendingTripJob | null {
  try {
    const value = JSON.parse(
      localStorage.getItem(storageKey(ownerId)) || "null",
    );
    if (
      !value ||
      typeof value.id !== "string" ||
      !/^[a-f0-9-]{36}$/i.test(value.id) ||
      !Number.isFinite(value.createdAt) ||
      Date.now() - value.createdAt > 3600000
    )
      return null;
    const input = tripPlannerRequestSchema.safeParse(value.input);
    return input.success
      ? { id: value.id, input: input.data, createdAt: value.createdAt }
      : null;
  } catch {
    return null;
  }
}

function savePending(
  ownerId: string | undefined,
  pending: PendingTripJob | null,
) {
  if (!ownerId) return;
  try {
    if (pending)
      localStorage.setItem(storageKey(ownerId), JSON.stringify(pending));
    else localStorage.removeItem(storageKey(ownerId));
  } catch {
    // Planning still works when browser storage is disabled; reload recovery cannot.
  }
}

function clearPending(ownerId: string | undefined, id: string) {
  if (ownerId && readPendingTripJob(ownerId)?.id === id)
    savePending(ownerId, null);
}

export async function requestTripPlan(
  input: TripPlannerRequest,
  ownerId?: string,
  signal?: AbortSignal,
) {
  signal?.throwIfAborted();
  input = tripPlannerRequestSchema.parse(input);
  const previous = ownerId ? readPendingTripJob(ownerId) : null;
  if (previous && JSON.stringify(previous.input) !== JSON.stringify(input))
    throw new Error(
      "Your previous trip is still being recovered. Retry it before starting another trip.",
    );
  const pending = previous ?? {
    id: crypto.randomUUID(),
    input,
    createdAt: Date.now(),
  };
  savePending(ownerId, pending);
  let response: Response;
  try {
    response = await fetch("/api/ai/trips", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/x-ndjson",
        prefer: "respond-async",
        "idempotency-key": pending.id,
      },
      body: JSON.stringify(input),
      signal: AbortSignal.any([
        AbortSignal.timeout(15000),
        ...(signal ? [signal] : []),
      ]),
    });
  } catch {
    signal?.throwIfAborted();
    // The request may already have started a paid job. Recover that ID rather than resubmit.
    response = Response.json({ jobId: pending.id }, { status: 202 });
  }
  if (response.status !== 202) {
    if (response.ok || (!previous && response.status < 500))
      clearPending(ownerId, pending.id);
    return readTripPlanResponse(response, { signal });
  }
  return readTripPlanResponse(response, {
    signal,
    onTerminal: () => clearPending(ownerId, pending.id),
  });
}

export async function resumeTripPlan(ownerId: string, signal?: AbortSignal) {
  const pending = readPendingTripJob(ownerId);
  return pending ? requestTripPlan(pending.input, ownerId, signal) : null;
}
