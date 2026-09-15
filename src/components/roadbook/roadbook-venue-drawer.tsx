"use client";

import {
  AlertTriangle,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileScan,
  Flag,
  Gauge,
  MapPin,
  Ruler,
  Save,
  ShieldCheck,
  Volume2,
  X,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";

import { evaluateRoadbookReadiness } from "@/features/roadbook/roadbook-readiness";
import type {
  RecordRoadbookVisitInput,
  RoadbookReportInput,
  RoadbookVenue,
} from "@/features/roadbook/roadbook-schema";
import type { Vehicle } from "@/features/vehicles/vehicle-schema";

type ActionState = "idle" | "working" | "done";

export function RoadbookVenueDrawer({
  venue,
  vehicles,
  vehicleId,
  onVehicleChange,
  onClose,
  onSave,
  onRecord,
  onReport,
}: {
  venue: RoadbookVenue;
  vehicles: Vehicle[];
  vehicleId?: string;
  onVehicleChange: (vehicleId: string) => void;
  onClose: () => void;
  onSave: (vehicleId: string) => Promise<void>;
  onRecord: (input: {
    vehicle: Vehicle;
    details: RecordRoadbookVisitInput;
    photos: File[];
    obdFile?: File;
  }) => Promise<void>;
  onReport: (input: RoadbookReportInput) => Promise<void>;
}) {
  const t = useTranslations("Roadbook");
  const locale = useLocale();
  const photoInputId = useId();
  const obdInputId = useId();
  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === vehicleId);
  const readiness = useMemo(
    () => evaluateRoadbookReadiness(selectedVehicle, venue),
    [selectedVehicle, venue],
  );
  const [saveState, setSaveState] = useState<ActionState>("idle");
  const [recordState, setRecordState] = useState<ActionState>("idle");
  const [reportState, setReportState] = useState<ActionState>("idle");
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [obdFile, setObdFile] = useState<File>();
  const [visitDate, setVisitDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [bestLap, setBestLap] = useState("");
  const [visitNotes, setVisitNotes] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");

  const price =
    venue.entryPriceCents === undefined
      ? t("details.confirmPrice")
      : new Intl.NumberFormat(locale, {
          style: "currency",
          currency: venue.priceCurrency,
        }).format(venue.entryPriceCents / 100);
  const openingHours = Object.entries(venue.openingHours);

  function explainError(caught: unknown) {
    const message =
      caught instanceof Error ? caught.message : t("errors.generic");
    setError(
      message === "SIGN_IN_REQUIRED"
        ? t("errors.signInRequired")
        : t("errors.generic"),
    );
  }

  return (
    <aside
      aria-label={t("details.label")}
      className="absolute inset-x-2 bottom-2 z-30 max-h-[72%] overflow-y-auto rounded-[1.6rem] border border-white/12 bg-[#0a0f0c]/96 text-white shadow-[0_24px_90px_rgba(0,0,0,.45)] backdrop-blur-2xl lg:inset-y-3 lg:right-3 lg:left-auto lg:max-h-none lg:w-[26rem]"
    >
      <div className="sticky top-0 z-10 flex items-start justify-between gap-5 border-b border-white/8 bg-[#0a0f0c]/94 p-5 backdrop-blur-xl">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold tracking-[0.12em] uppercase">
            <span className="text-[#ff667a]">
              {t(`categories.${venue.category}`)}
            </span>
            <span className="text-white/25">·</span>
            <span className="text-white/45">
              {venue.city || venue.countryCode}
            </span>
          </div>
          <h2 className="mt-2 text-2xl font-medium tracking-[-0.035em]">
            {venue.name}
          </h2>
        </div>
        <button
          type="button"
          aria-label={t("details.close")}
          onClick={onClose}
          className="grid size-10 shrink-0 place-items-center rounded-full border border-white/10 text-white/55 transition hover:bg-white/8 hover:text-white"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div className="space-y-5 p-5">
        {venue.category === "autobahn_context" && (
          <SafetyNotice text={t("safety.autobahn")} />
        )}
        {(venue.category === "drift_circuit" ||
          venue.category === "drag_acceleration") && (
          <SafetyNotice text={t("safety.closedVenue")} />
        )}

        <p className="text-sm leading-6 text-white/55">{venue.description}</p>

        <div className="grid grid-cols-2 gap-2">
          <Fact
            icon={ShieldCheck}
            label={t("details.access")}
            value={t(`access.${venue.accessStatus}`)}
          />
          <Fact
            icon={Flag}
            label={t("details.surface")}
            value={venue.surface ?? t("details.unknown")}
          />
          <Fact
            icon={Ruler}
            label={t("details.length")}
            value={
              venue.lengthM
                ? `${(venue.lengthM / 1000).toLocaleString(locale)} km`
                : t("details.unknown")
            }
          />
          <Fact
            icon={Volume2}
            label={t("details.noise")}
            value={
              venue.noiseLimitDb
                ? `${venue.noiseLimitDb} dB`
                : t("details.confirmLimit")
            }
          />
          <Fact
            icon={Clock3}
            label={t("details.hours")}
            value={
              openingHours.length
                ? openingHours
                    .map(([day, hours]) => `${day}: ${hours}`)
                    .join(" · ")
                : t("details.confirmHours")
            }
          />
          <Fact icon={Gauge} label={t("details.entry")} value={price} />
        </div>

        <div className="rounded-2xl border border-white/9 bg-white/[0.035] p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-white/75">
              <CheckCircle2 className="size-4 text-[#6bd2ae]" />
              {t(`verification.${venue.verificationStatus}`)}
            </span>
            <span className="text-xs text-white/35">
              {(venue.distanceM / 1000).toLocaleString(locale, {
                maximumFractionDigits: 0,
              })}{" "}
              km
            </span>
          </div>
          <p className="mt-2 text-xs leading-5 text-white/40">
            {venue.verifiedAt
              ? t("details.verifiedOn", {
                  date: new Intl.DateTimeFormat(locale, {
                    dateStyle: "medium",
                  }).format(new Date(venue.verifiedAt)),
                })
              : t("details.sourceLinked")}
          </p>
          <a
            href={venue.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex min-h-10 items-center gap-2 text-xs font-semibold text-[#ff788a] underline-offset-4 hover:underline"
          >
            {venue.sourceLabel} <ExternalLink className="size-3.5" />
          </a>
        </div>

        <div className="rounded-2xl border border-white/9 bg-white/[0.035] p-4">
          <label
            htmlFor="roadbook-vehicle"
            className="text-xs font-semibold tracking-[0.1em] text-white/40 uppercase"
          >
            {t("vehicle.label")}
          </label>
          <select
            id="roadbook-vehicle"
            value={vehicleId ?? ""}
            onChange={(event) => onVehicleChange(event.target.value)}
            className="mt-3 min-h-11 w-full rounded-xl border border-white/12 bg-[#111713] px-3 text-sm text-white outline-none focus:border-[#e72d45]"
          >
            <option value="">{t("vehicle.choose")}</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.productionYear} {vehicle.make} {vehicle.model} ·{" "}
                {vehicle.platform}
              </option>
            ))}
          </select>
          <div className="mt-4 grid gap-2">
            {readiness.map((check) => (
              <div
                key={check.key}
                className="flex items-start gap-2 text-xs leading-5 text-white/48"
              >
                {check.state === "ready" ? (
                  <Check className="mt-0.5 size-3.5 shrink-0 text-[#6bd2ae]" />
                ) : (
                  <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-300" />
                )}
                {t(`readiness.${check.key}.${check.state}`)}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-xl border border-red-300/20 bg-red-300/8 p-3 text-xs leading-5 text-red-100"
          >
            {error}
          </p>
        )}

        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            disabled={!selectedVehicle || saveState === "working"}
            onClick={async () => {
              if (!selectedVehicle) return;
              setError("");
              setSaveState("working");
              try {
                await onSave(selectedVehicle.id);
                setSaveState("done");
              } catch (caught) {
                setSaveState("idle");
                explainError(caught);
              }
            }}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#e72d45] px-4 text-sm font-semibold text-white transition hover:bg-[#f13d54] disabled:cursor-not-allowed disabled:opacity-45"
          >
            {saveState === "done" ? (
              <Check className="size-4" />
            ) : (
              <Save className="size-4" />
            )}
            {saveState === "done" ? t("actions.saved") : t("actions.save")}
          </button>
          {venue.bookingUrl ? (
            <a
              href={venue.bookingUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/12 px-4 text-sm font-semibold text-white/75 hover:bg-white/7 hover:text-white"
            >
              {t("actions.booking")} <ExternalLink className="size-4" />
            </a>
          ) : (
            <a
              href={venue.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/12 px-4 text-sm font-semibold text-white/75 hover:bg-white/7 hover:text-white"
            >
              {t("actions.checkSource")} <ExternalLink className="size-4" />
            </a>
          )}
        </div>

        <details className="rounded-2xl border border-white/9 bg-white/[0.025] p-4">
          <summary className="flex min-h-8 cursor-pointer list-none items-center gap-2 text-sm font-semibold [&::-webkit-details-marker]:hidden">
            <CalendarDays className="size-4 text-[#ff667a]" />{" "}
            {t("visit.title")}
          </summary>
          <div className="mt-4 grid gap-3">
            <label className="grid gap-1.5 text-xs text-white/48">
              {t("visit.date")}
              <input
                type="date"
                max={new Date().toISOString().slice(0, 10)}
                value={visitDate}
                onChange={(event) => setVisitDate(event.target.value)}
                className="min-h-11 rounded-xl border border-white/12 bg-[#111713] px-3 text-sm text-white"
              />
            </label>
            <label className="grid gap-1.5 text-xs text-white/48">
              {t("visit.lap")}
              <input
                type="number"
                min="1"
                max="86400"
                step="0.001"
                value={bestLap}
                onChange={(event) => setBestLap(event.target.value)}
                placeholder={t("visit.lapPlaceholder")}
                className="min-h-11 rounded-xl border border-white/12 bg-[#111713] px-3 text-sm text-white placeholder:text-white/25"
              />
            </label>
            <label className="grid gap-1.5 text-xs text-white/48">
              {t("visit.notes")}
              <textarea
                value={visitNotes}
                onChange={(event) => setVisitNotes(event.target.value)}
                maxLength={2000}
                rows={3}
                className="rounded-xl border border-white/12 bg-[#111713] px-3 py-2 text-sm text-white"
              />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label
                htmlFor={photoInputId}
                className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/18 text-xs text-white/58 hover:bg-white/6"
              >
                <Camera className="size-4" />{" "}
                {photos.length
                  ? t("visit.photosChosen", { count: photos.length })
                  : t("visit.photos")}
              </label>
              <input
                id={photoInputId}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(event) =>
                  setPhotos(Array.from(event.target.files ?? []).slice(0, 4))
                }
              />
              <label
                htmlFor={obdInputId}
                className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/18 text-xs text-white/58 hover:bg-white/6"
              >
                <FileScan className="size-4" />{" "}
                {obdFile ? obdFile.name.slice(0, 18) : t("visit.obd")}
              </label>
              <input
                id={obdInputId}
                type="file"
                accept=".txt,.csv,.json,text/plain,text/csv,application/json"
                className="sr-only"
                onChange={(event) => setObdFile(event.target.files?.[0])}
              />
            </div>
            <p className="text-[11px] leading-5 text-white/34">
              {t("visit.evidenceNotice")}
            </p>
            <button
              type="button"
              disabled={!selectedVehicle || recordState === "working"}
              onClick={async () => {
                if (!selectedVehicle) return;
                if (photos.some((file) => file.size > 12 * 1024 * 1024)) {
                  setError(t("errors.photoTooLarge"));
                  return;
                }
                if (obdFile && obdFile.size > 1024 * 1024) {
                  setError(t("errors.obdTooLarge"));
                  return;
                }
                setError("");
                setRecordState("working");
                try {
                  await onRecord({
                    vehicle: selectedVehicle,
                    details: {
                      visitedAt: visitDate,
                      notes: visitNotes || undefined,
                      bestLapSeconds: bestLap ? Number(bestLap) : undefined,
                    },
                    photos,
                    obdFile,
                  });
                  setRecordState("done");
                } catch (caught) {
                  setRecordState("idle");
                  explainError(caught);
                }
              }}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#f1eadf] px-4 text-sm font-semibold text-[#102e30] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {recordState === "done" ? (
                <Check className="size-4" />
              ) : (
                <MapPin className="size-4" />
              )}
              {recordState === "done" ? t("visit.recorded") : t("visit.action")}
            </button>
          </div>
        </details>

        <details className="rounded-2xl border border-white/9 bg-white/[0.025] p-4">
          <summary className="flex min-h-8 cursor-pointer list-none items-center gap-2 text-sm font-semibold [&::-webkit-details-marker]:hidden">
            <AlertTriangle className="size-4 text-amber-300" />{" "}
            {t("report.title")}
          </summary>
          <div className="mt-4 grid gap-3">
            <textarea
              value={reportReason}
              onChange={(event) => setReportReason(event.target.value)}
              minLength={10}
              maxLength={1000}
              rows={3}
              placeholder={t("report.placeholder")}
              className="rounded-xl border border-white/12 bg-[#111713] px-3 py-2 text-sm text-white placeholder:text-white/25"
            />
            <input
              type="url"
              value={evidenceUrl}
              onChange={(event) => setEvidenceUrl(event.target.value)}
              placeholder={t("report.sourcePlaceholder")}
              className="min-h-11 rounded-xl border border-white/12 bg-[#111713] px-3 text-sm text-white placeholder:text-white/25"
            />
            <button
              type="button"
              disabled={
                reportReason.trim().length < 10 || reportState === "working"
              }
              onClick={async () => {
                setError("");
                setReportState("working");
                try {
                  await onReport({
                    reason: reportReason,
                    evidenceUrl: evidenceUrl || undefined,
                  });
                  setReportState("done");
                } catch (caught) {
                  setReportState("idle");
                  explainError(caught);
                }
              }}
              className="min-h-11 rounded-xl border border-white/12 text-xs font-semibold text-white/65 hover:bg-white/6 disabled:opacity-45"
            >
              {reportState === "done" ? t("report.sent") : t("report.action")}
            </button>
          </div>
        </details>
      </div>
    </aside>
  );
}

function SafetyNotice({ text }: { text: string }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/8 p-4 text-xs leading-5 text-amber-50/75">
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-300" />
      {text}
    </div>
  );
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div className="min-h-23 rounded-xl border border-white/8 bg-white/[0.025] p-3">
      <Icon className="size-3.5 text-white/35" aria-hidden="true" />
      <p className="mt-3 text-[10px] tracking-[0.1em] text-white/28 uppercase">
        {label}
      </p>
      <p className="mt-1 text-xs leading-5 text-white/70">{value}</p>
    </div>
  );
}
