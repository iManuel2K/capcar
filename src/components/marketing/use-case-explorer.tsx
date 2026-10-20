"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { Layers3, MapPinned, Wrench } from "lucide-react";
import styles from "./homepage.module.css";

/** Public previews only: switching a panel never changes the visitor's garage. */
export function UseCaseExplorer({
  label,
  titles,
  children,
}: {
  label: string;
  titles: [string, string, string];
  children: [ReactNode, ReactNode, ReactNode];
}) {
  const [selected, setSelected] = useState(0);
  const id = useId();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const icons = [Wrench, Layers3, MapPinned];
  return (
    <div className={styles.explorer}>
      <div className={styles.explorerHead}>
        <div role="tablist" aria-label={label} className={styles.explorerTabs}>
          {titles.map((title, index) => {
            const Icon = icons[index];
            return (
              <button
                key={title}
                type="button"
                role="tab"
                id={`${id}-tab-${index}`}
                aria-controls={`${id}-panel-${index}`}
                aria-selected={selected === index}
                tabIndex={selected === index ? 0 : -1}
                ref={(node) => {
                  buttons.current[index] = node;
                }}
                onClick={() => setSelected(index)}
                onKeyDown={(event) => {
                  const next =
                    event.key === "ArrowRight"
                      ? (index + 1) % titles.length
                      : event.key === "ArrowLeft"
                        ? (index + titles.length - 1) % titles.length
                        : event.key === "Home"
                          ? 0
                          : event.key === "End"
                            ? titles.length - 1
                            : null;
                  if (next === null) return;
                  event.preventDefault();
                  setSelected(next);
                  buttons.current[next]?.focus();
                }}
              >
                <Icon size={18} aria-hidden="true" />
                <span>{title}</span>
              </button>
            );
          })}
        </div>
        <span className={styles.explorerCount} aria-hidden="true">
          0{selected + 1}
          <span> / 03</span>
        </span>
      </div>
      <div className={styles.explorerTrack} aria-hidden="true">
        {titles.map((title, index) => (
          <span key={title} data-active={selected === index} />
        ))}
      </div>
      {children.map((panel, index) => (
        <div
          key={index}
          id={`${id}-panel-${index}`}
          role="tabpanel"
          aria-labelledby={`${id}-tab-${index}`}
          hidden={selected !== index}
          tabIndex={0}
          className={styles.explorerPanel}
        >
          {panel}
        </div>
      ))}
    </div>
  );
}
