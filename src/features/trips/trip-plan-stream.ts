import type { TripPlan } from "./trip-planner";

type Failure = { error: string; code: string; status: number };
type Frame =
  | { type: "progress" }
  | { type: "result"; plan: TripPlan }
  | ({ type: "error" } & Failure);

function waitForPoll(signal?: AbortSignal) {
  signal?.throwIfAborted();
  return new Promise<void>((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
      reject(signal?.reason);
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", abort);
      resolve();
    }, 2000);
    signal?.addEventListener("abort", abort, { once: true });
  });
}

/** Send real progress heartbeats while waiting, with a bounded overall lifetime. */
export function createTripPlanStream(
  work: (signal: AbortSignal) => Promise<TripPlan>,
  failure: (error: unknown) => Failure,
) {
  const abort = new AbortController();
  let cleanup = () => {};
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder();
      let ended = false;
      const send = (frame: Frame) => {
        if (!ended)
          controller.enqueue(encoder.encode(JSON.stringify(frame) + "\n"));
      };
      const finish = () => {
        if (ended) return;
        ended = true;
        cleanup();
        controller.close();
      };
      send({ type: "progress" });
      const heartbeat = setInterval(() => send({ type: "progress" }), 5000);
      const deadline = setTimeout(() => {
        abort.abort();
        send({
          type: "error",
          error: "Trip planning is taking too long. Please try again shortly.",
          code: "planning_timeout",
          status: 504,
        });
        finish();
      }, 52000);
      cleanup = () => {
        ended = true;
        clearInterval(heartbeat);
        clearTimeout(deadline);
      };
      void Promise.resolve()
        .then(() => work(abort.signal))
        .then(
          (plan) => {
            send({ type: "result", plan });
            finish();
          },
          (error) => {
            send({ type: "error", ...failure(error) });
            finish();
          },
        );
    },
    cancel() {
      cleanup();
      abort.abort();
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-store, no-transform",
    },
  });
}

/** Buffered clients keep their existing JSON behavior; streaming clients consume the final frame. */
export async function readTripPlanResponse(
  response: Response,
  options: { signal?: AbortSignal; onTerminal?: () => void } = {},
): Promise<TripPlan | { error: string }> {
  const { signal, onTerminal } = options;
  if (response.status === 202) {
    const { jobId } = await response.json();
    if (typeof jobId !== "string" || !/^[a-f0-9-]{36}$/i.test(jobId))
      throw new Error("The planner could not start. Please try again.");
    const deadline = Date.now() + 180000;
    while (Date.now() < deadline) {
      await waitForPoll(signal);
      let status: Response;
      try {
        status = await fetch(`/api/ai/trips/jobs/${jobId}`, {
          cache: "no-store",
          signal: AbortSignal.any([
            AbortSignal.timeout(10000),
            ...(signal ? [signal] : []),
          ]),
        });
      } catch {
        signal?.throwIfAborted();
        continue;
      }
      if (status.status >= 500) continue;
      let job;
      try {
        job = await status.json();
      } catch {
        signal?.throwIfAborted();
        continue;
      }
      signal?.throwIfAborted();
      if (status.ok && ["failed", "completed"].includes(job.status))
        onTerminal?.();
      if (!status.ok || job.status === "failed")
        return {
          error: job.error || "Trip planning failed. Please try again.",
        };
      if (job.status === "completed") return job.result;
    }
    throw new Error(
      "The AI provider did not finish this trip. Please try again.",
    );
  }
  if (!response.headers?.get("content-type")?.includes("application/x-ndjson"))
    return response.json();
  if (!response.body)
    throw new Error("The planning connection closed. Please try again.");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let pending = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      pending += decoder.decode(value, { stream: !done });
      const lines = pending.split("\n");
      pending = lines.pop() ?? "";
      if (done && pending.trim()) lines.push(pending);
      for (const line of lines) {
        if (!line.trim()) continue;
        const frame = JSON.parse(line) as Frame;
        if (frame.type === "result") return frame.plan;
        if (frame.type === "error") return { error: frame.error };
      }
      if (done)
        throw new Error(
          "The planning connection closed before the route was ready. Please try again.",
        );
    }
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
