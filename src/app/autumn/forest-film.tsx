"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import styles from "./autumn.module.css";

// Install the first-frame handoff as soon as the browser parses the hero.
// The component takes over playback and subsequent recovery after hydration.
const revealInitialFrame = `(() => {
  const video = document.currentScript?.previousElementSibling;
  if (!(video instanceof HTMLVideoElement)) return;
  const reveal = () => {
    if (!video.paused && !video.seeking && video.readyState >= video.HAVE_CURRENT_DATA) {
      video.dataset.frameReady = "true";
    }
  };
  const onPlaying = () => {
    if (typeof video.requestVideoFrameCallback === "function") {
      video.requestVideoFrameCallback(reveal);
    } else {
      reveal();
    }
  };
  if (video.paused || video.readyState < video.HAVE_FUTURE_DATA) {
    video.addEventListener("playing", onPlaying, { once: true });
  } else {
    onPlaying();
  }
})();`;

export function ForestFilm({
  source,
  mobileSource,
  poster,
}: {
  source: string;
  mobileSource: string;
  poster: string;
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
    let pendingFrame: number | undefined;

    const cancelFrame = () => {
      if (pendingFrame === undefined) return;
      video.cancelVideoFrameCallback(pendingFrame);
      pendingFrame = undefined;
    };
    const hideFrame = () => {
      cancelFrame();
      delete video.dataset.frameReady;
    };
    const revealFrame = () => {
      if (video.seeking || video.readyState < video.HAVE_CURRENT_DATA) return;
      cancelFrame();
      if (
        typeof video.requestVideoFrameCallback === "function" &&
        !video.paused
      ) {
        pendingFrame = video.requestVideoFrameCallback(() => {
          pendingFrame = undefined;
          video.dataset.frameReady = "true";
        });
      } else {
        video.dataset.frameReady = "true";
      }
    };

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
    video.addEventListener("playing", revealFrame);
    video.addEventListener("seeked", revealFrame);
    video.addEventListener("seeking", hideFrame);
    video.addEventListener("waiting", hideFrame);
    video.addEventListener("emptied", hideFrame);
    // Native autoplay may have started before the page hydrated.
    if (!video.paused) revealFrame();
    sync();
    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", sync);
      motion.removeEventListener("change", onMotionChange);
      video.removeEventListener("playing", revealFrame);
      video.removeEventListener("seeked", revealFrame);
      video.removeEventListener("seeking", hideFrame);
      video.removeEventListener("waiting", hideFrame);
      video.removeEventListener("emptied", hideFrame);
      hideFrame();
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
        poster={poster}
        preload="auto"
        aria-hidden
        suppressHydrationWarning
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
      <script dangerouslySetInnerHTML={{ __html: revealInitialFrame }} />
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
