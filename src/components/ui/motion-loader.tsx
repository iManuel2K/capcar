import styles from "./smooth-interactions.module.css";

/** A lightweight SmoothUI-inspired wave loader. Omit label inside an already labelled status/button. */
export function MotionLoader({
  label,
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={`${styles.loader} ${className}`}
      role={label ? "status" : undefined}
      aria-live={label ? "polite" : undefined}
      aria-hidden={label ? undefined : true}
    >
      <span className={styles.bars} aria-hidden="true">
        {[0, 1, 2, 3, 4].map((bar) => (
          <i key={bar} style={{ animationDelay: `${bar * 100}ms` }} />
        ))}
      </span>
      {label && <span className="sr-only">{label}</span>}
    </span>
  );
}
