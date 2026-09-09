"use client";
import { useEffect, useRef, useState } from "react";
import { FileDropzone } from "@/components/ui/file-dropzone";

type Clip = { url: string; name: string };
export function AudioComparison() {
  const [clips, setClips] = useState<
    Partial<Record<"stock" | "modified", Clip>>
  >({});
  const [message, setMessage] = useState("");
  const players = useRef<
    Partial<Record<"stock" | "modified", HTMLAudioElement | null>>
  >({});
  const urls = useRef(new Set<string>());
  useEffect(() => {
    const owned = urls.current;
    return () => {
      owned.forEach((url) => URL.revokeObjectURL(url));
      owned.clear();
    };
  }, []);
  function clear(side: "stock" | "modified") {
    players.current[side]?.pause();
    const clip = clips[side];
    if (clip) {
      URL.revokeObjectURL(clip.url);
      urls.current.delete(clip.url);
    }
    setClips((current) => ({ ...current, [side]: undefined }));
  }
  return (
    <section className="rounded-2xl border border-current/20 p-5 sm:p-8">
      <h2 className="text-2xl font-medium">Stock / modified · A/B listening</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6">
        Compare your own recordings locally. Choose matching engines, recording
        positions and driving conditions. Playback starts at 25% volume. This
        comparison does not measure loudness, legality or performance.
      </p>
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {(["stock", "modified"] as const).map((side) => (
          <div
            key={side}
            className="min-w-0 rounded-xl border border-current/20 p-4"
          >
            <div>
              <p className="font-medium">
                {side === "stock" ? "Stock recording" : "Modified recording"}
              </p>
              <div className="mt-4">
                <FileDropzone
                  compact
                  accept="audio/mpeg,audio/wav,audio/ogg,audio/mp4,.mp3,.wav,.ogg,.m4a"
                  label={`Choose ${side} audio`}
                  inputLabel={
                    side === "stock" ? "Stock recording" : "Modified recording"
                  }
                  description="Drop MP3, WAV, Ogg or M4A · up to 30 MB"
                  onFile={(file) => {
                    if (
                      ![
                        "audio/mpeg",
                        "audio/wav",
                        "audio/x-wav",
                        "audio/ogg",
                        "audio/mp4",
                      ].includes(file.type) ||
                      file.size > 30 * 1024 * 1024
                    ) {
                      setMessage(
                        "Choose MP3, WAV, Ogg or M4A audio up to 30 MB.",
                      );
                      return;
                    }
                    clear(side);
                    const url = URL.createObjectURL(file);
                    urls.current.add(url);
                    setClips((current) => ({
                      ...current,
                      [side]: { url, name: file.name },
                    }));
                    setMessage("");
                  }}
                />
              </div>
            </div>
            {clips[side] && (
              <>
                <p className="mt-3 truncate text-sm">
                  {clips[side]?.name} · personal, unverified
                </p>
                <audio
                  aria-label={`${side} recording preview`}
                  className="mt-4 w-full"
                  ref={(element) => {
                    players.current[side] = element;
                    if (element) element.volume = 0.25;
                  }}
                  src={clips[side]?.url}
                  controls
                  preload="metadata"
                  onPlay={() =>
                    players.current[
                      side === "stock" ? "modified" : "stock"
                    ]?.pause()
                  }
                  onError={() =>
                    setMessage(
                      "This recording could not be decoded. Try a different format.",
                    )
                  }
                />
                <button
                  className="mt-3 min-h-11 underline"
                  onClick={() => clear(side)}
                >
                  Clear {side}
                </button>
              </>
            )}
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm leading-6">
        Files stay in this tab and are never uploaded. Use recordings you own or
        have permission to use. Public vehicle recordings remain unavailable
        until distribution rights and setup metadata are checked.
      </p>
      <p role="status" className="mt-3 text-sm">
        {message}
      </p>
    </section>
  );
}
