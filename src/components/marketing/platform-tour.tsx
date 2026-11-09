"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Camera,
  CarFront,
  ClipboardCheck,
  ClipboardList,
  History,
  MapPin,
  MapPinned,
  MessageSquare,
  Route,
  ScanLine,
  Search,
  ShieldCheck,
  ShoppingCart,
  Wallet,
  Wrench,
} from "lucide-react";
import Link from "@/components/i18n/public-link";
import { platformCopy } from "@/features/marketing/platform-copy";
import { platformTourCopy } from "@/features/marketing/platform-tour-copy";
import type { AppLocale } from "@/i18n/config";
import styles from "./platform-tour.module.css";

const scenes = [
  { name: "garage", mark: CarFront, nodes: [ClipboardList, Wrench, MapPinned] },
  { name: "plan", mark: Wrench, nodes: [ClipboardList, Search, Wallet] },
  {
    name: "history",
    mark: ClipboardCheck,
    nodes: [ClipboardCheck, Camera, History],
  },
  { name: "drive", mark: MapPinned, nodes: [MapPin, MessageSquare, Route] },
  {
    name: "future",
    mark: CarFront,
    nodes: [ShoppingCart, ScanLine, ShieldCheck],
  },
] as const;

const motionQuery = "(prefers-reduced-motion: reduce)";

