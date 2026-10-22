import Link from "next/link";
import { useLocale } from "next-intl";
import { JournalCards } from "./journal-cards";
import { getJournalArticles, journalPath } from "@/features/journal/articles";

import { resolveJournalLocale } from "@/features/journal/routes";
import { journalUI } from "@/features/journal/ui";

export function JournalPreview() {
  const locale = resolveJournalLocale(useLocale());
  const ui = journalUI[locale];
  return (
    <section
      lang={locale}
      aria-labelledby="journal-preview-title"
      className="bg-background text-foreground px-5 py-20 sm:px-8 sm:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <p className="text-primary text-xs font-semibold tracking-widest uppercase">
          CapCar {ui.label}
        </p>
        <div className="mt-4 mb-10 flex flex-wrap items-end justify-between gap-5">
          <h2
            id="journal-preview-title"
            className="max-w-2xl text-4xl font-medium tracking-tight sm:text-5xl"
          >
            {ui.headline.replace("\n", " ")}
          </h2>
          <Link
            href={journalPath(locale)}
            className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4"
          >
            {ui.allArticles} →
          </Link>
        </div>
        <JournalCards
          articles={getJournalArticles(locale).slice(0, 2)}
          locale={locale}
        />
      </div>
    </section>
  );
}
