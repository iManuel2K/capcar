import credits from "@/features/journal/cover-credits.json";
import { journalUI } from "@/features/journal/ui";
import type { AppLocale } from "@/i18n/config";

export function JournalCoverCredit({
  image,
  locale,
}: {
  image: string;
  locale: AppLocale;
}) {
  if (!Object.hasOwn(credits, image)) return null;
  const credit = credits[image as keyof typeof credits];

  return (
    <figcaption className="text-muted-foreground mt-2 text-xs leading-relaxed">
      {journalUI[locale].coverCredit} ·{" "}
      <a
        href={credit.source}
        className="hover:text-foreground underline underline-offset-4"
      >
        {credit.photographer} / Unsplash
      </a>
    </figcaption>
  );
}
