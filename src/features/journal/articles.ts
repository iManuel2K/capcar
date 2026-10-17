import articles from "./articles.json";

export const journalArticles = articles;
export type JournalArticle = (typeof articles)[number];
export const JOURNAL_PATH = "/de/journal";

export function findJournalArticle(slug: string) {
  return journalArticles.find((article) => article.slug === slug);
}

export function journalArticlePath(slug: string) {
  return `${JOURNAL_PATH}/${slug}`;
}
