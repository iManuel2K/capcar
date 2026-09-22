import { createHash } from "node:crypto";
import { licensedSounds } from "@/features/visualizer/licensed-sounds";
export const runtime = "nodejs";
const downloads = new Map<string, Promise<Uint8Array>>();
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const sound = licensedSounds.find((item) => item.id === id);
  if (!sound) return new Response(null, { status: 404 });
  try {
    let pending = downloads.get(id);
    if (!pending) {
      pending = (async () => {
        // Commons stores the original under an MD5 filename directory.
        const hash = createHash("md5").update(sound.file).digest("hex");
        const path =
          sound.path ||
          `${hash[0]}/${hash.slice(0, 2)}/${encodeURIComponent(sound.file)}`;
        const response = await fetch(
          `https://upload.wikimedia.org/wikipedia/commons/${path}`,
          {
            signal: AbortSignal.timeout(10000),
            redirect: "error",
            headers: {
              "User-Agent":
                "CapCar/1.0 (licensed audio; capcar-im.netlify.app)",
            },
          },
        );
        if (!response.ok || !response.body)
          throw new Error("Source unavailable");
        const reader = response.body.getReader();
        const chunks: Uint8Array[] = [];
        let size = 0;
        try {
          while (true) {
            const part = await reader.read();
            if (part.done) break;
            size += part.value.byteLength;
            if (size > 512000) {
              await reader.cancel();
              throw new Error("Oversized source");
            }
            chunks.push(part.value);
          }
        } finally {
          reader.releaseLock();
        }
        const data = Buffer.concat(chunks);
        if (
          data.subarray(0, 4).toString() !== "OggS" ||
          createHash("sha1").update(data).digest("hex") !== sound.sha1
        )
          throw new Error("Source integrity changed");
        return new Uint8Array(data);
      })();
      downloads.set(id, pending);
    }
    const bytes = await pending;
    const headers: Record<string, string> = {
      "Content-Type": "audio/ogg",
      "Cache-Control": "public, max-age=86400, s-maxage=604800",
      "Accept-Ranges": "bytes",
      "X-Content-Type-Options": "nosniff",
    };
    const range = request.headers.get("range");
    let start = 0,
      end = bytes.length - 1;
    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (!match || (!match[1] && !match[2]))
        return new Response(null, {
          status: 416,
          headers: { "Content-Range": `bytes */${bytes.length}` },
        });
      if (match[1]) {
        start = Number(match[1]);
        if (match[2]) end = Math.min(Number(match[2]), end);
      } else start = Math.max(0, bytes.length - Number(match[2]));
      if (
        !Number.isSafeInteger(start) ||
        !Number.isSafeInteger(end) ||
        start > end ||
        start < 0
      )
        return new Response(null, {
          status: 416,
          headers: { "Content-Range": `bytes */${bytes.length}` },
        });
      headers["Content-Range"] = `bytes ${start}-${end}/${bytes.length}`;
    }
    headers["Content-Length"] = String(end - start + 1);
    return new Response(bytes.slice(start, end + 1), {
      status: range ? 206 : 200,
      headers,
    });
  } catch {
    downloads.delete(id);
    return new Response("Recording temporarily unavailable", {
      status: 503,
      headers: { "Cache-Control": "no-store", "Retry-After": "30" },
    });
  }
}
