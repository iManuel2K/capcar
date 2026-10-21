"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Play, X } from "lucide-react";
import { useLocale } from "next-intl";
import Image from "next/image";
import { resolveJournalLocale } from "@/features/journal/routes";
import { interactionCopy } from "@/features/ui/interaction-copy";
import styles from "./smooth-interactions.module.css";
import { trapDialogFocus } from "./dialog-focus";

export function videoEmbedUrl(source: string) {
  try {
    const url = new URL(source);
    if (url.protocol !== "https:") return null;
    const host = url.hostname;
    if (
      [
        "youtube.com",
        "www.youtube.com",
        "youtube-nocookie.com",
        "www.youtube-nocookie.com",
        "youtu.be",
      ].includes(host)
    ) {
      const id =
        host === "youtu.be"
          ? url.pathname.slice(1)
          : url.pathname.startsWith("/embed/")
            ? url.pathname.split("/")[2]
            : url.searchParams.get("v");
      return id && /^[\w-]{11}$/.test(id)
        ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=0`
        : null;
    }
    if (["vimeo.com", "player.vimeo.com"].includes(host)) {
      const id = url.pathname.split("/").filter(Boolean).at(-1);
      return id && /^\d+$/.test(id)
        ? `https://player.vimeo.com/video/${id}?autoplay=0&dnt=1`
        : null;
    }
  } catch {
    /* Not an embeddable URL. Keep the original link available. */
  }
  return null;
}

type Props = {
  title: string;
  src: string;
  poster?: string;
  kind?: "file" | "embed";
  trigger?: ReactNode;
  className?: string;
  tracks?: { src: string; language: string; label: string }[];
  describedBy?: string;
};

/** Native modal focus/escape behavior; media is only mounted after an explicit click. */
export function VideoModal({
  title,
  src,
  poster,
  kind = "embed",
  trigger,
  className,
  tracks,
  describedBy,
}: Props) {
  const c = interactionCopy[resolveJournalLocale(useLocale())];
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const [visible, setVisible] = useState(true);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const player = useRef<HTMLVideoElement>(null);
  const embed = kind === "embed" ? videoEmbedUrl(src) : null;
  const safeSource = /^(https:\/\/|\/(?!\/))/.test(src);
  useEffect(() => {
    if (!open) return;
    const modal = dialog.current;
    const media = player.current;
    const trigger = opener.current;
    const previous = document.body.style.overflow;
    const pause = () => {
      setVisible(!document.hidden);
      if (document.hidden) player.current?.pause();
    };
    modal?.showModal();
    document.body.style.overflow = "hidden";
    document.addEventListener("visibilitychange", pause);
    return () => {
      media?.pause();
      modal?.close();
      document.body.style.overflow = previous;
      document.removeEventListener("visibilitychange", pause);
      trigger?.focus();
    };
  }, [open]);
  return (
    <>
      <button
        ref={opener}
        type="button"
        aria-haspopup="dialog"
        className={className ?? styles.videoTrigger}
        data-poster={Boolean(poster)}
        onClick={() => {
          setFailed(false);
          setVisible(true);
          setOpen(true);
        }}
      >
        {poster && (
          <Image
            src={poster}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 1100px"
            className={styles.poster}
          />
        )}
        <span className={styles.play}>
          <Play className="size-4" aria-hidden="true" />
          {trigger ?? c.watch}
        </span>
      </button>
      {open && (
        <dialog
          ref={dialog}
          onKeyDown={trapDialogFocus}
          className={styles.dialog}
          aria-label={title}
          onCancel={(event) => {
            event.preventDefault();
            setOpen(false);
          }}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              const rect = event.currentTarget.getBoundingClientRect();
              if (
                event.clientX < rect.left ||
                event.clientX > rect.right ||
                event.clientY < rect.top ||
                event.clientY > rect.bottom
              )
                setOpen(false);
            }
          }}
        >
          <div className={styles.dialogHeader}>
            <h2>{title}</h2>
            <button
              type="button"
              autoFocus
              className={styles.iconButton}
              aria-label={c.close}
              onClick={() => setOpen(false)}
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>
          {safeSource && kind === "file" ? (
            <video
              ref={player}
              src={src}
              poster={poster}
              controls
              playsInline
              preload="metadata"
              className={styles.player}
              aria-describedby={describedBy}
              onError={() => setFailed(true)}
            >
              {tracks?.map((track, index) => (
                <track
                  key={track.language}
                  kind="captions"
                  src={track.src}
                  srcLang={track.language}
                  label={track.label}
                  default={index === 0}
                />
              ))}
            </video>
          ) : embed && visible ? (
            <iframe
              src={embed}
              title={title}
              className={styles.player}
              allow="encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : null}
          {(failed || (!embed && kind === "embed")) && (
            <p role="status">{c.videoError}</p>
          )}
          {safeSource && (
            <a
              className={styles.external}
              href={src}
              target="_blank"
              rel="noopener noreferrer"
            >
              {c.external} ↗
            </a>
          )}
        </dialog>
      )}
    </>
  );
}
