import type { ReviewFrame } from "./contracts";
export class ClipError extends Error {}
const supported = new Set(["video/mp4", "video/webm", "video/quicktime"]);

export async function sampleDrivingClip(
  file: File,
  signal: AbortSignal,
  progress: (value: number) => void,
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
    const count = Math.min(12, Math.max(2, Math.ceil(duration / 2)));
    const frames: ReviewFrame[] = [];
    for (let i = 0; i < count; i++) {
      signal.throwIfAborted();
      const time = ((i + 0.5) * duration) / count;
      const sought = waitFor("seeked");
      video.currentTime = time;
      await sought;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const image = canvas.toDataURL("image/jpeg", 0.65);
      if (image.length > 180_000) throw new ClipError("decode");
      frames.push({ time, image });
      progress(Math.round(((i + 1) / count) * 100));
    }
    return { duration, frames };
  } finally {
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(url);
  }
}
