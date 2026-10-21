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

export default function sitemap(): MetadataRoute.Sitemap {
  const publicPages = PUBLIC_INDEXABLE_ROUTES.flatMap((route) => {
    const alternates = { languages: publicLanguageAlternates(route) };
    const shared = {
      lastModified:
        route === "" || route === "/platform"
          ? HOMEPAGE_LAST_MODIFIED
          : PUBLIC_CONTENT_LAST_MODIFIED,
      alternates,
    };

    return locales.map((locale) => ({
      url: localizedPublicUrl(route, locale),
      ...shared,
      ...(["/ai", "/project-car-planner", "/car-maintenance-tracker"].includes(
        route,
      )
        ? { lastModified: "2026-10-21" }
        : {}),
    }));
  });
  const journalPages = locales.flatMap((locale) => [
    {
      url: new URL(journalPath(locale), PUBLIC_SITE_URL).toString(),
      lastModified: "2026-10-21",
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
