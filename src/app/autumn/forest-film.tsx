"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import styles from "./autumn.module.css";

export function ForestFilm({ source }: { source: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video || failed) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let inView = typeof IntersectionObserver === "undefined";
    let frame = 0;
    let restart = 0;
    let fadingOut = false;

    function fade(target: HTMLVideoElement, to: number) {
      cancelAnimationFrame(frame);
      const from = Number(target.style.opacity || 0);
      const start = performance.now();
      const step = (now: number) => {
        const fraction = Math.min(1, (now - start) / 500);
        target.style.opacity = String(from + (to - from) * fraction);
        if (fraction < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    }

    const play = () => {
      if (!inView || motion.matches || paused || document.hidden) return;
      void video.play().catch(() => {
        if (!video.paused) return;
        video.style.opacity = "0";
        delete video.dataset.active;
      });
    };
    const sync = () => {
      if (!inView || motion.matches || paused || document.hidden) {
        video.pause();
        cancelAnimationFrame(frame);
        clearTimeout(restart);
        if (motion.matches) {
          video.style.opacity = "0";
          delete video.dataset.active;
        }
      } else {
        fadingOut = false;
        if (video.ended) video.currentTime = 0;
        play();
      }
    };
    const onPlaying = () => {
      video.dataset.active = "true";
      fade(video, 1);
    };
    const onTime = () => {
      if (!fadingOut && video.duration - video.currentTime <= 0.55) {
        fadingOut = true;
        fade(video, 0);
      }
    };
    const onEnded = () => {
      cancelAnimationFrame(frame);
      video.style.opacity = "0";
      restart = window.setTimeout(() => {
        video.currentTime = 0;
        fadingOut = false;
        play();
      }, 100);
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
    video.addEventListener("playing", onPlaying);
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("ended", onEnded);
    document.addEventListener("visibilitychange", sync);
    motion.addEventListener("change", sync);
    sync();
    return () => {
      observer?.disconnect();
      video.pause();
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("ended", onEnded);
      document.removeEventListener("visibilitychange", sync);
      motion.removeEventListener("change", sync);
      cancelAnimationFrame(frame);
      clearTimeout(restart);
    };
  }, [failed, paused, source]);

  if (failed) return null;

  return (
    <>
      <video
        ref={ref}
        src={source}
        muted
        playsInline
        preload="none"
        aria-hidden
        className={styles.film}
        onError={() => setFailed(true)}
      />
      <button
        className={`${styles.glass} ${styles.filmControl}`}
        type="button"
        aria-label={paused ? "Play background video" : "Pause background video"}
        onClick={() => setPaused(!paused)}
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
