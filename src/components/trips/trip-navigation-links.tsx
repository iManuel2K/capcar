"use client";

import { useLocale } from "next-intl";
import { ExternalLink } from "lucide-react";
import {
  createRoutedNavigationLegs,
  createRoutedNavigationSections,
  type TripRoute,
} from "@/features/trips/trip-route";

const copy = {
  en: {
    label: "Open driving directions",
    stops: "Stops",
    sections:
      "Long trips open in consecutive sections so no stops are skipped.",
    legs: "Waze & OpenStreetMap · stop by stop",
    note: "Follow the numbered legs in order. Waze starts from your current location.",
    roads: "Other map apps may choose different roads.",
  },
  de: {
    label: "Wegbeschreibung öffnen",
    stops: "Stopps",
    sections:
      "Lange Fahrten werden in aufeinanderfolgenden Abschnitten geöffnet, damit kein Stopp fehlt.",
    legs: "Waze & OpenStreetMap · von Stopp zu Stopp",
    note: "Öffne die nummerierten Etappen der Reihe nach. Waze startet an deinem aktuellen Standort.",
    roads: "Andere Karten-Apps können andere Straßen wählen.",
  },
  el: {
    label: "Άνοιγμα οδηγιών οδήγησης",
    stops: "Στάσεις",
    sections:
      "Τα μεγάλα ταξίδια ανοίγουν σε διαδοχικά τμήματα, χωρίς παράλειψη στάσεων.",
    legs: "Waze & OpenStreetMap · στάση προς στάση",
    note: "Ακολούθησε τα αριθμημένα σκέλη με τη σειρά. Το Waze ξεκινά από την τρέχουσα τοποθεσία σου.",
    roads: "Άλλες εφαρμογές χαρτών μπορεί να επιλέξουν διαφορετικούς δρόμους.",
  },
  sq: {
    label: "Hap udhëzimet e drejtimit",
    stops: "Ndalesat",
    sections:
      "Udhëtimet e gjata hapen në pjesë të njëpasnjëshme, pa anashkaluar ndalesa.",
    legs: "Waze & OpenStreetMap · ndalesë pas ndalese",
    note: "Ndiq pjesët e numëruara sipas radhës. Waze niset nga vendndodhja jote aktuale.",
    roads:
      "Aplikacionet e tjera të hartave mund të zgjedhin rrugë të ndryshme.",
  },
  ja: {
    label: "運転ルートを開く",
    stops: "立ち寄り先",
    sections:
      "長いルートは立ち寄り先を省略せず、連続する区間に分けて開きます。",
    legs: "Waze・OpenStreetMap：区間ごとに案内",
    note: "番号順に各区間を開いてください。Wazeは現在地から案内を開始します。",
    roads: "他の地図アプリでは異なる道路が選ばれる場合があります。",
  },
} as const;

const linkClass =
  "inline-flex min-h-11 items-center gap-2 rounded-full border border-[#0e2d30]/15 bg-white/55 px-3 py-2 text-xs text-[#0e2d30] transition hover:border-[#92644d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#92644d]";

export function TripNavigationLinks({ route }: { route: TripRoute }) {
  const locale = useLocale();
  const t = copy[locale as keyof typeof copy] ?? copy.en;
  const sections = createRoutedNavigationSections(route.stops);
  const legs = createRoutedNavigationLegs(route.stops);
  return (
    <nav aria-label={t.label} className="w-full min-w-0 space-y-3">
      {sections.length > 1 && (
        <p className="text-xs leading-5 text-[#405856]">{t.sections}</p>
      )}
      <div className="flex flex-wrap gap-2">
        {sections.map((section) => (
          <div key={section.startIndex} className="flex flex-wrap gap-2">
            <a
              className={linkClass}
              href={section.links.google}
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Maps
              {sections.length > 1 &&
                ` · ${t.stops} ${section.startIndex + 1}–${section.endIndex + 1}`}
              <ExternalLink aria-hidden className="size-3" />
            </a>
            <a
              className={linkClass}
              href={section.links.apple}
              target="_blank"
              rel="noopener noreferrer"
            >
              Apple Maps
              {sections.length > 1 &&
                ` · ${t.stops} ${section.startIndex + 1}–${section.endIndex + 1}`}
              <ExternalLink aria-hidden className="size-3" />
            </a>
          </div>
        ))}
      </div>
      <details className="rounded-xl border border-[#0e2d30]/10 px-3">
        <summary className="min-h-11 cursor-pointer py-3 text-xs font-medium text-[#0e2d30] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#92644d]">
          {t.legs}
        </summary>
        <p className="mb-3 max-w-xl text-xs leading-5 text-[#405856]">
          {t.note}
        </p>
        <ol className="space-y-3 pb-3">
          {legs.map((leg) => (
            <li key={leg.startIndex}>
              <p className="mb-2 text-xs leading-5 text-[#405856]">
                {leg.startIndex + 1}. {route.stops[leg.startIndex].name} →{" "}
                {route.stops[leg.endIndex].name}
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  className={linkClass}
                  href={leg.links.waze}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Waze: ${route.stops[leg.endIndex].name}`}
                >
                  Waze
                  <ExternalLink aria-hidden className="size-3" />
                </a>
                <a
                  className={linkClass}
                  href={leg.links.openStreetMap}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`OpenStreetMap: ${route.stops[leg.startIndex].name} → ${route.stops[leg.endIndex].name}`}
                >
                  OpenStreetMap
                  <ExternalLink aria-hidden className="size-3" />
                </a>
              </div>
            </li>
          ))}
        </ol>
      </details>
      <p className="text-xs leading-5 text-[#405856]">{t.roads}</p>
    </nav>
  );
}
