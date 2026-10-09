export const MAX_AUDIO_BYTES = 30 * 1024 * 1024;
export const AUDIO_ACCEPT =
  ".mp3,.wav,.ogg,.m4a,audio/mpeg,audio/wav,audio/ogg,audio/mp4";

/** File pickers on iOS and desktop may omit MIME types or use aliases. */
export function isSupportedAudio(file: Pick<File, "name" | "type" | "size">) {
  const supportedType =
    !file.type ||
    file.type === "application/octet-stream" ||
    [
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/x-wav",
      "audio/wave",
      "audio/vnd.wave",
      "audio/ogg",
      "application/ogg",
      "audio/mp4",
      "audio/x-m4a",
    ].includes(file.type.toLowerCase());
  return (
    /\.(mp3|wav|ogg|m4a)$/i.test(file.name) &&
    supportedType &&
    file.size > 0 &&
    file.size <= MAX_AUDIO_BYTES
  );
}

/** Coordinate only CapCar players, never unrelated media or embedded viewers. */
export function pauseOtherStudioAudio(current?: HTMLAudioElement) {
  document
    .querySelectorAll<HTMLAudioElement>("audio[data-capcar-audio]")
    .forEach((audio) => {
      if (audio !== current) audio.pause();
    });
}
