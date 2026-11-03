import { afterEach, describe, expect, it, vi } from "vitest";
import { createCopilotStream, readCopilotResponse } from "./chat-transport";
const reply = {
  provider: "Test",
  source: "external" as const,
  answer: "The actual reply",
  evidence: [],
  warnings: [],
  nextActions: [],
};
const failure = () => ({
  error: "Provider failed",
  code: "provider_failure",
  status: 502,
});
afterEach(() => vi.useRealTimers());
describe("chat transport", () => {
  it("starts immediately and delivers the real reply after the old timeout", async () => {
    vi.useFakeTimers();
    const response = createCopilotStream(
      () => new Promise((resolve) => setTimeout(() => resolve(reply), 40_000)),
      failure,
    );
    const result = readCopilotResponse(response);
    await vi.advanceTimersByTimeAsync(40_000);
    expect(await result).toEqual(reply);
    expect(vi.getTimerCount()).toBe(0);
  });
  it("sends real provider failures as terminal error frames", async () => {
    await expect(
      readCopilotResponse(
        createCopilotStream(async () => {
          throw new Error("private upstream message");
        }, failure),
      ),
    ).rejects.toThrow("Provider failed");
  });
  it("ends stalled work at its deadline and aborts generation", async () => {
    vi.useFakeTimers();
    let signal: AbortSignal | undefined;
    const result = readCopilotResponse(
      createCopilotStream((input) => {
        signal = input;
        return new Promise(() => {});
      }, failure),
    );
    const assertion = expect(result).rejects.toThrow("taking too long");
    await vi.advanceTimersByTimeAsync(52_000);
    await assertion;
    expect(signal?.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });
  it("aborts work and clears heartbeats when the browser disconnects", async () => {
    vi.useFakeTimers();
    let signal: AbortSignal | undefined;
    const response = createCopilotStream((input) => {
      signal = input;
      return new Promise(() => {});
    }, failure);
    await Promise.resolve();
    await response.body!.cancel();
    expect(signal?.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });
  it("reports closed streams and HTML gateway failures without JSON syntax errors", async () => {
    const closed = new Response(
      new ReadableStream({
        start(controller) {
          controller.close();
        },
      }),
      { headers: { "content-type": "application/x-ndjson" } },
    );
    await expect(readCopilotResponse(closed)).rejects.toThrow(
      "connection closed",
    );
    await expect(
      readCopilotResponse(
        new Response("<html>Bad gateway</html>", { status: 502 }),
      ),
    ).rejects.toThrow("connection failed");
  });
});
