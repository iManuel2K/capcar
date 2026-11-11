import type { ReviewFrame } from "./contracts";
export class ClipError extends Error {}
const supported = new Set(["video/mp4", "video/webm", "video/quicktime"]);

export function drivingSampleTimes(duration: number, focusTime?: number) {
  const count = Math.min(12, Math.max(2, Math.ceil(duration / 2)));
  if (focusTime === undefined)
    return Array.from(
      { length: count },
      (_, i) => ((i + 0.5) * duration) / count,
    );

  // Keep the marked instant and nearby context, with wider coverage elsewhere.
  const last = duration - 0.02;
  const nearby = [-1.5, -0.4, 0, 0.4, 1.5].map((offset) =>
    Math.max(0, Math.min(last, focusTime + offset)),
  );
  const wide = Array.from(
    { length: 12 },
    (_, i) => ((i + 0.5) * duration) / 12,
  ).filter((time) =>
    nearby.every((eventTime) => Math.abs(time - eventTime) >= 0.25),
  );
  const remaining = 12 - new Set(nearby).size;
  const coverage =
    wide.length > remaining
      ? Array.from(
          { length: remaining },
          (_, i) => wide[Math.floor(((i + 0.5) * wide.length) / remaining)],
        )
      : wide;
  return [...new Set([...nearby, ...coverage])].sort((a, b) => a - b);
}

export async function sampleDrivingClip(
  file: File,
  signal: AbortSignal,
  progress: (value: number) => void,
  focusTime?: number,
) {
  if (
    !supported.has(file.type) ||
    file.size > 150 * 1024 * 1024 ||
    file.size === 0
  )
    throw new ClipError("file");
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  const url = URL.createObjectURL(file);
  const waitFor = (event: string) =>
    new Promise<void>((resolve, reject) => {
      const clean = () => {
        clearTimeout(timer);
        video.removeEventListener(event, done);
        video.removeEventListener("error", fail);
        signal.removeEventListener("abort", abort);
      };
      const done = () => {
        clean();
        resolve();
      };
      const fail = () => {
        clean();
        reject(new ClipError("decode"));
      };
      const abort = () => {
        clean();
        reject(new DOMException("Aborted", "AbortError"));
      };
      const timer = setTimeout(fail, 15_000);
      video.addEventListener(event, done, { once: true });
      video.addEventListener("error", fail, { once: true });
      signal.addEventListener("abort", abort, { once: true });
      if (signal.aborted) abort();
    });
  try {
    const loaded = waitFor("loadeddata");
    video.src = url;
    await loaded;
    const duration = video.duration;
    if (!Number.isFinite(duration) || duration < 1 || duration > 60)
      throw new ClipError("duration");
    if (!video.videoWidth || !video.videoHeight) throw new ClipError("decode");
    const canvas = document.createElement("canvas");
    const scale = Math.min(
      1,
      640 / Math.max(video.videoWidth, video.videoHeight),
    );
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const context = canvas.getContext("2d");
    if (!context) throw new ClipError("decode");
    const times = drivingSampleTimes(duration, focusTime);
    const frames: ReviewFrame[] = [];
    for (const time of times) {
      signal.throwIfAborted();
      if (video.currentTime !== time) {
        const sought = waitFor("seeked");
        video.currentTime = time;
        await sought;
      }
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const image = canvas.toDataURL("image/jpeg", 0.65);
      if (image.length > 180_000) throw new ClipError("decode");
      frames.push({ time, image });
      progress(Math.round((frames.length / times.length) * 100));
    }
    return { duration, frames };
  } finally {
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(url);
  }
}
