"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import styles from "./sign-in.module.css";

export interface SignInPhoto {
  src: string;
  photographer: string;
  href: string;
  position?: string;
  fit?: "cover" | "contain";
}

export function SignInPhotoPanel({ photo }: { photo: SignInPhoto }) {
  const t = useTranslations("Auth.photos");

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
        style={{ objectPosition: photo.position, objectFit: photo.fit }}
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
      </figcaption>
    </figure>
  );
}
