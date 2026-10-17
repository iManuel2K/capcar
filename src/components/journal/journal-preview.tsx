import Link from "next/link";
import { useLocale } from "next-intl";
import { JournalCards } from "./journal-cards";
import { journalArticles, JOURNAL_PATH } from "@/features/journal/articles";

export function JournalPreview() {
  const locale = useLocale();
  if (locale !== "de") return null;
  return (
    <section
      lang="de"
      aria-labelledby="journal-preview-title"
      className="bg-[#ebe9dc] px-5 py-20 text-[#0e2d30] sm:px-8 sm:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold tracking-widest text-[#79503c] uppercase">
          CapCar Journal
        </p>
        <div className="mt-4 mb-10 flex flex-wrap items-end justify-between gap-5">
          <h2
            id="journal-preview-title"
            className="max-w-2xl text-4xl font-medium tracking-tight sm:text-5xl"
          >
            Dein Auto. Dein nächster Schritt.
          </h2>
          <Link
            href={JOURNAL_PATH}
            className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4"
          >
            Alle Artikel →
          </Link>
        </div>
        <JournalCards articles={journalArticles.slice(0, 2)} />
      </div>
    </section>
  );
}
