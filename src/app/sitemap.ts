import { journalLanguageAlternates } from "@/features/journal/metadata";
import type { MetadataRoute } from "next";

import {
  PUBLIC_CONTENT_LAST_MODIFIED,
  HOMEPAGE_LAST_MODIFIED,
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

const pageUpdates: Partial<
  Record<(typeof PUBLIC_INDEXABLE_ROUTES)[number], string>
> = {
  "/ai": "2026-10-21",
  "/driving-review": "2026-11-26",
  "/project-car-planner": "2026-11-26",
  "/car-maintenance-tracker": "2026-11-26",
  "/pricing": "2026-10-26",
  "": HOMEPAGE_LAST_MODIFIED,
  "/platform": HOMEPAGE_LAST_MODIFIED,
};

export default function sitemap(): MetadataRoute.Sitemap {
  const publicPages = PUBLIC_INDEXABLE_ROUTES.flatMap((route) => {
    const alternates = { languages: publicLanguageAlternates(route) };
    const shared = {
      lastModified: pageUpdates[route] ?? PUBLIC_CONTENT_LAST_MODIFIED,
      alternates,
    };

    return locales.map((locale) => ({
      url: localizedPublicUrl(route, locale),
      ...shared,
    }));
  });
  const journalPages = locales.flatMap((locale) => [
    {
      url: new URL(journalPath(locale), PUBLIC_SITE_URL).toString(),
      lastModified: getJournalArticles(locale).reduce(
        (latest, article) =>
          (article.updated ?? article.published) > latest
            ? (article.updated ?? article.published)
            : latest,
        "2026-10-21",
      ),
      alternates: { languages: journalLanguageAlternates() },
    },
    ...getJournalArticles(locale).map((article) => ({
      url: new URL(
        journalArticlePath(article.slug, locale),
        PUBLIC_SITE_URL,
      ).toString(),
      lastModified: article.updated ?? article.published,
      alternates: { languages: journalLanguageAlternates(article.slug) },
    })),
  ]);
  return [...publicPages, ...journalPages];
}
