"use client";

import { Camera, FileSearch, ShieldCheck } from "lucide-react";
import { useLocale } from "next-intl";
import Link from "next/link";
import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import type { AppLocale } from "@/i18n/config";
import type { MaintenanceTask } from "@/features/maintenance/maintenance-schema";
import {
  prepareServicePhoto,
  ServicePhotoError,
} from "@/features/service-review/prepare-service-photo";
import { serviceReviewCopy } from "@/features/service-review/service-review-copy";
import {
  SERVICE_REVIEW_MAX_MILEAGE,
  SERVICE_REVIEW_MAX_PHOTOS,
  type ServiceReviewRequest,
  type ServiceReviewResult,
  serviceReviewResultSchema,
} from "@/features/service-review/service-review-schema";
import type { Vehicle } from "@/features/vehicles/vehicle-schema";

type PanelCopy = (typeof serviceReviewCopy)["en"];
type Photo = { name: string; data: string };
type FeedbackKey =
  | "noPhotos"
  | "invalidImage"
  | "imageTooLarge"
  | "imageFailed"
  | "maxPhotos"
  | "missingConsent"
  | "invalidHistory"
  | "requestFailed"
  | "connectionRequired"
  | "providerUnavailable";

const inputStyle =
  "text-foreground min-h-11 w-full rounded-xl border border-white/15 bg-background px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-primary";
const secondaryStyle =
  "text-muted-foreground hover:text-foreground inline-flex min-h-11 items-center rounded-xl border border-white/15 px-4 text-sm font-medium focus-visible:outline-2 focus-visible:outline-primary";

