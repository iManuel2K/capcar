import { copilotResponseSchema, type CopilotResponse } from "./copilot-schema";
type Failure = { error: string; code: string; status: number };
type Frame =
  | { type: "progress" }
  | { type: "result"; response: CopilotResponse }
  | ({ type: "error" } & Failure);

/** Heartbeats keep the connection alive; only the actual provider reply is a result. */
export function createCopilotStream(
  work: (signal: AbortSignal) => Promise<CopilotResponse>,
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
          error:
            "Your AI is taking too long. Your question is kept; please try again.",
          code: "chat_timeout",
          status: 504,
        });
        finish();
      }, 52_000);
      cleanup = () => {
        ended = true;
        clearInterval(heartbeat);
        clearTimeout(deadline);
      };
      void Promise.resolve()
        .then(() => work(abort.signal))
        .then(
          (response) => {
            send({ type: "result", response });
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
      "X-Accel-Buffering": "no",
    },
  });
}

export async function readCopilotResponse(
  response: Response,
): Promise<CopilotResponse> {
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(
      typeof error?.error === "string"
        ? error.error
        : "The chat connection failed. Your question is kept; please try again.",
    );
  }
  if (!response.headers.get("content-type")?.includes("application/x-ndjson"))
    return copilotResponseSchema.parse(await response.json());
  const reader = response.body?.getReader();
  if (!reader)
    throw new Error("The chat connection closed before the answer arrived.");
  const decoder = new TextDecoder();
  let pending = "";
  let bytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done)
        throw new Error(
          "The chat connection closed before the answer arrived. Your question is kept.",
        );
      bytes += value.byteLength;
      if (bytes > 256_000)
        throw new Error(
          "The AI reply was too large. Please ask for a shorter answer.",
        );
      pending += decoder.decode(value, { stream: true });
      let newline;
      while ((newline = pending.indexOf("\n")) >= 0) {
        const line = pending.slice(0, newline);
        pending = pending.slice(newline + 1);
        if (!line.trim()) continue;
        const frame = JSON.parse(line) as Frame;
        if (frame.type === "error") throw new Error(frame.error);
        if (frame.type === "result")
          return copilotResponseSchema.parse(frame.response);
      }
    }
  } finally {
    void reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
