import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JournalChecklist } from "@/components/journal/journal-checklist";
import { SiteFooter } from "@/components/marketing/site-footer";
import { JournalContent } from "@/components/journal/journal-content";
import { JournalCards } from "@/components/journal/journal-cards";
import {
  findJournalArticle,
  getJournalArticles,
  relatedJournalArticles,
  journalArticlePath,
  journalPath,
} from "@/features/journal/articles";
import { PUBLIC_SITE_URL } from "@/features/seo/public-metadata";

import { isAppLocale, locales } from "@/i18n/config";
import { journalMetadata } from "@/features/journal/metadata";
import { journalUI, journalReadingTime } from "@/features/journal/ui";

type Props = { params: Promise<{ locale: string; articleSlug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    getJournalArticles(locale).map((article) => ({
      locale,
      articleSlug: article.slug,
    })),
  );
}
async function resolveArticle(params: Props["params"]) {
  const { locale, articleSlug } = await params;
  if (!isAppLocale(locale)) notFound();
  const article = findJournalArticle(articleSlug, locale);
  if (!article) notFound();
  return { article, locale };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { article, locale } = await resolveArticle(params);
  const base = journalMetadata(
    locale,
    article.seoTitle,
    article.description,
    article.slug,
  );
  const image = new URL(article.image, PUBLIC_SITE_URL).toString();
  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      type: "article",
      locale: {
        en: "en_GB",
        de: "de_DE",
        el: "el_GR",
        sq: "sq_AL",
        ja: "ja_JP",
      }[locale],
      publishedTime: article.published,
      images: [{ url: image, alt: "CapCar BMW Journal" }],
    },
    twitter: { ...base.twitter, images: [image] },
  };
}

export default async function JournalArticlePage({ params }: Props) {
  const { article, locale } = await resolveArticle(params);
  const path = journalArticlePath(article.slug, locale);
  const ui = journalUI[locale];
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    inLanguage: locale,
    datePublished: article.published,
    image: new URL(article.image, PUBLIC_SITE_URL).toString(),
    author: { "@type": "Organization", name: "CapCar" },
    publisher: { "@type": "Organization", name: "CapCar" },
    mainEntityOfPage: new URL(path, PUBLIC_SITE_URL).toString(),
  };
  return (
    <>
      <main
        id="main-content"
        lang={locale}
        className="bg-[#ebe9dc] text-[#0e2d30]"
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
          }}
        />
        <article className="mx-auto max-w-6xl px-5 pt-10 pb-16 sm:px-8 sm:pt-16">
          <Link
            href={journalPath(locale)}
            className="inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4"
          >
            ← {ui.allArticles}
          </Link>
          <header className="max-w-4xl py-8 sm:py-12">
            <p className="text-xs font-semibold tracking-widest text-[#79503c] uppercase">
              {article.category} · {journalReadingTime(locale, article.minutes)}
            </p>
            <h1 className="mt-5 text-4xl leading-[1.08] font-medium tracking-[-.045em] sm:text-6xl">
              {article.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#0e2d30]/75">
              {article.description}
            </p>
            <p className="mt-4 text-sm text-[#0e2d30]/65">
              {ui.editorial} ·{" "}
              <time dateTime={article.published}>
                {new Intl.DateTimeFormat(locale, {
                  dateStyle: "long",
                  timeZone: "UTC",
                }).format(new Date(`${article.published}T00:00:00Z`))}
              </time>
            </p>
          </header>
          <div className="relative mb-12 aspect-[16/8] overflow-hidden rounded-3xl bg-[#0e2d30]">
            <Image
              src={article.image}
              alt=""
              fill
              sizes="(max-width: 1152px) 100vw, 1152px"
              className="object-cover"
              priority
            />
          </div>
          <div className="mx-auto max-w-3xl">
            <JournalContent text={article.body} />
            <JournalChecklist slug={article.slug} locale={locale} />
          </div>
          <section aria-labelledby="related-title" className="mt-20">
            <h2
              id="related-title"
              className="mb-8 text-3xl font-medium tracking-tight"
            >
              {ui.related}
            </h2>
            <JournalCards
              locale={locale}
              articles={relatedJournalArticles(article.slug, locale)}
            />
          </section>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
