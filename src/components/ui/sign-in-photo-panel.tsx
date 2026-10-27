"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import styles from "./sign-in.module.css";

export interface SignInPhoto {
  src: string;
  photographer: string;
  href: string;
  position?: string;
}

export function SignInPhotoPanel({
  photos,
}: {
  photos: readonly SignInPhoto[];
}) {
  const t = useTranslations("Auth.photos");
  const [index, setIndex] = useState(0);
  const photo = photos[index];
  if (!photo) return null;

  return (
    <figure className={styles.photoPanel} aria-label={t("label")}>
      <Image
        key={photo.src}
        src={photo.src}
        alt=""
        fill
        loading="eager"
        sizes="100vw"
        className={styles.photo}
        style={{ objectPosition: photo.position }}
      />
      <figcaption className={styles.photoFooter}>
        <a
          href={photo.href}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.credit}
        >
          {photo.photographer} / Unsplash
        </a>
        {photos.length > 1 && (
          <div className={styles.photoControls}>
            <button
              type="button"
              aria-label={t("previous")}
              onClick={() =>
                setIndex(
                  (current) => (current + photos.length - 1) % photos.length,
                )
              }
            >
              <ChevronLeft aria-hidden="true" className="size-4" />
            </button>
            <span
              className="text-xs tabular-nums"
              aria-live="polite"
              aria-atomic="true"
            >
              {index + 1} / {photos.length}
            </span>
            <button
              type="button"
              aria-label={t("next")}
              onClick={() =>
                setIndex((current) => (current + 1) % photos.length)
              }
            >
              <ChevronRight aria-hidden="true" className="size-4" />
            </button>
          </div>
        )}
      </figcaption>
    </figure>
  );
}
