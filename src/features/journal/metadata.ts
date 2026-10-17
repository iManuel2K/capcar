import type { Metadata } from "next";
import { locales, type AppLocale } from "@/i18n/config";
import { PUBLIC_SITE_URL, pageMetadata } from "@/features/seo/public-metadata";
import { journalArticlePath, journalPath } from "./routes";

export function journalLanguageAlternates(slug?: string) {
  const path = (locale: AppLocale) =>
    slug ? journalArticlePath(slug, locale) : journalPath(locale);
  return {
    ...Object.fromEntries(
      locales.map((locale) => [
        locale,
        new URL(path(locale), PUBLIC_SITE_URL).toString(),
      ]),
    ),
    "x-default": new URL(path("en"), PUBLIC_SITE_URL).toString(),
  };
}

export function journalMetadata(
  locale: AppLocale,
  title: string,
  description: string,
  slug?: string,
): Metadata {
  const path = slug ? journalArticlePath(slug, locale) : journalPath(locale);
  const base = pageMetadata(path, title, description);
  return {
    ...base,
    alternates: {
      canonical: new URL(path, PUBLIC_SITE_URL).toString(),
      languages: journalLanguageAlternates(slug),
    },
  };
}