export function ServiceReviewPanel({
  vehicle,
  tasks,
}: {
  vehicle: Vehicle;
  tasks: MaintenanceTask[];
}) {
  const locale = useLocale() as AppLocale;
  const c = serviceReviewCopy[locale] ?? serviceReviewCopy.en;
  const id = useId();
  const request = useRef<AbortController | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [consent, setConsent] = useState(false);
  const [historyDate, setHistoryDate] = useState("");
  const [historyMileage, setHistoryMileage] = useState("");
  const [preparing, setPreparing] = useState(false);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackKey>();
  const [result, setResult] = useState<ServiceReviewResult>();
  const today = new Date().toISOString().slice(0, 10);

  useEffect(
    () => () => {
      request.current?.abort();
      request.current = null;
    },
    [],
  );

  function resetResult() {
    setResult(undefined);
    setFeedback(undefined);
  }

  async function selectFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";
    if (!files.length) return;
    resetResult();
    if (files.length > SERVICE_REVIEW_MAX_PHOTOS - photos.length) {
      setFeedback("maxPhotos");
      return;
    }
    setPreparing(true);
    const prepared: Photo[] = [];
    try {
      for (const file of files)
        prepared.push({
          name: file.name,
          data: await prepareServicePhoto(file),
        });
      setPhotos((current) => [...current, ...prepared]);
      setConsent(false);
    } catch (error) {
      setFeedback(
        error instanceof ServicePhotoError ? error.code : "imageFailed",
      );
    } finally {
      setPreparing(false);
    }
  }

  function cancel() {
    request.current?.abort();
    request.current = null;
    setPending(false);
  }

  function clear() {
    resetResult();
    setPhotos([]);
    setHistoryDate("");
    setHistoryMileage("");
    setConsent(false);
  }

  async function review(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (request.current || preparing) return;
    resetResult();
    if (!photos.length) return setFeedback("noPhotos");
    if (!consent) return setFeedback("missingConsent");
    const readingKm = Number(historyMileage);
    const hasHistory = Boolean(historyDate || historyMileage);
    if (
      hasHistory &&
      (!historyDate ||
        historyDate < "1886-01-01" ||
        historyDate > today ||
        !historyMileage.trim() ||
        !Number.isInteger(readingKm) ||
        readingKm < 0 ||
        readingKm > SERVICE_REVIEW_MAX_MILEAGE)
    )
      return setFeedback("invalidHistory");
    const body: ServiceReviewRequest = {
      consent: true,
      photos: photos.map(({ data }) => ({ data })),
      vehicle: {
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.productionYear,
        engine: vehicle.engineCode,
        mileage: vehicle.mileageKnown === false ? undefined : vehicle.mileage,
      },
      history: hasHistory
        ? { date: historyDate, mileage: readingKm }
        : undefined,
      tasks: tasks.map((task) => ({
        key: task.key,
        title: task.title,
        intervalMonths: task.intervalMonths,
        intervalMileage: task.intervalKm,
        record: task.record
          ? {
              date: task.record.lastCompletedDate,
              mileage: task.record.lastCompletedMileage,
            }
          : undefined,
      })),
    };
    const active = new AbortController();
    request.current = active;
    setPending(true);
    try {
      const response = await fetch("/api/maintenance/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: active.signal,
      });
      const payload: unknown = await response.json();
      if (request.current !== active) return;
      if (!response.ok) {
        const code =
          payload && typeof payload === "object" && "code" in payload
            ? payload.code
            : null;
        setFeedback(
          code === "ai_connection_required" || response.status === 401
            ? "connectionRequired"
            : code === "invalid_image"
              ? "invalidImage"
              : code === "invalid_history"
                ? "invalidHistory"
                : response.status === 413
                  ? "imageTooLarge"
                  : code === "provider_input_rejected" || response.status >= 500
                    ? "providerUnavailable"
                    : "requestFailed",
        );
        return;
      }
      setResult(serviceReviewResultSchema.parse(payload));
    } catch {
      if (request.current === active && !active.signal.aborted)
        setFeedback("requestFailed");
    } finally {
      if (request.current === active) {
        request.current = null;
        setPending(false);
      }
    }
  }

  return (
    <section
      aria-labelledby={`${id}-heading`}
      className="bg-card mt-5 space-y-5 rounded-[2rem] border border-white/10 p-5 sm:p-7"
    >
      <header className="flex items-start gap-3">
        <FileSearch
          aria-hidden="true"
          className="text-primary mt-1 size-6 shrink-0"
        />
        <div>
          <h2 id={`${id}-heading`} className="text-xl font-medium">
            {c.heading}
          </h2>
          <p className="text-muted-foreground mt-1 max-w-3xl leading-6">
            {c.intro}
          </p>
        </div>
      </header>
      <form className="space-y-4" onSubmit={review} noValidate>
        <fieldset className="min-w-0 space-y-4" disabled={pending || preparing}>
          <div className="border-primary/30 bg-primary/5 rounded-2xl border border-dashed p-4">
            <label
              htmlFor={`${id}-photos`}
              className="flex items-center gap-2 font-medium"
            >
              <Camera aria-hidden="true" className="text-primary size-4" />{" "}
              {c.fileLabel}
            </label>
            <p
              id={`${id}-formats`}
              className="text-muted-foreground mt-1 text-sm"
            >
              {c.fileHint}
            </p>
            <input
              id={`${id}-photos`}
              aria-describedby={`${id}-formats`}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              disabled={photos.length >= SERVICE_REVIEW_MAX_PHOTOS}
              onChange={selectFiles}
              className="text-muted-foreground file:bg-primary file:text-primary-foreground mt-3 block min-h-11 w-full max-w-full cursor-pointer text-sm file:mr-3 file:cursor-pointer file:rounded-xl file:border-0 file:px-4 file:py-3 file:font-semibold"
            />
            {photos.length > 0 && (
              <ol className="mt-2 space-y-2">
                {photos.map((photo, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/10 px-3 py-1"
                  >
                    <span className="min-w-0 text-sm break-all">
                      {c.photo} {index + 1} · {photo.name}
                    </span>
                    <button
                      type="button"
                      className="text-primary min-h-11 shrink-0 px-2 text-sm underline underline-offset-4"
                      aria-label={`${c.remove} ${index + 1}`}
                      onClick={() => {
                        setPhotos((selected) =>
                          selected.filter((_, i) => i !== index),
                        );
                        setConsent(false);
                        resetResult();
                      }}
                    >
                      {c.remove}
                    </button>
                  </li>
                ))}
              </ol>
            )}
          </div>
          <details className="bg-background/30 rounded-2xl border border-white/10 px-4">
            <summary className="focus-visible:outline-primary cursor-pointer py-3 font-medium">
              {c.historyHeading}
            </summary>
            <div className="space-y-3 border-t border-white/10 py-4">
              <p className="text-muted-foreground text-sm leading-6">
                {c.historyHelp}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-sm font-medium">
                  <span>{c.date}</span>
                  <input
                    type="date"
                    value={historyDate}
                    min="1886-01-01"
                    max={today}
                    className={inputStyle}
                    onChange={(event) => {
                      setHistoryDate(event.target.value);
                      resetResult();
                    }}
                  />
                </label>
                <label className="space-y-1 text-sm font-medium">
                  <span>{c.mileage}</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={historyMileage}
                    min={0}
                    max={SERVICE_REVIEW_MAX_MILEAGE}
                    step={1}
                    className={inputStyle}
                    onChange={(event) => {
                      setHistoryMileage(event.target.value);
                      resetResult();
                    }}
                  />
                </label>
              </div>
              <Link
                className="text-primary inline-flex min-h-11 items-center text-sm underline underline-offset-4"
                href={`/garage/${encodeURIComponent(vehicle.id)}/known-problems`}
              >
                {c.recallLink}
              </Link>
            </div>
          </details>
          <div className="text-muted-foreground flex items-start gap-2 text-sm leading-6">
            <ShieldCheck
              aria-hidden="true"
              className="text-primary mt-0.5 size-4 shrink-0"
            />
            <p>{c.privacy}</p>
          </div>
          <label className="flex min-h-11 items-start gap-3 rounded-xl border border-white/10 px-3 py-2.5 text-sm leading-6">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => {
                setConsent(event.target.checked);
                setFeedback(undefined);
              }}
              className="accent-primary mt-1 size-4 shrink-0"
            />
            <span>{c.consent}</span>
          </label>
        </fieldset>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={pending || preparing}
            className="bg-primary text-primary-foreground inline-flex min-h-11 items-center rounded-xl px-5 text-sm font-semibold disabled:opacity-60"
          >
            {pending ? c.reviewing : c.submit}
          </button>
          {pending ? (
            <button type="button" className={secondaryStyle} onClick={cancel}>
              {c.cancel}
            </button>
          ) : (
            (photos.length > 0 || result) && (
              <button
                type="button"
                className={secondaryStyle}
                disabled={preparing}
                onClick={clear}
              >
                {c.clear}
              </button>
            )
          )}
          <Link
            href="/account/connections"
            className="text-primary inline-flex min-h-11 items-center text-sm underline underline-offset-4"
          >
            {c.connect}
          </Link>
        </div>
      </form>
      {pending && (
        <p role="status" className="text-muted-foreground text-sm">
          {c.reviewing}
        </p>
      )}
      {feedback && (
        <div
          role="alert"
          className="border-destructive/30 text-foreground rounded-xl border p-3 text-sm"
        >
          {c[feedback]}
        </div>
      )}
      {result && (
        <ReviewOverview result={result} c={c} locale={locale} id={id} />
      )}
    </section>
  );
}

