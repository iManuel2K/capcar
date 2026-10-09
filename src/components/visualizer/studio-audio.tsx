"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, RotateCw, Volume2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { pauseOtherStudioAudio } from "@/features/visualizer/audio-files";

const MASTER_VOLUME_KEY = "capcar.sound-studio.master-volume";
const MASTER_VOLUME_EVENT = "capcar:master-volume";

type Props = {
  src: string;
  fallback?: string;
  label: string;
  preload?: "none" | "metadata";
};

function initialVolume() {
  if (typeof window === "undefined") return 0.25;
  try {
    const raw = localStorage.getItem(MASTER_VOLUME_KEY);
    if (raw === null) return 0.25;
    const stored = Number(raw);
    return Number.isFinite(stored) && stored >= 0 && stored <= 1
      ? stored
      : 0.25;
  } catch {
    return 0.25;
  }
}

export function MasterVolume() {
  const studio = useTranslations("StudioPolish");
  const [volume, setVolume] = useState(0.25);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() =>
      setVolume(initialVolume()),
    );
    return () => window.cancelAnimationFrame(frame);
  }, []);
  function change(next: number) {
    setVolume(next);
    try {
      localStorage.setItem(MASTER_VOLUME_KEY, String(next));
    } catch {
      // The volume still applies for this visit when storage is unavailable.
    }
    document
      .querySelectorAll<HTMLAudioElement>("audio[data-capcar-audio]")
      .forEach((audio) => {
        audio.volume = next;
      });
    window.dispatchEvent(
      new CustomEvent<number>(MASTER_VOLUME_EVENT, { detail: next }),
    );
  }
  const degrees = -135 + volume * 270;
  return (
    <div className="grid gap-5 rounded-[1.75rem] border border-white/10 bg-[#091d20] p-5 shadow-[inset_0_1px_rgba(255,255,255,.05)] sm:grid-cols-[auto_1fr] sm:items-center sm:p-6">
      <div className="flex items-center gap-4">
        <div
          aria-hidden="true"
          className="relative grid size-24 shrink-0 place-items-center rounded-full border border-white/10 bg-[radial-gradient(circle_at_35%_28%,#335254_0,#142f32_48%,#071719_100%)] shadow-[0_14px_30px_rgba(0,0,0,.35),inset_0_1px_rgba(255,255,255,.15)]"
        >
          <span
            className="absolute h-9 w-0.5 origin-bottom rounded-full bg-[#ff746c] shadow-[0_0_12px_rgba(255,116,108,.8)]"
            style={{ transform: `translateY(-18px) rotate(${degrees}deg)` }}
          />
          <span className="size-3 rounded-full bg-[#cfaa96] shadow-[0_0_14px_rgba(207,170,150,.6)]" />
        </div>
        <div>
          <p className="text-[10px] font-medium tracking-[.22em] text-[#cfaa96] uppercase">
            {studio("masterVolume")}
          </p>
          <p className="mt-1 font-mono text-3xl tracking-tight tabular-nums">
            {Math.round(volume * 100)}
          </p>
        </div>
      </div>
      <label className="block text-xs text-[#e8e6d7]/60">
        <span className="sr-only">{studio("masterVolume")}</span>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={Math.round(volume * 100)}
          aria-label={studio("masterVolume")}
          onChange={(event) => change(Number(event.target.value) / 100)}
          className="h-2 w-full cursor-pointer accent-[#ff746c]"
        />
        <span className="mt-3 flex justify-between font-mono text-[10px] tracking-[.16em] uppercase">
          <span>Min</span>
          <span>{studio("oneControl")}</span>
          <span>Max</span>
        </span>
      </label>
    </div>
  );
}

/** Remount the session when its source changes, including fallback/error state. */
export function StudioAudio(props: Props) {
  return (
    <AudioSession key={`${props.src}:${props.fallback ?? ""}`} {...props} />
  );
}

