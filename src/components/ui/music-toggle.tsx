"use client";

import { Play, Pause } from "lucide-react";
import styles from "./smooth-interactions.module.css";

/** Caller-driven: reflects actual media events, never starts its own audio. */
export function MusicToggle({
  playing,
  onToggle,
  label,
  progress = 0,
}: {
  playing: boolean;
  onToggle: () => void;
  label: string;
  progress?: number;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={playing}
      data-playing={playing}
      onClick={onToggle}
      className={styles.recordButton}
    >
      <span className={styles.record} aria-hidden="true" />
      <svg
        className={styles.progressRing}
        viewBox="0 0 60 60"
        aria-hidden="true"
      >
        <circle
          cx="30"
          cy="30"
          r="27"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={1 - Math.max(0, Math.min(1, progress))}
        />
      </svg>
      {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
    </button>
  );
}
export function PlaybackSignal({ playing }: { playing: boolean }) {
  return (
    <span className={styles.signal} data-playing={playing} aria-hidden="true">
      <span className={styles.bars}>
        {[0, 1, 2, 3, 4].map((bar) => (
          <i key={bar} style={{ animationDelay: `${bar * 110}ms` }} />
        ))}
      </span>
    </span>
  );
}
