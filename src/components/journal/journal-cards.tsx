import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  journalArticlePath,
  type JournalArticle,
} from "@/features/journal/articles";

import type { AppLocale } from "@/i18n/config";
import { journalUI, journalReadingTime } from "@/features/journal/ui";

export function JournalCards({
  articles,
  locale,
}: {
  articles: JournalArticle[];
  locale: AppLocale;
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {articles.map((article, index) => (
        <Link
          key={article.slug}
          href={journalArticlePath(article.slug, locale)}
          className={`group border-foreground/20 hover:border-primary border-b pb-8 transition focus-visible:outline-2 focus-visible:outline-offset-4 ${index === 0 ? "md:col-span-2 md:grid md:grid-cols-[1.2fr_1fr] md:items-center md:gap-10" : "grid grid-cols-[96px_1fr] items-start gap-5 sm:grid-cols-[160px_1fr]"}`}
        >
          <div
            className={`relative bg-transparent ${index === 0 ? "aspect-[16/9]" : "aspect-square"}`}
          >
            <Image
              src={article.image}
              alt=""
              fill
              sizes={
                index === 0
                  ? "(max-width: 768px) 100vw, 60vw"
                  : "(max-width: 640px) 96px, 160px"
              }
              className="object-contain"
            />
          </div>
          <div className={index === 0 ? "pt-5 md:pt-0" : ""}>
            <p className="text-primary text-xs font-semibold tracking-widest uppercase">
              {article.category} · {journalReadingTime(locale, article.minutes)}
            </p>
            <h2
              className={`mt-3 flex items-start justify-between gap-4 leading-tight font-medium tracking-tight ${index === 0 ? "text-3xl sm:text-4xl" : "text-xl"}`}
            >
              {article.title}
              <ArrowUpRight
                className="mt-1 size-5 shrink-0"
                aria-hidden="true"
              />
            </h2>
            <p className="text-foreground/75 mt-4 text-sm leading-7">
              {article.description}
            </p>
            <p className="mt-6 text-sm font-semibold">
              {journalUI[locale].readArticle} →
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