function time(value: number) {
  if (!Number.isFinite(value)) return "0:00";
  const whole = Math.max(0, Math.floor(value));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

function AudioSession({ src, fallback, label, preload = "none" }: Props) {
  const t = useTranslations("SoundUi");
  const studio = useTranslations("StudioPolish");
  const player = useRef<HTMLAudioElement>(null);
  const [useFallback, setUseFallback] = useState(false);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  useEffect(() => {
    const audio = player.current;
    if (audio) audio.volume = initialVolume();
    const stop = () => audio?.pause();
    const volume = (event: Event) => {
      if (audio) audio.volume = (event as CustomEvent<number>).detail;
    };
    window.addEventListener("pagehide", stop);
    window.addEventListener(MASTER_VOLUME_EVENT, volume);
    return () => {
      stop();
      window.removeEventListener("pagehide", stop);
      window.removeEventListener(MASTER_VOLUME_EVENT, volume);
    };
  }, [useFallback, retry]);
  function seek(amount: number) {
    const audio = player.current;
    if (!audio) return;
    audio.currentTime = Math.min(
      Number.isFinite(audio.duration) ? audio.duration : Infinity,
      Math.max(0, audio.currentTime + amount),
    );
    setCurrent(audio.currentTime);
  }
  async function toggle() {
    const audio = player.current;
    if (!audio) return;
    if (!audio.paused) {
      audio.pause();
      return;
    }
    try {
      await audio.play();
    } catch {
      setFailed(true);
    }
  }
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-[#091d20] p-3 shadow-[inset_0_1px_rgba(255,255,255,.04)]">
      <audio
        key={retry}
        data-capcar-audio
        ref={player}
        aria-label={label}
        preload={preload}
        src={useFallback ? fallback : src}
        onPlay={(event) => {
          pauseOtherStudioAudio(event.currentTarget);
          setPlaying(true);
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(event) => setCurrent(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onError={() => {
          if (fallback && !useFallback) setUseFallback(true);
          else setFailed(true);
        }}
        onCanPlay={() => setFailed(false)}
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={studio("rewind")}
          onClick={() => seek(-10)}
          className="grid size-10 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-[#e8e6d7]/75 transition hover:border-white/25 hover:bg-white/10"
        >
          <RotateCcw aria-hidden="true" className="size-4" />
        </button>
        <button
          type="button"
          aria-label={playing ? studio("pause") : studio("play")}
          onClick={toggle}
          className="grid size-13 shrink-0 place-items-center rounded-full bg-[#ff746c] text-[#071719] shadow-[0_8px_24px_rgba(255,116,108,.22)] transition hover:scale-[1.03] hover:bg-[#ff8b84] motion-reduce:hover:scale-100"
        >
          {playing ? (
            <Pause aria-hidden="true" className="size-5 fill-current" />
          ) : (
            <Play aria-hidden="true" className="ml-0.5 size-5 fill-current" />
          )}
        </button>
        <button
          type="button"
          aria-label={studio("forward")}
          onClick={() => seek(10)}
          className="grid size-10 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-[#e8e6d7]/75 transition hover:border-white/25 hover:bg-white/10"
        >
          <RotateCw aria-hidden="true" className="size-4" />
        </button>
        <div className="min-w-0 flex-1 pl-1">
          <input
            type="range"
            min="0"
            max={duration || 0}
            step="0.05"
            value={Math.min(current, duration || 0)}
            aria-label={studio("timeline")}
            onChange={(event) => {
              if (!player.current) return;
              player.current.currentTime = Number(event.target.value);
              setCurrent(player.current.currentTime);
            }}
            className="h-1.5 w-full cursor-pointer accent-[#cfaa96]"
          />
          <div className="mt-1 flex justify-between font-mono text-[10px] text-[#e8e6d7]/45 tabular-nums">
            <span>{time(current)}</span>
            <span>{time(duration)}</span>
          </div>
        </div>
        <Volume2
          aria-hidden="true"
          className="mr-1 size-4 shrink-0 text-[#cfaa96]"
        />
      </div>
      {failed && (
        <div className="mt-3 rounded-xl border border-[#bf8269]/30 bg-[#bf8269]/10 px-4 py-2 text-sm">
          <p role="alert">{t("playFailed")}</p>
          <button
            type="button"
            className="min-h-11 underline underline-offset-4"
            onClick={() => {
              setFailed(false);
              setUseFallback(false);
              setRetry((value) => value + 1);
            }}
          >
            {studio("retryAudio")}
          </button>
        </div>
      )}
    </div>
  );
}
