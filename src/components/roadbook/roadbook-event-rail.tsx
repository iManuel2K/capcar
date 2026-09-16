"use client";

import { CalendarDays, ExternalLink, MapPin } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import type {
  RoadbookEvent,
  RoadbookVenue,
} from "@/features/roadbook/roadbook-schema";

export function RoadbookEventRail({
  events,
  venues,
  open,
  onOpenChange,
  onSelectVenue,
}: {
  events: RoadbookEvent[];
  venues: RoadbookVenue[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectVenue: (venue: RoadbookVenue) => void;
}) {
  const t = useTranslations("Roadbook.events");
  const locale = useLocale();
  const venuesById = new Map(venues.map((venue) => [venue.id, venue]));

  return (
    <section className="absolute top-36 right-3 z-30 sm:top-44 lg:right-5">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
        className="ml-auto flex min-h-11 items-center gap-2 rounded-xl border border-white/12 bg-[#09100d]/90 px-4 text-xs font-semibold text-white/75 shadow-xl backdrop-blur-xl transition hover:bg-[#101a16] hover:text-white"
      >
        <CalendarDays className="size-4 text-[#ff667a]" />
        {t("upcoming", { count: events.length })}
      </button>

      {open && (
        <div className="mt-2 w-[min(25rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-white/12 bg-[#09100d]/96 shadow-2xl backdrop-blur-xl">
          <header className="border-b border-white/9 p-4">
            <p className="text-[10px] font-semibold tracking-[0.14em] text-[#ff667a] uppercase">
              {t("eyebrow")}
            </p>
            <h2 className="mt-1 text-lg font-medium">{t("title")}</h2>
            <p className="mt-1 text-xs leading-5 text-white/42">
              {t("description")}
            </p>
          </header>

          <div className="max-h-[min(31rem,60dvh)] overflow-y-auto p-2">
            {!events.length && (
              <p className="p-4 text-xs leading-5 text-white/45">
                {t("empty")}
              </p>
            )}
            {events.map((event) => {
              const venue = venuesById.get(event.venueId);
              if (!venue) return null;
              const startsAt = new Date(event.startsAt);
              const endsAt = new Date(event.endsAt);
              const sameDay = startsAt.toDateString() === endsAt.toDateString();
              const date = new Intl.DateTimeFormat(locale, {
                dateStyle: "medium",
                ...(sameDay ? { timeStyle: "short" as const } : {}),
              }).format(startsAt);

              return (
                <article
                  key={event.id}
                  className="rounded-xl border border-transparent p-3 transition hover:border-white/9 hover:bg-white/[0.035]"
                >
                  <div className="flex gap-3">
                    <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#e72d45]/12 text-[#ff788a]">
                      <CalendarDays className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-semibold tracking-[0.1em] text-white/35 uppercase">
                        {t(`types.${event.eventType}`)} · {date}
                      </p>
                      <h3 className="mt-1 text-sm font-semibold text-white/88">
                        {event.title}
                      </h3>
                      <p className="mt-1 text-[11px] text-white/38">
                        {t(`participation.${event.participation}`)}
                      </p>
                      <button
                        type="button"
                        onClick={() => onSelectVenue(venue)}
                        className="mt-2 inline-flex min-h-8 items-center gap-1.5 text-left text-xs text-white/48 transition hover:text-white"
                      >
                        <MapPin className="size-3.5" />
                        {venue.name} · {venue.city}
                      </button>
                      <a
                        href={event.bookingUrl ?? event.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 flex min-h-8 items-center gap-1.5 text-xs font-semibold text-[#ff788a]"
                      >
                        {event.bookingUrl ? t("booking") : t("source")}
                        <ExternalLink className="size-3" />
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
