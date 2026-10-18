import { readdir, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
const directory = join(process.cwd(), "public/sounds");
const ffmpeg = process.env.FFMPEG_PATH || "ffmpeg";
const ffprobe = process.env.FFPROBE_PATH || "ffprobe";
const durations = {};
for (const file of await readdir(directory)) {
  if (!/\.(ogg|oga|opus|wav)$/i.test(file) || file.includes("avertisseur"))
    continue;
  const input = join(directory, file);
  const output = input.replace(/\.[^.]+$/, ".mp3");
  if (!(await stat(output).catch(() => null)))
    execFileSync(
      ffmpeg,
      [
        "-v",
        "error",
        "-i",
        input,
        "-map_metadata",
        "-1",
        "-vn",
        "-c:a",
        "libmp3lame",
        "-b:a",
        "128k",
        output,
      ],
      { stdio: "pipe" },
    );
  const duration = Number(
    execFileSync(
      ffprobe,
      [
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        output,
      ],
      { encoding: "utf8" },
    ).trim(),
  );
  if (!Number.isFinite(duration) || duration <= 0)
    throw new Error(`Invalid duration: ${file}`);
  durations[file.replace(/\.[^.]+$/, "")] = Math.round(duration);
}
await writeFile(
  join(process.cwd(), "src/features/visualizer/sound-durations.json"),
  `${JSON.stringify(durations, null, 2)}\n`,
);
console.log(
  `Verified and prepared ${Object.keys(durations).length} phone-compatible audio files.`,
);
