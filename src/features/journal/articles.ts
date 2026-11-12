import articles from "./articles.json";
import englishOriginals from "./en-originals.json";
import { isEnglishOnlyJournalPost } from "./routes";
import englishGuides from "./en-guides.json";
import germanGuides from "./de-guides.json";
import en from "./translations/en.json";
import el from "./translations/el.json";
import sq from "./translations/sq.json";
import ja from "./translations/ja.json";
import type { AppLocale } from "@/i18n/config";

export { journalArticlePath, journalPath } from "./routes";

export const journalArticles = articles;
export type JournalArticle = (typeof articles)[number];
const translations: Record<AppLocale, JournalArticle[]> = {
  de: [...articles, ...germanGuides],
  en: [...en, ...englishGuides, ...englishOriginals],
  el,
  sq,
  ja,
};

export function getJournalArticles(locale: AppLocale) {
  return translations[locale];
}

export function findJournalArticle(slug: string, locale: AppLocale = "de") {
  return getJournalArticles(locale).find((article) => article.slug === slug);
}

export function relatedJournalArticles(slug: string, locale: AppLocale) {
  const articles = getJournalArticles(locale).filter(
    (item) => item.slug !== slug,
  );
  if (isEnglishOnlyJournalPost(slug)) {
    const category = findJournalArticle(slug, locale)?.category;
    const originals = articles.filter((item) =>
      isEnglishOnlyJournalPost(item.slug),
    );
    return [
      ...originals.filter((item) => item.category === category),
      ...originals.filter((item) => item.category !== category),
    ].slice(0, 2);
  }
  const preferred =
    slug === "guide-to-vehicle-history"
      ? ["bmw-diy-wartung-dokumentieren", "bmw-wartung-ohne-garage"]
      : slug === "build-plan-first-job"
        ? ["bmw-wochenendprojekt-planen", "bmw-wartung-ohne-garage"]
        : ["build-plan-first-job", "guide-to-vehicle-history"];
  return preferred
    .flatMap((id) => {
      const article = articles.find((item) => item.slug === id);
      return article ? [article] : [];
    })
    .slice(0, 2);
}
