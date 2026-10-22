import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/marketing/site-footer";
import { JournalCards } from "@/components/journal/journal-cards";
import { getJournalArticles } from "@/features/journal/articles";
import { journalUI } from "@/features/journal/ui";
import { journalMetadata } from "@/features/journal/metadata";
import { isAppLocale, locales } from "@/i18n/config";

type Props = { params: Promise<{ locale: string }> };
export const dynamicParams = false;
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const ui = journalUI[locale];
  return journalMetadata(locale, ui.title, ui.description);
}

export default async function JournalPage({ params }: Props) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const ui = journalUI[locale];
  return (
    <>
      <main
        id="main-content"
        lang={locale}
        className="bg-background text-foreground min-h-dvh px-5 py-16 sm:px-8 sm:py-24"
      >
        <div className="mx-auto max-w-6xl">
          <p className="text-primary text-xs font-semibold tracking-[.2em] uppercase">
            CapCar {ui.label} · {ui.language}
          </p>
          <h1 className="mt-6 max-w-4xl text-5xl leading-[1.05] font-medium tracking-[-.05em] whitespace-pre-line sm:text-7xl">
            {ui.headline}
          </h1>
          <p className="text-foreground/75 mt-6 mb-12 max-w-2xl text-lg leading-8">
            {ui.intro}
          </p>
          <JournalCards articles={getJournalArticles(locale)} locale={locale} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
