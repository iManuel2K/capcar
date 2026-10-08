import { describe, expect, it } from "vitest";
import { isSupportedAudio, MAX_AUDIO_BYTES } from "./audio-files";

describe("personal audio validation", () => {
  it.each([
    ["take.mp3", "audio/mpeg"],
    ["take.WAV", "audio/x-wav"],
    ["take.ogg", "application/ogg"],
    ["take.m4a", "audio/x-m4a"],
    ["take.mp3", ""],
    ["take.m4a", "application/octet-stream"],
  ])("accepts %s / %s from common file pickers", (name, type) => {
    expect(isSupportedAudio({ name, type, size: 1 })).toBe(true);
  });
  it.each([
    ["take.txt", "audio/mpeg", 4],
    ["take.mp3", "text/html", 4],
    ["take.mp3", "audio/mpeg", 0],
    ["take.mp3", "audio/mpeg", MAX_AUDIO_BYTES + 1],
  ])("rejects unsupported, empty and oversized files", (name, type, size) => {
    expect(isSupportedAudio({ name, type, size })).toBe(false);
  });
  it("accepts the documented size boundary", () => {
    expect(
      isSupportedAudio({ name: "take.mp3", type: "", size: MAX_AUDIO_BYTES }),
    ).toBe(true);
  });
});
