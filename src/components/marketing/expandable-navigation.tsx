"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import styles from "./expandable-navigation.module.css";

type Section = {
  label: string;
  description: string;
  links: { href: string; label: string }[];
};

/** SmoothUI expandable-navbar pattern adapted to CapCar's links and palette. */
export function ExpandableNavigation({ sections }: { sections: Section[] }) {
  const [selected, setSelected] = useState<number | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [panelHeight, setPanelHeight] = useState<number>();
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);
  const hover = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduced = useReducedMotion();
  const pathname = usePathname();
  const id = useId();
  useEffect(() => {
    if (selected === null || !content.current) return;
    const node = content.current;
    const measure = () => setPanelHeight(node.getBoundingClientRect().height);
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    measure();
    return () => observer.disconnect();
  }, [selected]);
  const cancelHover = () => {
    if (hover.current) clearTimeout(hover.current);
  };
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) {
        cancelHover();
        setSelected(null);
      }
    };
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("pointerdown", outside);
      cancelHover();
    };
  }, []);
  return (
    <div
      ref={root}
      className={styles.root}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          cancelHover();
          setSelected(null);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && selected !== null) {
          cancelHover();
          triggers.current[selected]?.focus();
          setSelected(null);
        }
      }}
      onPointerLeave={() => {
        cancelHover();
        hover.current = setTimeout(() => {
          if (!root.current?.contains(document.activeElement))
            setSelected(null);
        }, 180);
      }}
      onPointerEnter={cancelHover}
    >
      <div className={styles.triggers}>
        {sections.map((section, index) => (
          <button
            key={section.label}
            ref={(node) => {
              triggers.current[index] = node;
            }}
            type="button"
            id={`${id}-trigger-${index}`}
            aria-expanded={selected === index}
            aria-controls={`${id}-panel-${index}`}
            onClick={() => {
              cancelHover();
              setSelected(selected === index ? null : index);
            }}
            onPointerEnter={(event) => {
              if (event.pointerType !== "mouse") return;
              cancelHover();
              hover.current = setTimeout(() => setSelected(index), 120);
            }}
            className={styles.trigger}
          >
            {section.label}
            <ChevronDown size={13} aria-hidden="true" />
          </button>
        ))}
      </div>
      <AnimatePresence initial={false}>
        {selected !== null && (
          <motion.div
            key="panel"
            className={styles.panel}
            initial={reduced ? false : { height: 0, opacity: 0 }}
            animate={{ height: panelHeight ?? "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              duration: reduced ? 0 : 0.24,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <motion.div
              ref={content}
              key={selected}
              id={`${id}-panel-${selected}`}
              role="region"
              aria-labelledby={`${id}-trigger-${selected}`}
              className={styles.content}
              initial={reduced ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduced ? 0 : -4 }}
              transition={{ duration: reduced ? 0 : 0.12 }}
            >
              <div className={styles.intro}>
                <span className={styles.index}>0{selected + 1} / CAPCAR</span>
                <p>{sections[selected].description}</p>
              </div>
              <div className={styles.links}>
                {sections[selected].links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={pathname === link.href ? "page" : undefined}
                    onClick={() => {
                      cancelHover();
                      setSelected(null);
                    }}
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
