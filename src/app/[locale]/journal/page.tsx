import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/marketing/site-footer";
import { JournalCards } from "@/components/journal/journal-cards";
import { journalArticles, JOURNAL_PATH } from "@/features/journal/articles";
import { pageMetadata } from "@/features/seo/public-metadata";

type Props = { params: Promise<{ locale: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ locale: "de" }];
}
export async function generateMetadata({ params }: Props) {
  if ((await params).locale !== "de") notFound();
  return pageMetadata(
    JOURNAL_PATH,
    "Journal: BMW-Projekte, Wartung und Ausflüge",
    "Praktische BMW-Projektplanung, Wartungsdokumentation und Ausflugsideen. Vier Leitfäden mit kostenlosen Vorlagen für deinen nächsten Schritt.",
  );
}

export default async function JournalPage({ params }: Props) {
  if ((await params).locale !== "de") notFound();
  return (
    <>
      <main
        id="main-content"
        lang="de"
        className="min-h-dvh bg-[#ebe9dc] px-5 py-16 text-[#0e2d30] sm:px-8 sm:py-24"
      >
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold tracking-[.2em] text-[#79503c] uppercase">
            CapCar Journal · Deutsch
          </p>
          <h1 className="mt-6 max-w-4xl text-5xl leading-[1.05] font-medium tracking-[-.05em] sm:text-7xl">
            Dein Auto.
            <br />
            Dein nächster Schritt.
          </h1>
          <p className="mt-6 mb-12 max-w-2xl text-lg leading-8 text-[#0e2d30]/75">
            Ein Wochenendjob, ein klarer Wartungseintrag oder ein freier Tag am
            Rhein. Hier findest du praktische Leitfäden und kostenlose Vorlagen
            für dein Leben mit dem Auto.
          </p>
          <JournalCards articles={journalArticles} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
