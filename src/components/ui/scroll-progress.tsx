"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { resolveJournalLocale } from "@/features/journal/routes";
import { interactionCopy } from "@/features/ui/interaction-copy";
import styles from "./smooth-interactions.module.css";

export function readingPercentage(
  top: number,
  bottom: number,
  viewport: number,
) {
  const distance = bottom - top - viewport;
  return distance <= 0
    ? top <= viewport
      ? 100
      : 0
    : Math.round(Math.max(0, Math.min(1, -top / distance)) * 100);
}

/** Tracks only the article, not the surrounding page/footer; does not trigger React rerenders on scroll. */
export function ScrollProgress() {
  const c = interactionCopy[resolveJournalLocale(useLocale())];
  const root = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const article = root.current?.nextElementSibling;
    if (!article) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = article.getBoundingClientRect();
      const value = readingPercentage(
        rect.top,
        rect.bottom,
        window.innerHeight,
      );
      root.current?.setAttribute("aria-valuenow", String(value));
      if (fill.current)
        fill.current.style.transform = `translateX(${value - 100}%)`;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const resize = new ResizeObserver(schedule);
    resize.observe(article);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);
  return (
    <div
      ref={root}
      className={styles.progress}
      role="progressbar"
      aria-label={c.progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
    >
      <div
        ref={fill}
        className={styles.progressFill}
        style={{ transform: "translateX(-100%)" }}
      />
    </div>
  );
}
