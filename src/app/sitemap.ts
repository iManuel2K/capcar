import { journalLanguageAlternates } from "@/features/journal/metadata";
import type { MetadataRoute } from "next";

import {
  PUBLIC_CONTENT_LAST_MODIFIED,
  PUBLIC_INDEXABLE_ROUTES,
  PUBLIC_SITE_URL,
  localizedPublicUrl,
  publicLanguageAlternates,
} from "@/features/seo/public-metadata";
import {
  getJournalArticles,
  journalArticlePath,
  journalPath,
} from "@/features/journal/articles";
import { locales } from "@/i18n/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const publicPages = PUBLIC_INDEXABLE_ROUTES.flatMap((route) => {
    const alternates = { languages: publicLanguageAlternates(route) };
    const shared = {
      lastModified: PUBLIC_CONTENT_LAST_MODIFIED,
      alternates,
    };

    return [
      {
        url: new URL(route || "/", PUBLIC_SITE_URL).toString(),
        ...shared,
      },
      ...locales.map((locale) => ({
        url: localizedPublicUrl(route, locale),
        ...shared,
      })),
    ];
  });
  const journalPages = locales.flatMap((locale) => [
    {
      url: new URL(journalPath(locale), PUBLIC_SITE_URL).toString(),
      lastModified: "2026-10-17",
      alternates: { languages: journalLanguageAlternates() },
    },
    ...getJournalArticles(locale).map((article) => ({
      url: new URL(
        journalArticlePath(article.slug, locale),
        PUBLIC_SITE_URL,
      ).toString(),
      lastModified: article.published,
      alternates: { languages: journalLanguageAlternates(article.slug) },
    })),
  ]);
  return [...publicPages, ...journalPages];
}
