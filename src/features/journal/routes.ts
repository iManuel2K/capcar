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
  return slugs.includes(slug) || isBilingualJournalGuide(slug);
}

export function isJournalRoute(route: string) {
  return (
    route === "/journal" ||
    (route.startsWith("/journal/") && isJournalSlug(route.slice(9)))
  );
}
