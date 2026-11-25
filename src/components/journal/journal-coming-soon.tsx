import Image from "next/image";
import { JournalCoverCredit } from "./journal-cover-credit";
import type { AppLocale } from "@/i18n/config";

const title = "The Hunger Games: Sunrise on the Reaping";
const image = "/journal/covers/forest-sunrise.webp";

const copy: Record<AppLocale, { status: string; teaser: string }> = {
  en: {
    status: "Coming soon",
    teaser:
      "Imanuel is writing a personal piece on the return to Panem and what stayed with him after the film.",
  },
  de: {
    status: "Demnächst",
    teaser:
      "Imanuel schreibt über seine Rückkehr nach Panem und darüber, was ihm nach dem Film im Kopf geblieben ist.",
  },
  el: {
    status: "Προσεχώς",
    teaser:
      "Ο Imanuel γράφει για την επιστροφή στην Πάνεμ και για όσα του έμειναν από την ταινία.",
  },
  sq: {
    status: "Së shpejti",
    teaser:
      "Imanuel po shkruan për rikthimin në Panem dhe për atë që i mbeti në mendje pas filmit.",
  },
  ja: {
    status: "近日公開",
    teaser:
      "イマヌエルが、パネムへの再訪と映画を観たあとに心に残ったことを綴ります。",
  },
};

export function JournalComingSoon({ locale }: { locale: AppLocale }) {
  const { status, teaser } = copy[locale];

  return (
    <aside
      aria-labelledby="journal-coming-soon-title"
      className="border-foreground/20 mb-12 grid gap-5 border-b pb-8 sm:grid-cols-[minmax(0,300px)_1fr] sm:items-center sm:gap-8"
    >
      <figure>
        <div className="bg-card relative aspect-video overflow-hidden rounded-xl">
          <Image
            src={image}
            alt=""
            fill
            sizes="(max-width: 639px) 100vw, 300px"
            className="object-cover"
          />
        </div>
        <JournalCoverCredit image={image} locale={locale} />
      </figure>
      <div>
        <p className="text-primary text-sm font-semibold">{status}</p>
        <h2
          id="journal-coming-soon-title"
          lang="en"
          className="mt-2 text-2xl leading-tight font-medium tracking-tight sm:text-3xl"
        >
          {title}
        </h2>
        <p className="text-foreground/75 mt-3 max-w-xl leading-relaxed">
          {teaser}
        </p>
      </div>
    </aside>
  );
}
