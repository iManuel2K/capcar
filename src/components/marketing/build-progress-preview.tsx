"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import type { HomepageCopy } from "@/features/marketing/homepage-copy";

export function BuildProgressPreview({ copy }: { copy: HomepageCopy }) {
  const [done, setDone] = useState(0);
  const [ready, setReady] = useState(0);
  const preview = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ready !== 3) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let started = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const stop = () => timers.forEach(clearTimeout);
    const finish = () => {
      stop();
      setDone(3);
    };
    const begin = () => {
      if (started || document.hidden) return;
      started = true;
      if (motion.matches) {
        finish();
        return;
      }
      for (let stage = 1; stage <= 3; stage++)
        timers.push(setTimeout(() => setDone(stage), stage * 1500));
    };
    const visibility = () => {
      if (document.hidden) stop();
    };
    const observer =
      typeof IntersectionObserver === "undefined"
        ? undefined
        : new IntersectionObserver(
            ([entry]) => {
              if (entry.isIntersecting) begin();
              else stop();
            },
            { threshold: 0.35 },
          );
    if (observer && preview.current) observer.observe(preview.current);
    else begin();
    motion.addEventListener("change", finish);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      stop();
      observer?.disconnect();
      motion.removeEventListener("change", finish);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [ready]);
  const reveal = done < 2 ? 0 : done === 2 ? 50 : 100;
  return (
    <div ref={preview}>
      <div className="bg-card relative mb-4 aspect-video overflow-hidden rounded-xl">
        <Image
          src="/capcar-hero-bmw-garage.png"
          alt={copy.buildVisualNote}
          fill
          sizes="(max-width: 760px) 90vw, 540px"
          className="object-contain"
          onLoad={() => setReady((previous) => previous | 1)}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 motion-safe:transition-[clip-path] motion-safe:duration-1000 motion-safe:ease-in-out"
          style={{ clipPath: `inset(0 ${100 - reveal}% 0 0)` }}
        >
          <Image
            src="/capcar-hero-bmw-vision.png"
            alt=""
            fill
            sizes="(max-width: 760px) 90vw, 540px"
            className="object-contain"
            onLoad={() => setReady((previous) => previous | 2)}
          />
        </div>
      </div>
      <div className="mb-5 flex flex-wrap justify-between gap-2">
        <strong>{copy.project}</strong>
        <span className="text-muted-foreground text-xs">
          {copy.buildVisualNote}
        </span>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span>{copy.buildProgress.replace("{done}", String(done))}</span>
        <strong className="text-primary tabular-nums">
          {Math.round((done / 3) * 100)}%
        </strong>
      </div>
      <progress
        value={done}
        max={3}
        aria-label={copy.build}
        className="build-preview-progress mt-3 h-2 w-full overflow-hidden rounded-full"
      />
      <ol className="mt-4 space-y-2">
        {[copy.buildTaskOne, copy.buildTaskTwo, copy.buildTaskThree].map(
          (task, index) => (
            <li
              key={task}
              className={`flex min-h-12 items-center gap-3 rounded-xl border p-3 text-sm motion-safe:transition-colors motion-safe:duration-500 ${index < done ? "border-primary/35 bg-primary/10" : "border-border bg-card"}`}
            >
              <span
                aria-hidden="true"
                className="text-primary border-primary/40 grid size-8 shrink-0 place-items-center rounded-full border font-mono"
              >
                {index < done ? (
                  <Check size={17} />
                ) : (
                  String(index + 1).padStart(2, "0")
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-muted-foreground mr-2 font-mono text-xs">
                  0{index + 1}
                </span>
                {task}
              </span>
              <span className="sr-only">
                {index < done ? copy.done : copy.planned}
              </span>
            </li>
          ),
        )}
      </ol>
    </div>
  );
}
