import { describe, expect, it } from "vitest";
import { getJournalArticles } from "./articles";
import { journalStructuredData } from "./structured-data";
import { locales } from "@/i18n/config";
import { ORGANIZATION_ID } from "@/features/seo/structured-data";

describe("journal structured data", () => {
  it("connects every translated article to the existing organization and visible facts", () => {
    const ids = new Set<string>();
    for (const locale of locales) {
      for (const article of getJournalArticles(locale)) {
        const graph = journalStructuredData(article, locale)["@graph"];
        const posting = graph.find((node) => node["@type"] === "BlogPosting");
        expect(graph[0]["@id"]).toBe(ORGANIZATION_ID);
        expect(posting).toMatchObject({
          headline: article.title,
          datePublished: article.published,
          inLanguage: locale,
          author: { "@id": ORGANIZATION_ID },
          publisher: { "@id": ORGANIZATION_ID },
          mainEntityOfPage: {
            "@id": `https://capcar.dev/${locale}/journal/${article.slug}`,
          },
        });
        ids.add(posting!["@id"]);
        if (article.updated) {
          expect(posting).toHaveProperty("dateModified", article.updated);
        } else {
          expect(posting).not.toHaveProperty("dateModified");
        }
        expect(posting).not.toHaveProperty("review");
      }
    }
    expect(ids.size).toBe(
      locales.reduce(
        (count, locale) => count + getJournalArticles(locale).length,
        0,
      ),
    );
  });
});
