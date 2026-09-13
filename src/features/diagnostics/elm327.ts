export type SerialPortLike = {
  readable: ReadableStream<Uint8Array> | null;
  writable: WritableStream<Uint8Array> | null;
  open(options: { baudRate: number }): Promise<void>;
  close(): Promise<void>;
};
// Headers off / automatic formatting on. Do not guess at unsupported raw CAN frames.
export function obdPayloads(text: string, prefix: string): string[] {
  return text
    .toUpperCase()
    .split(/[\r\n]+/)
    .map((line) => line.replace(/\s/g, ""))
    .filter((line) => /^[0-9A-F]+$/.test(line) && line.startsWith(prefix))
    .map((line) => line.slice(prefix.length));
}
export function decodeStoredCodes(text: string): string[] {
  const payloads = obdPayloads(text, "43");
  if (!payloads.length)
    throw new Error(
      "No valid stored-code response. Check ignition and adapter protocol.",
    );
  const codes = new Set<string>();
  for (const payload of payloads) {
    if (payload.length % 4 !== 0)
      throw new Error(
        "Unsupported multi-frame response. Use scan import for this ECU.",
      );
    for (let i = 0; i < payload.length; i += 4) {
      const word = Number.parseInt(payload.slice(i, i + 4), 16);
      if (!word) continue;
      codes.add(
        `${"PCBU"[word >>> 14]}${(word >>> 12) & 3}${(word & 0xfff).toString(16).padStart(3, "0").toUpperCase()}`,
      );
    }
  }
  return [...codes];
}
export function decodePid(
  text: string,
  pid: "0C" | "0D" | "05",
): number | null {
  const payload = obdPayloads(text, `41${pid}`)[0];
  if (!payload || payload.length < (pid === "0C" ? 4 : 2)) return null;
  const a = parseInt(payload.slice(0, 2), 16),
    b = parseInt(payload.slice(2, 4), 16);
  return pid === "0C" ? (a * 256 + b) / 4 : pid === "05" ? a - 40 : a;
}
export class Elm327 {
  private busy = false;
  private reader?: ReadableStreamDefaultReader<Uint8Array>;
  private closed = false;
  constructor(private port: SerialPortLike) {}
  async command(command: string): Promise<string> {
    if (!/^(ATZ|ATE0|ATL0|ATH0|ATSP0|03|010C|010D|0105)$/.test(command))
      throw new Error("Unsupported command");
    if (this.closed || this.busy || !this.port.readable || !this.port.writable)
      throw new Error("Adapter unavailable");
    this.busy = true;
    const reader = this.port.readable.getReader();
    this.reader = reader;
    const writer = this.port.writable.getWriter();
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      void reader.cancel().catch(() => {});
      void writer.abort().catch(() => {});
    }, 12000);
    try {
      await writer.write(new TextEncoder().encode(`${command}\r`));
      let output = "";
      const decoder = new TextDecoder();
      while (!output.includes(">")) {
        const { value, done } = await reader.read();
        if (timedOut || done)
          throw new Error(
            "Adapter disconnected or timed out. Reconnect and check the ignition.",
          );
        output += decoder.decode(value, { stream: true });
        if (output.length > 16384)
          throw new Error("Unexpected adapter response");
      }
      if (/UNABLE TO CONNECT|CAN ERROR|BUS ERROR|STOPPED|\?/i.test(output))
        throw new Error("Adapter could not communicate with the ECU.");
      return output.replace(/>/g, "");
    } finally {
      clearTimeout(timer);
      reader.releaseLock();
      writer.releaseLock();
      this.reader = undefined;
      this.busy = false;
    }
  }
  async initialize() {
    await this.command("ATZ");
    for (const command of ["ATE0", "ATL0", "ATH0", "ATSP0"]) {
      if (!(await this.command(command)).includes("OK"))
        throw new Error("ELM327 configuration not accepted.");
    }
  }
  async close() {
    this.closed = true;
    await this.reader?.cancel().catch(() => {});
    await this.port.close().catch(() => {});
  }
}