function subscribeToMotionPreference(callback: () => void) {
  const query = window.matchMedia?.(motionQuery);
  if (!query) return () => {};
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

export function PlatformTour({ locale }: { locale: AppLocale }) {
  const [index, setIndex] = useState(0);
  const [autoplay, setAutoplay] = useState<boolean | null>(null);
  const [visible, setVisible] = useState(false);
  const section = useRef<HTMLElement>(null);
  const reducedMotion = useSyncExternalStore(
    subscribeToMotionPreference,
    () => window.matchMedia?.(motionQuery).matches ?? false,
    () => false,
  );
  const playing = autoplay ?? !reducedMotion;
  const finalFromNext = useRef(false);
  const copy = platformTourCopy[locale];
  const status = platformCopy[locale];
  const step = copy.steps[index];
  const scene = scenes[index];
  const Mark = scene.mark;
  const last = index === copy.steps.length - 1;
  useEffect(() => {
    if (!section.current || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.intersectionRatio >= 0.25),
      { threshold: 0.25 },
    );
    observer.observe(section.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!playing || !visible || last) return;
    const timer = window.setTimeout(() => {
      if (
        section.current?.contains(document.activeElement) &&
        !document.activeElement?.hasAttribute("data-tour-playback")
      ) {
        setAutoplay(false);
        return;
      }
      setIndex(index + 1);
    }, 12000);
    return () => window.clearTimeout(timer);
  }, [index, last, playing, visible]);

  const selectStep = (stepIndex: number) => {
    setAutoplay(false);
    setIndex(stepIndex);
  };

  const stepText = (stepIndex: number) =>
    copy.step
      .replace("{current}", String(stepIndex + 1))
      .replace("{total}", String(copy.steps.length));

  return (
    <section
      id="capcar-tour"
      ref={section}
      aria-labelledby="capcar-tour-heading"
      className={styles.section}
      data-tour-step={index + 1}
    >
      <div className={styles.frame} data-tour-frame>
        <div className={styles.copy} data-tour-copy>
          <p id="capcar-tour-heading" className={styles.eyebrow} data-tour-name>
            {copy.label}
          </p>
          <ol
            className={styles.progress}
            aria-label={copy.label}
            data-tour-progress
          >
            {copy.steps.map(({ title }, stepIndex) => (
              <li key={title}>
                <button
                  type="button"
                  data-tour-jump={stepIndex + 1}
                  data-reached={stepIndex <= index}
                  aria-current={stepIndex === index ? "step" : undefined}
                  aria-label={`${stepText(stepIndex)}. ${title}`}
                  onClick={() => selectStep(stepIndex)}
                />
              </li>
            ))}
          </ol>
          <div
            aria-live={playing && !last ? "off" : "polite"}
            aria-atomic="true"
            className={styles.slide}
            data-tour-slide
          >
            <div className={styles.meta} data-tour-meta>
              <p>{stepText(index)}</p>
              <p className={styles.status} data-tour-status>
                {last ? status.planned : status.available}
              </p>
            </div>
            <h2 data-tour-title>{step.title}</h2>
            <p className={styles.body} data-tour-body>
              {step.body}
            </p>
            {step.note && (
              <p className={styles.note} data-tour-note>
                {step.note}
              </p>
            )}
          </div>
        </div>
        <figure className={styles.diagram} data-tour-diagram={scene.name}>
          <div className={styles.visual} data-tour-visual aria-hidden="true">
            <svg
              className={styles.lines}
              data-tour-lines
              viewBox="0 0 440 200"
              preserveAspectRatio="none"
              fill="none"
            >
              {scene.name === "drive" ? (
                <>
                  <path d="M-12 112 C82 31 64 170 184 130 S288 38 442 73 M-12 140 C95 56 87 197 196 155 S305 63 442 99 M-12 167 C109 87 112 215 210 177 S320 88 442 124" />
                  <path
                    d="M61 147 C117 129 160 174 213 113 S263 52 357 71"
                    data-route
                  />
                  <circle cx="61" cy="147" r="5" />
                  <circle cx="357" cy="71" r="5" />
                </>
              ) : (
                <>
                  <path d="M78 200V173Q78 160 93 160H205Q220 160 220 145V107 M220 200V107 M362 200V173Q362 160 347 160H235Q220 160 220 145" />
                  <path
                    d="M220 13v18 M211 22h18 M68 104h18 M77 95v18 M354 104h18 M363 95v18"
                    data-guides
                  />
                </>
              )}
            </svg>
            {index === 0 ? (
              <Image
                src="/garage/cutouts/bmw-318i.webp"
                alt=""
                fill
                sizes="(max-width: 780px) 88vw, 430px"
                className={styles.car}
              />
            ) : (
              <span className={styles.mark} data-tour-mark>
                <Mark strokeWidth={1.35} />
              </span>
            )}
          </div>
          <figcaption className={styles.legend}>
            <ol className={styles.nodes} data-tour-nodes>
              {step.labels.map((label, nodeIndex) => {
                const Icon = scene.nodes[nodeIndex];
                return (
                  <li key={label} data-tour-node>
                    <span className={styles.nodeIcon} data-tour-node-icon>
                      <Icon size={23} strokeWidth={1.6} aria-hidden="true" />
                    </span>
                    <span>{label}</span>
                  </li>
                );
              })}
            </ol>
          </figcaption>
        </figure>
        <div className={styles.controls} data-tour-controls>
          <button
            type="button"
            disabled={index === 0}
            className={styles.secondary}
            onClick={() => selectStep(index - 1)}
          >
            <ArrowLeft size={17} aria-hidden="true" />
            {copy.back}
          </button>
          {last ? (
            <div
              className={styles.finish}
              ref={(element) => {
                if (element && finalFromNext.current) {
                  element.querySelector("a")?.focus({ preventScroll: true });
                  finalFromNext.current = false;
                }
              }}
            >
              <Link
                href="/garage/new"
                prefetch={false}
                className={styles.primary}
              >
                {copy.start}
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
          ) : (
            <button
              type="button"
              className={styles.primary}
              onClick={() => {
                finalFromNext.current = index === copy.steps.length - 2;
                selectStep(index + 1);
              }}
            >
              {copy.next}
              <ArrowRight size={17} aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            className={styles.secondary}
            data-tour-playback
            onClick={() => {
              if (last) setIndex(0);
              setAutoplay(last || !playing);
            }}
          >
            {last ? copy.replay : playing ? copy.pause : copy.play}
          </button>
          <a className={styles.skip} href="#connected-car">
            {copy.skip}
            <ArrowDown size={16} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
