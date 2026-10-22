"use client";

import {
  CalendarDays,
  Camera,
  ExternalLink,
  ImageIcon,
  MapPin,
  X,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";

import {
  venueHeroImage,
  type RoadbookEvent,
  type RoadbookVenue,
} from "@/features/roadbook/roadbook-schema";

export type RoadbookDiscoveryPanel = "places" | "events";

export function RoadbookDiscoveryRail({
  venues,
  events,
  open,
  onOpenChange,
  onSelectVenue,
}: {
  venues: RoadbookVenue[];
  events: RoadbookEvent[];
  open?: RoadbookDiscoveryPanel;
  onOpenChange: (panel?: RoadbookDiscoveryPanel) => void;
  onSelectVenue: (venue: RoadbookVenue) => void;
}) {
  const t = useTranslations("Roadbook");
  const locale = useLocale();
  const venuesById = useMemo(
    () => new Map(venues.map((venue) => [venue.id, venue])),
    [venues],
  );
  const orderedVenues = useMemo(
    () =>
      [...venues].sort((left, right) => {
        const leftScore =
          (left.category === "car_photo_spot" ? 2 : 0) +
          (venueHeroImage(left) ? 1 : 0);
        const rightScore =
          (right.category === "car_photo_spot" ? 2 : 0) +
          (venueHeroImage(right) ? 1 : 0);
        return rightScore - leftScore || left.distanceM - right.distanceM;
      }),
    [venues],
  );
  const imageCount = useMemo(
    () => venues.filter((venue) => Boolean(venueHeroImage(venue))).length,
    [venues],
  );

  const toggle = (panel: RoadbookDiscoveryPanel) =>
    onOpenChange(open === panel ? undefined : panel);

  return (
    <div className="relative mt-2 sm:mt-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          aria-expanded={open === "places"}
          onClick={() => toggle("places")}
          className="hover:text-foreground inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-white/12 bg-white/[0.045] px-2.5 text-[11px] font-semibold text-white/72 transition hover:border-white/22 hover:bg-white/[0.08] sm:min-h-10 sm:gap-2 sm:px-3 sm:text-xs"
        >
          <Camera className="text-primary size-4" aria-hidden="true" />
          {t("places.action", { count: venues.length })}
          <span className="text-muted-foreground rounded-full bg-white/8 px-1.5 py-0.5 text-[9px] sm:text-[10px]">
            {t("places.images", { count: imageCount })}
          </span>
        </button>
        <button
          type="button"
          aria-expanded={open === "events"}
          onClick={() => toggle("events")}
          className="hover:text-foreground inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-white/12 bg-white/[0.045] px-2.5 text-[11px] font-semibold text-white/72 transition hover:border-white/22 hover:bg-white/[0.08] sm:min-h-10 sm:gap-2 sm:px-3 sm:text-xs"
        >
          <CalendarDays className="text-primary size-4" aria-hidden="true" />
          {t("events.upcoming", { count: events.length })}
        </button>
      </div>

      {open && (
        <section className="bg-background/98 text-foreground absolute top-full left-0 z-40 mt-2 w-[min(27rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/12 shadow-2xl backdrop-blur-xl sm:w-[min(27rem,calc(100vw-2.5rem))]">
          <header className="flex items-start justify-between gap-4 border-b border-white/9 p-4">
            <div>
              <p className="text-primary text-[10px] font-semibold tracking-[0.14em] uppercase">
                {t(open === "places" ? "places.eyebrow" : "events.eyebrow")}
              </p>
              <h2 className="mt-1 text-lg font-medium">
                {t(open === "places" ? "places.title" : "events.title")}
              </h2>
              <p className="text-muted-foreground mt-1 text-xs leading-5">
                {t(
                  open === "places"
                    ? "places.description"
                    : "events.description",
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(undefined)}
              aria-label={t("places.close")}
              className="text-muted-foreground hover:text-foreground grid size-9 shrink-0 place-items-center rounded-full border border-white/10 transition hover:bg-white/8"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </header>

          <div className="max-h-[min(34rem,52dvh)] overflow-y-auto p-2 sm:max-h-[min(34rem,58dvh)]">
            {open === "places" && !orderedVenues.length && (
              <p className="text-muted-foreground p-4 text-xs leading-5">
                {t("places.empty")}
              </p>
            )}
            {open === "places" &&
              orderedVenues.map((venue) => {
                const image = venueHeroImage(venue);
                return (
                  <button
                    key={venue.id}
                    type="button"
                    onClick={() => onSelectVenue(venue)}
                    className="group flex w-full gap-3 rounded-xl border border-transparent p-2 text-left transition hover:border-white/10 hover:bg-white/[0.045] focus-visible:border-white/30 focus-visible:outline-none"
                  >
                    <span className="text-muted-foreground relative grid h-20 w-28 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/8 bg-white/[0.04]">
                      {image ? (
                        // Curated remote images keep their source and photographer in the place drawer.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={image.url}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <ImageIcon className="size-5" aria-hidden="true" />
                      )}
                      {image?.context === "representative" && (
                        <span className="absolute right-1 bottom-1 rounded-full bg-black/72 px-1.5 py-0.5 text-[8px] font-semibold tracking-wide text-white/75 uppercase">
                          {t("media.representativeShort")}
                        </span>
                      )}
                    </span>
                    <span className="min-w-0 py-1">
                      <span className="text-primary block text-[10px] font-semibold tracking-[0.1em] uppercase">
                        {t(`categories.${venue.category}`)}
                      </span>
                      <span className="mt-1 block text-sm font-semibold text-white/88">
                        {venue.name}
                      </span>
                      <span className="text-muted-foreground mt-1 flex items-center gap-1 text-[11px]">
                        <MapPin className="size-3" aria-hidden="true" />
                        {venue.city || venue.countryCode}
                      </span>
                    </span>
                  </button>
                );
              })}

            {open === "events" && !events.length && (
              <p className="text-muted-foreground p-4 text-xs leading-5">
                {t("events.empty")}
              </p>
            )}
            {open === "events" &&
              events.map((event) => {
                const venue = venuesById.get(event.venueId);
                if (!venue) return null;
                const startsAt = new Date(event.startsAt);
                const endsAt = new Date(event.endsAt);
                const sameDay =
                  startsAt.toDateString() === endsAt.toDateString();
                const date = event.allDay
                  ? sameDay
                    ? new Intl.DateTimeFormat(locale, {
                        dateStyle: "medium",
                      }).format(startsAt)
                    : `${new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(startsAt)} – ${new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(endsAt)}`
                  : new Intl.DateTimeFormat(locale, {
                      dateStyle: "medium",
                      ...(sameDay ? { timeStyle: "short" as const } : {}),
                    }).format(startsAt);

                return (
                  <article
                    key={event.id}
                    className="rounded-xl border border-transparent p-3 transition hover:border-white/9 hover:bg-white/[0.035]"
                  >
                    <div className="flex gap-3">
                      <div className="bg-primary/12 text-primary grid size-11 shrink-0 place-items-center rounded-xl">
                        <CalendarDays className="size-4" aria-hidden="true" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.1em] uppercase">
                          {t(`events.types.${event.eventType}`)} · {date}
                        </p>
                        <h3 className="mt-1 text-sm font-semibold text-white/88">
                          {event.title}
                        </h3>
                        <p className="text-muted-foreground mt-1 text-[11px]">
                          {t(`events.participation.${event.participation}`)}
                        </p>
                        <button
                          type="button"
                          onClick={() => onSelectVenue(venue)}
                          className="text-muted-foreground hover:text-foreground mt-2 inline-flex min-h-8 items-center gap-1.5 text-left text-xs transition"
                        >
                          <MapPin className="size-3.5" aria-hidden="true" />
                          {venue.name} · {venue.city}
                        </button>
                        <a
                          href={event.bookingUrl ?? event.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary mt-1 flex min-h-8 items-center gap-1.5 text-xs font-semibold"
                        >
                          {event.bookingUrl
                            ? t("events.booking")
                            : t("events.source")}
                          <ExternalLink className="size-3" aria-hidden="true" />
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
          </div>
        </section>
      )}
    </div>
  );
}
