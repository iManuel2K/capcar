"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Plus } from "lucide-react";
import { HomepageLink } from "./homepage-link";
import {
  roadbookStylePreviews,
  type RoadbookGalleryCopy,
} from "@/features/marketing/roadbook-gallery-copy";
import styles from "./roadbook-style-gallery.module.css";

export function RoadbookStyleGallery({ copy }: { copy: RoadbookGalleryCopy }) {
  const [active, setActive] = useState(0);
  const [visited, setVisited] = useState([0]);
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  const reduceMotion = useReducedMotion();
  const id = useId();
  function choose(index: number) {
    setActive(index);
    setVisited((items) => (items.includes(index) ? items : [...items, index]));
  }
  return (
    <section
      className={styles.section}
      aria-labelledby={`${id}-title`}
      id="roadbook-styles"
    >
      <div className={styles.inner}>
        <header className={styles.intro}>
          <h2 id={`${id}-title`}>{copy.title}</h2>
          <p>{copy.description}</p>
          <p className={styles.hint}>{copy.hint}</p>
        </header>
        <div className={styles.list}>
          {roadbookStylePreviews.map((style, index) => {
            const expanded = active === index;
            return (
              <article
                key={style.id}
                className={styles.row}
                data-open={expanded}
                data-style={style.id}
              >
                <h3>
                  <button
                    ref={(node) => {
                      buttons.current[index] = node;
                    }}
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={`${id}-${style.id}`}
                    className={styles.trigger}
                    onPointerEnter={(event) => {
                      if (
                        event.pointerType === "mouse" &&
                        window.matchMedia("(hover: hover)").matches &&
                        !event.currentTarget
                          .closest("section")
                          ?.querySelector(":focus-visible")
                      )
                        choose(index);
                    }}
                    onFocus={() => choose(index)}
                    onClick={() => choose(index)}
                    onKeyDown={(event) => {
                      const keys = ["ArrowDown", "ArrowUp", "Home", "End"];
                      if (!keys.includes(event.key)) return;
                      event.preventDefault();
                      const next =
                        event.key === "Home"
                          ? 0
                          : event.key === "End"
                            ? roadbookStylePreviews.length - 1
                            : (index +
                                (event.key === "ArrowDown" ? 1 : -1) +
                                roadbookStylePreviews.length) %
                              roadbookStylePreviews.length;
                      buttons.current[next]?.focus({ preventScroll: true });
                    }}
                  >
                    <span className={styles.name}>{style.name}</span>
                    <span className={styles.caption} aria-hidden="true">
                      {copy.captions[index]}
                    </span>
                    <Plus
                      size={20}
                      aria-hidden="true"
                      className={styles.plus}
                    />
                  </button>
                </h3>
                <motion.div
                  initial={false}
                  animate={{ height: expanded ? "auto" : 0 }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : {
                          type: "spring",
                          stiffness: 280,
                          damping: 32,
                          mass: 0.9,
                        }
                  }
                  id={`${id}-${style.id}`}
                  aria-hidden={!expanded}
                  inert={!expanded}
                  className={styles.reveal}
                >
                  {visited.includes(index) && (
                    <MapPreview
                      styleId={style.id}
                      name={style.name}
                      copy={copy}
                    />
                  )}
                </motion.div>
              </article>
            );
          })}
        </div>
        <p className={styles.credit}>
          © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>{" "}
          · <a href="https://openfreemap.org/">OpenFreeMap</a> ·{" "}
          <a href="https://openmaptiles.org/">OpenMapTiles</a>
        </p>
      </div>
    </section>
  );
}

function MapPreview({
  styleId,
  name,
  copy,
}: {
  styleId: string;
  name: string;
  copy: RoadbookGalleryCopy;
}) {
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  return (
    <div className={styles.content}>
      <div className={styles.picture} data-state={state}>
        {state !== "ready" && (
          <p role="status">{state === "error" ? copy.error : copy.loading}</p>
        )}
        <Image
          key={attempt}
          src={`/previews/roadbook-styles/${styleId}.jpg${attempt ? `?retry=${attempt}` : ""}`}
          alt={copy.imageAlt.replace("{style}", name)}
          width={1200}
          height={600}
          sizes="(min-width: 1280px) 1152px, 92vw"
          quality={65}
          className={styles.image}
          onLoad={() => setState("ready")}
          onError={() => setState("error")}
        />
      </div>
      <div className={styles.actions}>
        {state === "error" && (
          <button
            type="button"
            className={styles.retry}
            onClick={() => {
              setState("loading");
              setAttempt((value) => value + 1);
            }}
          >
            {copy.retry}
          </button>
        )}
        <HomepageLink
          href={`/roadbook?style=${styleId}`}
          useCase="drives"
          className={styles.link}
        >
          {copy.open}
          <ArrowRight size={16} aria-hidden="true" />
        </HomepageLink>
      </div>
    </div>
  );
}
