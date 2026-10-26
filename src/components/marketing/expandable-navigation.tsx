"use client";

import Link from "@/components/i18n/public-link";
import { usePathname } from "next/navigation";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useIsPresent,
  useReducedMotion,
} from "motion/react";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import {
  type ReactNode,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import styles from "./expandable-navigation.module.css";

type Section = {
  label: string;
  description: string;
  links: { href: string; label: string }[];
};

const spring = { type: "spring", stiffness: 350, damping: 32 } as const;

// Exit animations must never leave old navigation links in the tab order.
function PresenceBoundary({ children }: { children: ReactNode }) {
  const present = useIsPresent();
  return <div inert={!present}>{children}</div>;
}

/** CapCar implementation of unlumen's shared-viewport motion navigation pattern. */
export function ExpandableNavigation({ sections }: { sections: Section[] }) {
  const pathname = usePathname();
  const [selection, setSelection] = useState({
    index: null as number | null,
    direction: 1,
    pathname,
  });
  const selected = selection.pathname === pathname ? selection.index : null;
  const [highlight, setHighlight] = useState<number | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const focusFrame = useRef<number | null>(null);
  const [viewport, setViewport] = useState({ width: 0, height: 0, left: 0 });
  const reduced = useReducedMotion();
  const id = useId();
  const transition = reduced ? { duration: 0 } : spring;

  const cancelTimer = () => {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
  };
  const close = () => {
    cancelTimer();
    setHighlight(null);
    setSelection((previous) => ({ ...previous, index: null }));
  };
  const open = (index: number) => {
    cancelTimer();
    setHighlight(index);
    setSelection((previous) => ({
      index,
      pathname,
      direction: previous.index === null || index >= previous.index ? 1 : -1,
    }));
  };

  useLayoutEffect(() => {
    if (selected === null || !content.current || !root.current) return;
    const node = content.current;
    const measure = () => {
      if (!root.current) return;
      const width = node.offsetWidth;
      const height = node.offsetHeight;
      const rootRect = root.current.getBoundingClientRect();
      const triggerRect = triggers.current[selected]?.getBoundingClientRect();
      const center = triggerRect
        ? triggerRect.left + triggerRect.width / 2
        : rootRect.left + rootRect.width / 2;
      const left = Math.max(
        16,
        Math.min(center - width / 2, window.innerWidth - width - 16),
      );
      setViewport({
        width,
        height,
        left: left - rootRect.left,
      });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    window.addEventListener("resize", measure);
    measure();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [selected, sections]);

  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) {
        cancelTimer();
        setHighlight(null);
        setSelection((previous) => ({ ...previous, index: null }));
      }
    };
    const collapseOnMobile = () => {
      if (window.innerWidth >= 1280) return;
      cancelTimer();
      setHighlight(null);
      setSelection((previous) => ({ ...previous, index: null }));
    };
    document.addEventListener("pointerdown", outside);
    window.addEventListener("resize", collapseOnMobile);
    return () => {
      document.removeEventListener("pointerdown", outside);
      window.removeEventListener("resize", collapseOnMobile);
      cancelTimer();
      if (focusFrame.current !== null) cancelAnimationFrame(focusFrame.current);
    };
  }, [pathname]);

  return (
    <LayoutGroup id={id}>
      <div
        ref={root}
        className={styles.root}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node))
            close();
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape" && selected !== null) {
            event.preventDefault();
            triggers.current[selected]?.focus();
            close();
          }
        }}
        onPointerLeave={(event) => {
          if (event.pointerType !== "mouse") return;
          cancelTimer();
          setHighlight(null);
          timer.current = setTimeout(() => {
            if (!root.current?.contains(document.activeElement)) close();
          }, 180);
        }}
        onPointerEnter={cancelTimer}
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
              aria-controls={
                selected === index ? `${id}-panel-${index}` : undefined
              }
              onClick={() => (selected === index ? close() : open(index))}
              onFocus={() => {
                cancelTimer();
                setHighlight(index);
              }}
              onPointerEnter={(event) => {
                if (event.pointerType !== "mouse") return;
                cancelTimer();
                setHighlight(index);
                timer.current = setTimeout(() => open(index), 100);
              }}
              onKeyDown={(event) => {
                let next: number | undefined;
                if (event.key === "ArrowRight")
                  next = (index + 1) % sections.length;
                if (event.key === "ArrowLeft")
                  next = (index + sections.length - 1) % sections.length;
                if (event.key === "Home") next = 0;
                if (event.key === "End") next = sections.length - 1;
                if (next !== undefined) {
                  event.preventDefault();
                  cancelTimer();
                  triggers.current[next]?.focus();
                  if (selected !== null) open(next);
                }
                if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                  event.preventDefault();
                  open(index);
                  const last = event.key === "ArrowUp";
                  if (focusFrame.current !== null)
                    cancelAnimationFrame(focusFrame.current);
                  focusFrame.current = requestAnimationFrame(() => {
                    const links =
                      content.current?.querySelectorAll<HTMLAnchorElement>("a");
                    (last ? links?.[links.length - 1] : links?.[0])?.focus();
                  });
                }
              }}
              className={styles.trigger}
            >
              {(highlight ?? selected) === index && (
                <motion.span
                  layoutId="navigation-highlight"
                  className={styles.highlight}
                  transition={transition}
                  aria-hidden="true"
                />
              )}
              <span className={styles.triggerLabel}>{section.label}</span>
              <ChevronDown size={13} aria-hidden="true" />
            </button>
          ))}
        </div>
        <AnimatePresence initial={false}>
          {selected !== null && (
            <motion.div
              key="viewport"
              className={styles.panel}
              initial={reduced ? false : { opacity: 0, scale: 0.96 }}
              animate={{
                opacity: 1,
                scale: 1,
                width: viewport.width || "auto",
                height: viewport.height || "auto",
                left: viewport.left,
              }}
              exit={{ opacity: 0, scale: reduced ? 1 : 0.98 }}
              transition={transition}
            >
              <PresenceBoundary>
                <AnimatePresence
                  initial={false}
                  mode="popLayout"
                  custom={selection.direction}
                >
                  <motion.div
                    key={selected}
                    custom={selection.direction}
                    variants={{
                      enter: (direction: number) => ({
                        opacity: 0,
                        x: reduced ? 0 : direction * 28,
                      }),
                      active: { opacity: 1, x: 0 },
                      leave: (direction: number) => ({
                        opacity: 0,
                        x: reduced ? 0 : -direction * 28,
                      }),
                    }}
                    initial="enter"
                    animate="active"
                    exit="leave"
                    transition={reduced ? { duration: 0 } : { duration: 0.18 }}
                  >
                    <PresenceBoundary>
                      <div
                        ref={content}
                        id={`${id}-panel-${selected}`}
                        role="region"
                        aria-labelledby={`${id}-trigger-${selected}`}
                        className={styles.content}
                        data-compact={
                          sections[selected].links.length <= 3 || undefined
                        }
                      >
                        <div className={styles.intro}>
                          <span className={styles.index}>
                            0{selected + 1} / CAPCAR
                          </span>
                          <p>{sections[selected].description}</p>
                        </div>
                        <div className={styles.links}>
                          {sections[selected].links.map((link) => (
                            <Link
                              key={link.href}
                              href={link.href}
                              aria-current={
                                pathname === link.href ? "page" : undefined
                              }
                              onClick={close}
                            >
                              <span>{link.label}</span>
                              <ArrowUpRight size={16} aria-hidden="true" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    </PresenceBoundary>
                  </motion.div>
                </AnimatePresence>
              </PresenceBoundary>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
}
