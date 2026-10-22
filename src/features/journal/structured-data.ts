import type { AppLocale } from "@/i18n/config";
import { PUBLIC_SITE_URL } from "@/features/seo/public-metadata";
import {
  capcarOrganization,
  ORGANIZATION_ID,
  WEBSITE_ID,
} from "@/features/seo/structured-data";
import { journalArticlePath, type JournalArticle } from "./articles";

export function journalStructuredData(
  article: JournalArticle,
  locale: AppLocale,
) {
  const url = new URL(
    journalArticlePath(article.slug, locale),
    PUBLIC_SITE_URL,
  ).toString();
  return {
    "@context": "https://schema.org",
    "@graph": [
      capcarOrganization(),
      {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        url,
        headline: article.title,
        description: article.description,
        inLanguage: locale,
        datePublished: article.published,
        ...(article.updated ? { dateModified: article.updated } : {}),
        image: new URL(article.image, PUBLIC_SITE_URL).toString(),
        author: { "@id": ORGANIZATION_ID },
        publisher: { "@id": ORGANIZATION_ID },
        isPartOf: { "@id": WEBSITE_ID },
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
      },
    ],
  };
}
