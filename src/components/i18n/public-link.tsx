"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import type { ComponentProps } from "react";
import { publicHref } from "@/features/seo/public-metadata";
import { resolveJournalLocale } from "@/features/journal/routes";

export default function PublicLink({
  href,
  ...props
}: ComponentProps<typeof Link>) {
  const locale = resolveJournalLocale(useLocale());
  return (
    <Link
      {...props}
      href={typeof href === "string" ? publicHref(href, locale) : href}
    />
  );
}