function ReviewOverview({
  result,
  c,
  locale,
  id,
}: {
  result: ServiceReviewResult;
  c: PanelCopy;
  locale: AppLocale;
  id: string;
}) {
  const km = (n: number) => `${new Intl.NumberFormat(locale).format(n)} km`;
  const groups = [
    { status: "due", label: c.due, tone: "border-amber-300/35 text-amber-100" },
    {
      status: "unconfirmed",
      label: c.unconfirmed,
      tone: "border-white/15 text-muted-foreground",
    },
    {
      status: "documented",
      label: c.documented,
      tone: "border-emerald-300/35 text-emerald-100",
    },
  ] as const;

  return (
    <section
      aria-labelledby={`${id}-results`}
      className="space-y-4 border-t border-white/10 pt-5"
    >
      <div aria-live="polite">
        <h3 id={`${id}-results`} className="text-lg font-semibold">
          {c.results}
        </h3>
        <p className="text-muted-foreground mt-1 text-sm leading-6">
          {c.intervalNote}
        </p>
      </div>
      {result.warnings.length > 0 && (
        <ul className="space-y-2 rounded-xl border border-amber-300/30 bg-amber-300/8 p-4 text-sm leading-6">
          {result.warnings.map((warning) => (
            <li key={warning}>{c.warnings[warning]}</li>
          ))}
        </ul>
      )}
      <div className="grid gap-3 lg:grid-cols-3">
        {groups.map(({ status, label, tone }) => {
          const items = result.items.filter((item) => item.status === status);
          return (
            <section
              key={status}
              aria-label={label}
              className={`min-w-0 rounded-2xl border p-4 ${tone}`}
            >
              <h4 className="font-semibold">
                {label} · {items.length}
              </h4>
              <ul className="text-foreground divide-y divide-white/10">
                {items.map((item) => (
                  <li key={item.taskKey} className="py-2 text-sm leading-6">
                    <p className="font-medium">{item.title}</p>
                    {item.source && (
                      <p className="text-muted-foreground">
                        {item.photoIndex !== null
                          ? `${c.photo} ${item.photoIndex + 1}`
                          : c.garageRecord}
                        {item.date ? ` · ${item.date}` : ""}
                        {item.mileage !== null ? ` · ${km(item.mileage)}` : ""}
                      </p>
                    )}
                    {(item.nextDueDate || item.nextDueMileage !== null) && (
                      <p className="text-muted-foreground">
                        {c.target}:{" "}
                        {[
                          item.nextDueDate,
                          item.nextDueMileage !== null
                            ? km(item.nextDueMileage)
                            : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
      <details className="rounded-xl border border-white/10 px-4">
        <summary className="cursor-pointer py-3 font-medium">
          {c.extracted} · {result.evidence.length}
        </summary>
        {result.evidence.length ? (
          <ul className="divide-y divide-white/10">
            {result.evidence.map((entry, i) => (
              <li key={i} className="py-3 text-sm leading-6">
                <p className="font-medium">{entry.work}</p>
                <p className="text-muted-foreground">
                  {c.photo} {entry.photoIndex + 1} · {entry.date ?? c.noDate} ·{" "}
                  {entry.mileage !== null ? km(entry.mileage) : c.noMileage}
                </p>
                <p className="text-muted-foreground break-words">
                  {entry.excerpt}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground pb-4 text-sm">{c.noEvidence}</p>
        )}
      </details>
      <p className="text-muted-foreground text-sm">{c.notSaved}</p>
    </section>
  );
}
