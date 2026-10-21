"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Square } from "lucide-react";
import { useLocale } from "next-intl";
import { resolveJournalLocale } from "@/features/journal/routes";
import { interactionCopy } from "@/features/ui/interaction-copy";
import styles from "./smooth-interactions.module.css";

export function AIConversation({
  children,
  contentKey,
}: {
  children: ReactNode;
  contentKey: string | number;
}) {
  const c = interactionCopy[resolveJournalLocale(useLocale())];
  const viewport = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const pinned = useRef(true);
  const [following, setFollowing] = useState(true);
  useEffect(() => {
    const node = viewport.current;
    const inner = content.current;
    if (!node || !inner) return;
    const follow = () => {
      if (pinned.current) node.scrollTop = node.scrollHeight;
    };
    follow();
    const resize = new ResizeObserver(follow);
    resize.observe(inner);
    return () => resize.disconnect();
  }, [contentKey]);
  return (
    <div className={styles.threadWrap}>
      <div
        ref={viewport}
        role="log"
        aria-label={c.conversation}
        aria-live="polite"
        aria-relevant="additions"
        tabIndex={0}
        className={styles.thread}
        onScroll={() => {
          const node = viewport.current;
          if (!node) return;
          pinned.current =
            node.scrollHeight - node.clientHeight - node.scrollTop < 48;
          setFollowing(pinned.current);
        }}
      >
        <div ref={content} className={styles.messages}>
          {children}
        </div>
      </div>
      {!following && (
        <button
          type="button"
          className={styles.latest}
          onClick={() => {
            const node = viewport.current;
            if (!node) return;
            pinned.current = true;
            setFollowing(true);
            node.scrollTo({
              top: node.scrollHeight,
              behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                .matches
                ? "instant"
                : "smooth",
            });
          }}
        >
          <ArrowDown className="mr-1 inline size-4" aria-hidden="true" />
          {c.latest}
        </button>
      )}
    </div>
  );
}
export function AIMessage({
  role,
  children,
}: {
  role: "user" | "assistant";
  children: ReactNode;
}) {
  const c = interactionCopy[resolveJournalLocale(useLocale())];
  return (
    <div className={styles.message} data-role={role}>
      <span className={styles.messageLabel}>
        {role === "user" ? c.you : c.assistant}
      </span>
      {children}
    </div>
  );
}
/** Render the real response immediately. No simulated streaming or unsafe HTML. */
export function AIResponse({ text }: { text: string }) {
  return <p className={styles.response}>{text}</p>;
}

export function AIInput({
  value,
  onValueChange,
  onSubmit,
  onStop,
  busy = false,
  disabled = false,
  maxLength = 2000,
  label,
  placeholder,
}: {
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
  onStop?: () => void;
  busy?: boolean;
  disabled?: boolean;
  maxLength?: number;
  label?: string;
  placeholder?: string;
}) {
  const c = interactionCopy[resolveJournalLocale(useLocale())];
  const id = useId();
  const field = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const node = field.current;
    if (node) {
      node.style.height = "auto";
      node.style.height = `${Math.min(node.scrollHeight, 192)}px`;
    }
  }, [value]);
  const submit = () => {
    if (!disabled && !busy && value.trim().length >= 2) onSubmit();
  };
  return (
    <div className={styles.composer}>
      <label htmlFor={id} className="sr-only">
        {label ?? c.prompt}
      </label>
      <textarea
        ref={field}
        id={id}
        value={value}
        maxLength={maxLength}
        rows={3}
        placeholder={placeholder ?? c.placeholder}
        onChange={(event) => onValueChange(event.target.value)}
        onKeyDown={(event) => {
          if (
            event.key === "Enter" &&
            !event.shiftKey &&
            !event.nativeEvent.isComposing
          ) {
            event.preventDefault();
            submit();
          }
        }}
      />
      <div className={styles.composerFooter}>
        <span className="text-xs text-[#aab6b1] tabular-nums">
          {value.length >= maxLength * 0.8
            ? `${value.length}/${maxLength}`
            : ""}
        </span>
        <button
          type="button"
          className={styles.send}
          disabled={busy ? !onStop : disabled || value.trim().length < 2}
          onClick={busy && onStop ? onStop : submit}
          aria-label={busy && onStop ? c.stop : c.send}
        >
          {busy && onStop ? (
            <Square size={16} aria-hidden="true" />
          ) : (
            <ArrowUp size={16} aria-hidden="true" />
          )}
          {busy && onStop ? c.stop : c.send}
        </button>
      </div>
    </div>
  );
}
