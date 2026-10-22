// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  BodyReadTimeoutError,
  readBoundedBytes,
  readBoundedText,
  RequestTooLargeError,
} from "@/lib/http/read-bounded-body";

describe("bounded body streaming", () => {
  afterEach(() => vi.useRealTimers());

  it("preserves binary multipart bytes without text decoding", async () => {
    const bytes = new Uint8Array([255, 216, 0, 254, 255, 217]);
    await expect(
      readBoundedBytes(new Response(bytes), bytes.length),
    ).resolves.toEqual(bytes);
  });

  it.each([undefined, "1"])(
    "cancels an oversized stream with declared length %s",
    async (length) => {
      const cancel = vi.fn();
      const body = new ReadableStream<Uint8Array<ArrayBuffer>>({
        start(controller) {
          controller.enqueue(new Uint8Array(33));
        },
        cancel,
      });
      const headers = new Headers(length ? { "content-length": length } : {});
      await expect(
        readBoundedText({ body, headers }, 32),
      ).rejects.toBeInstanceOf(RequestTooLargeError);
      expect(cancel).toHaveBeenCalledOnce();
      expect(body.locked).toBe(false);
    },
  );

  it("rejects a declared oversized body before reading", async () => {
    const cancel = vi.fn();
    const body = new ReadableStream<Uint8Array<ArrayBuffer>>({ cancel });
    await expect(
      readBoundedText(
        { body, headers: new Headers({ "content-length": "33" }) },
        32,
      ),
    ).rejects.toBeInstanceOf(RequestTooLargeError);
    expect(cancel).toHaveBeenCalledOnce();
  });

  it("counts UTF-8 bytes and preserves characters split across chunks", async () => {
    const bytes = new TextEncoder().encode("京都");
    const body = new ReadableStream<Uint8Array<ArrayBuffer>>({
      start(controller) {
        controller.enqueue(bytes.slice(0, 2));
        controller.enqueue(bytes.slice(2));
        controller.close();
      },
    });
    await expect(
      readBoundedText({ body, headers: new Headers() }, 6),
    ).resolves.toBe("京都");
    await expect(
      readBoundedText(new Response("京都"), 5),
    ).rejects.toBeInstanceOf(RequestTooLargeError);
  });

  it("times out a stalled body even when its cancellation never finishes", async () => {
    vi.useFakeTimers();
    const cancel = vi.fn(() => new Promise<void>(() => {}));
    const body = new ReadableStream<Uint8Array<ArrayBuffer>>({ cancel });
    const pending = readBoundedText({ body, headers: new Headers() }, 32, 100);
    const assertion =
      expect(pending).rejects.toBeInstanceOf(BodyReadTimeoutError);
    await vi.advanceTimersByTimeAsync(100);
    await assertion;
    expect(cancel).toHaveBeenCalledOnce();
    expect(body.locked).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });
});
