"use client";

import { ExternalLink, Fuel, MapPin, Navigation, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import type { RoadbookFuelStation } from "@/features/roadbook/roadbook-fuel";

export function RoadbookFuelDrawer({
  station,
  fetchedAt,
  onClose,
}: {
  station: RoadbookFuelStation;
  fetchedAt?: string;
  onClose: () => void;
}) {
  const t = useTranslations("Roadbook");
  const locale = useLocale();
  const navigationUrl = `https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`;
  const prices = [
    ["e5", station.prices.e5],
    ["e10", station.prices.e10],
    ["diesel", station.prices.diesel],
  ] as const;

  return (
    <aside
      aria-label={t("fuel.detailsLabel")}
      className="absolute inset-x-2 bottom-2 z-30 max-h-[72%] overflow-y-auto rounded-[1.6rem] border border-white/12 bg-[#0a0f0c]/96 text-white shadow-[0_24px_90px_rgba(0,0,0,.45)] backdrop-blur-2xl lg:inset-y-3 lg:right-3 lg:left-auto lg:max-h-none lg:w-[26rem]"
    >
      <div className="flex items-start justify-between gap-5 border-b border-white/8 p-5">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.12em] text-[#ff667a] uppercase">
            {t("fuel.livePrices")}
          </p>
          <h2 className="mt-2 text-2xl font-medium tracking-[-0.035em]">
            {station.name}
          </h2>
          {station.brand && station.brand !== station.name && (
            <p className="mt-1 text-xs text-white/45">{station.brand}</p>
          )}
        </div>
        <button
          type="button"
          aria-label={t("fuel.close")}
          onClick={onClose}
          className="grid size-10 shrink-0 place-items-center rounded-full border border-white/10 text-white/55 transition hover:bg-white/8 hover:text-white"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      </div>

      <div className="space-y-5 p-5">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/9 bg-white/[0.035] p-4 text-sm">
          <span className="inline-flex items-center gap-2 text-white/65">
            <Fuel className="size-4 text-[#ff667a]" />
            {station.isOpen === undefined
              ? t("fuel.statusUnknown")
              : t(station.isOpen ? "fuel.open" : "fuel.closed")}
          </span>
          <span className="text-white/40">
            {t("fuel.distance", {
              distance: station.distanceKm.toLocaleString(locale, {
                maximumFractionDigits: 1,
              }),
            })}
          </span>
        </div>

        <dl className="grid grid-cols-3 gap-2">
          {prices.map(([fuelType, value]) => (
            <div
              key={fuelType}
              className="rounded-2xl border border-white/9 bg-white/[0.035] p-3 text-center"
            >
              <dt className="text-[10px] font-semibold tracking-[0.08em] text-white/42 uppercase">
                {t(`fuel.types.${fuelType}`)}
              </dt>
              <dd className="mt-2 text-lg font-semibold text-white/88">
                {value === undefined
                  ? "—"
                  : new Intl.NumberFormat(locale, {
                      style: "currency",
                      currency: "EUR",
                      minimumFractionDigits: 3,
                    }).format(value)}
              </dd>
              <span className="text-[9px] text-white/32">
                {t("fuel.perLiter")}
              </span>
            </div>
          ))}
        </dl>

        <div className="rounded-2xl border border-white/9 bg-white/[0.035] p-4">
          <p className="flex items-start gap-2 text-sm leading-6 text-white/62">
            <MapPin className="mt-1 size-4 shrink-0 text-[#ff667a]" />
            {station.address || t("fuel.addressUnknown")}
          </p>
          <a
            href={navigationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#e72d45] px-4 text-sm font-semibold text-white transition hover:bg-[#f03a52]"
          >
            <Navigation className="size-4" />
            {t("fuel.navigate")}
          </a>
        </div>

        <div className="text-xs leading-5 text-white/38">
          <p>
            {fetchedAt
              ? t("fuel.updated", {
                  date: new Intl.DateTimeFormat(locale, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(fetchedAt)),
                })
              : t("fuel.updatedRecently")}
          </p>
          <a
            href="https://creativecommons.tankerkoenig.de/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex min-h-8 items-center gap-1.5 text-[#ff9baa]"
          >
            {t("fuel.attribution")}
            <ExternalLink className="size-3" />
          </a>
        </div>
      </div>
    </aside>
  );
}
