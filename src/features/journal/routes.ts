import englishOriginalSlugs from "./en-original-slugs.json";
import slugs from "./article-slugs.json";
import germanGuideSlugs from "./de-guide-slugs.json";
import { isAppLocale, type AppLocale } from "@/i18n/config";

export function resolveJournalLocale(locale: string): AppLocale {
  return isAppLocale(locale) ? locale : "en";
}

export function journalPath(locale: AppLocale) {
  return `/${locale}/journal`;
}

export function journalArticlePath(slug: string, locale: AppLocale = "de") {
  return `${journalPath(locale)}/${slug}`;
}

export function isBilingualJournalGuide(slug: string) {
  return germanGuideSlugs.includes(slug);
}

export function isJournalSlug(slug: string) {
  return (
    slugs.includes(slug) ||
    isBilingualJournalGuide(slug) ||
    isEnglishOnlyJournalPost(slug)
  );
}

export function isJournalRoute(route: string) {
  return (
    route === "/journal" ||
    (route.startsWith("/journal/") && isJournalSlug(route.slice(9)))
  );
}

export function isEnglishOnlyJournalPost(slug: string) {
  return englishOriginalSlugs.includes(slug);
}

export function isJournalArticleAvailable(slug: string, locale: AppLocale) {
  if (isEnglishOnlyJournalPost(slug)) return locale === "en";
  if (isBilingualJournalGuide(slug)) return locale === "en" || locale === "de";
  return slugs.includes(slug);
}
