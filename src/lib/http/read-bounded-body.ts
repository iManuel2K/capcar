export class RequestTooLargeError extends Error {
  constructor() {
    super("Request too large.");
    this.name = "RequestTooLargeError";
  }
}

export class BodyReadTimeoutError extends Error {
  constructor() {
    super("Request body timed out.");
    this.name = "BodyReadTimeoutError";
  }
}

/** Bound bytes while streaming: Content-Length can be absent or dishonest. */
export async function readBoundedBytes(
  source: Pick<Request | Response, "headers" | "body">,
  maxBytes: number,
  timeoutMs = 10_000,
): Promise<Uint8Array<ArrayBuffer>> {
  if (Number(source.headers.get("content-length")) > maxBytes) {
    void source.body?.cancel().catch(() => {});
    throw new RequestTooLargeError();
  }
  if (!source.body) return new Uint8Array();

  const reader = source.body.getReader();
  let bytes = 0;
  const chunks: Uint8Array[] = [];
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new BodyReadTimeoutError()), timeoutMs);
  });
  try {
    while (true) {
      const { done, value } = await Promise.race([reader.read(), deadline]);
      if (done) {
        const result = new Uint8Array(bytes);
        let offset = 0;
        for (const chunk of chunks) {
          result.set(chunk, offset);
          offset += chunk.byteLength;
        }
        return result;
      }
      bytes += value.byteLength;
      if (bytes > maxBytes) throw new RequestTooLargeError();
      if (value.byteLength) chunks.push(value);
    }
  } catch (error) {
    // Do not let a stalled producer's cancel hook hold the request open.
    void reader.cancel().catch(() => {});
    throw error;
  } finally {
    clearTimeout(timer);
    reader.releaseLock();
  }
}

export async function readBoundedText(
  source: Pick<Request | Response, "headers" | "body">,
  maxBytes: number,
  timeoutMs = 10_000,
): Promise<string> {
  return new TextDecoder().decode(
    await readBoundedBytes(source, maxBytes, timeoutMs),
  );
}
