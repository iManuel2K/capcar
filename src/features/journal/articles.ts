import articles from "./articles.json";
import en from "./translations/en.json";
import el from "./translations/el.json";
import sq from "./translations/sq.json";
import ja from "./translations/ja.json";
import type { AppLocale } from "@/i18n/config";

export { journalArticlePath, journalPath } from "./routes";

export const journalArticles = articles;
export type JournalArticle = (typeof articles)[number];
const translations: Record<AppLocale, JournalArticle[]> = {
  de: articles,
  en,
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
