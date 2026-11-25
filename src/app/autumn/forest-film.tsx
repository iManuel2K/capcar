"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import styles from "./autumn.module.css";

export function ForestFilm({
  source,
  mobileSource,
}: {
  source: string;
  mobileSource: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const pausedByUser = useRef(false);
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video || failed) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const bounds = video.getBoundingClientRect();
    let inView = bounds.bottom > 0 && bounds.top < window.innerHeight;

    const sync = () => {
      if (
        !inView ||
        motion.matches ||
        pausedByUser.current ||
        document.hidden
      ) {
        video.pause();
      } else if (video.paused) {
        void video.play().catch(() => setPaused(video.paused));
      }
    };
    const onMotionChange = () => {
      if (!motion.matches && !video.currentSrc) video.load();
      sync();
    };
    const observer =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(
            ([entry]) => {
              inView = entry.isIntersecting && entry.intersectionRatio >= 0.05;
              sync();
            },
            { threshold: 0.05 },
          );
    observer?.observe(video);
    document.addEventListener("visibilitychange", sync);
    motion.addEventListener("change", onMotionChange);
    sync();
    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", sync);
      motion.removeEventListener("change", onMotionChange);
    };
  }, [failed, source, mobileSource]);

  if (failed) return null;

  return (
    <>
      <video
        ref={ref}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden
        className={styles.film}
        onPlaying={() => setPaused(false)}
        onError={(event) => {
          if (event.target === event.currentTarget) setFailed(true);
        }}
      >
        <source
          src={source}
          type="video/mp4"
          media="(prefers-reduced-motion: no-preference) and (min-width: 768px)"
        />
        <source
          src={mobileSource}
          type="video/mp4"
          media="(prefers-reduced-motion: no-preference)"
          onError={(event) => {
            if (matchMedia(event.currentTarget.media).matches) setFailed(true);
          }}
        />
      </video>
      <button
        className={`${styles.glass} ${styles.filmControl}`}
        type="button"
        aria-label={paused ? "Play background video" : "Pause background video"}
        onClick={() => {
          const video = ref.current;
          if (!video) return;
          pausedByUser.current = !paused;
          if (paused) {
            void video.play().catch(() => setPaused(video.paused));
          } else {
            video.pause();
            setPaused(true);
          }
        }}
      >
        {paused ? (
          <Play size={18} aria-hidden />
        ) : (
          <Pause size={18} aria-hidden />
        )}
      </button>
    </>
  );
}
