"use client";
import Image from "next/image";
import Link from "next/link";
import { Check, Download, Share2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type {
  Build,
  BuildItem,
  BuildItemStatus,
} from "@/features/builds/build-schema";
import { getConnectedBuildMetrics } from "@/features/builds/build-planning";
import {
  reopenBuildCompletion,
  saveBuildCompletion,
  shareCardData,
  storyMilestones,
} from "@/features/builds/build-story";
import { announceBuildChange } from "@/features/builds/build-storage";
import { announceCostChange } from "@/features/costs/cost-storage";
import { useGarageCopy } from "@/features/onboarding/use-garage-copy";
import { preparePassportPhoto } from "@/features/passport/passport-photo";
import { trackAnalytics } from "@/features/analytics/client";
import { createBuildProgressCard } from "@/features/builds/build-progress-card";
import { actualItemCost } from "@/features/builds/build-costs";
import { activateGarage } from "@/features/onboarding/activation";
import { trackBuildProgress } from "@/features/builds/build-analytics";
import { garageStatuses } from "@/features/onboarding/copy";
import { useLocale } from "next-intl";
import { isAppLocale } from "@/i18n/config";

const button =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/25 px-4 py-2 text-sm text-[#ede9d8] transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d6aa92] disabled:opacity-50";
const input =
  "mt-2 min-h-12 w-full rounded-xl border border-white/20 bg-[#091e20] px-3 text-base text-white outline-none focus-visible:ring-2 focus-visible:ring-[#d6aa92]";

export function CompletionPhotos({
  beforePhoto,
  afterPhoto,
}: {
  beforePhoto?: string;
  afterPhoto?: string;
}) {
  const c = useGarageCopy();
  if (!beforePhoto && !afterPhoto) return null;
  return (
    <div
      aria-label={c.photosPrivate}
      className="mt-4 grid gap-3 sm:grid-cols-2"
    >
      {[
        [beforePhoto, c.before],
        [afterPhoto, c.after],
      ].map(
        ([src, label]) =>
          src && (
            <figure key={label} className="min-w-0">
              <Image
                unoptimized
                className="aspect-video w-full rounded-xl bg-black/20 object-contain"
                src={src}
                alt={label!}
                width={600}
                height={400}
              />
              <figcaption className="mt-2 text-xs text-white/65">
                {label} · {c.private}
              </figcaption>
            </figure>
          ),
      )}
    </div>
  );
}

export function BuildTaskCompletion({
  vehicleId,
  item,
  onStatusChange,
}: {
  vehicleId: string;
  item: BuildItem;
  onStatusChange: (id: string, status: BuildItemStatus) => void;
}) {
  const c = useGarageCopy();
  const locale = useLocale();
  const statusCopy = garageStatuses[isAppLocale(locale) ? locale : "en"];
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [cost, setCost] = useState("");
  const [accounting, setAccounting] = useState<"include" | "already-recorded">(
    "include",
  );
  const [before, setBefore] = useState<string>();
  const [after, setAfter] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const dateRef = useRef<HTMLInputElement>(null);
  const saving = useRef(false);
  useEffect(() => {
    if (open) dateRef.current?.focus();
  }, [open]);
  function begin() {
    setDate(
      item.completion?.completedOn ??
        item.workbench?.purchase?.installedAt ??
        new Date().toISOString().slice(0, 10),
    );
    setNote(item.completion?.note ?? "");
    setCost(
      item.completion?.actualCost === undefined
        ? ""
        : String(item.completion.actualCost),
    );
    setAccounting(
      item.workbench?.purchase?.accounting ??
        item.completion?.accounting ??
        "include",
    );
    setBefore(item.completion?.beforePhoto);
    setAfter(item.completion?.afterPhoto);
    setError("");
    setMessage("");
    setOpen(true);
  }
  async function photo(file: File | undefined, kind: "before" | "after") {
    if (!file) return;
    setBusy(true);
    try {
      const prepared = await preparePassportPhoto(file);
      if (kind === "before") setBefore(prepared);
      else setAfter(prepared);
    } catch {
      setError(c.photoError);
    } finally {
      setBusy(false);
    }
  }
  function save(event: React.FormEvent) {
    event.preventDefault();
    if (busy || saving.current) return;
    saving.current = true;
    try {
      const completedBefore = item.status === "installed";
      saveBuildCompletion(
        vehicleId,
        item.buildId,
        item.id,
        {
          completedOn: date,
          note: note || undefined,
          actualCost: cost === "" ? undefined : Number(cost),
          accounting,
          beforePhoto: before,
          afterPhoto: after,
        },
        localStorage,
      );
      announceBuildChange();
      announceCostChange();
      activateGarage(
        vehicleId,
        item.kind === "maintenance" ? "maintenance" : "modification",
      );
      setOpen(false);
      setError("");
      setMessage(c.completionSaved);
      if (!completedBefore) {
        trackAnalytics("build_task_completed", {
          action_type:
            item.kind === "maintenance" ? "maintenance" : "modification",
        });
        trackBuildProgress(item.buildId);
      }
    } catch {
      setError(c.completionError);
    } finally {
      saving.current = false;
    }
  }
  function reopen() {
    try {
      reopenBuildCompletion(vehicleId, item.buildId, item.id, localStorage);
      announceBuildChange();
      announceCostChange();
      setMessage(c.reopened);
      setError("");
      trackAnalytics("build_task_reopened");
      trackBuildProgress(item.buildId);
    } catch {
      setError(c.completionError);
    }
  }
  return (
    <div className="mt-4 min-w-0">
      <div className="flex flex-wrap items-center gap-2">
        {item.status !== "installed" && !item.workbench?.purchase && (
          <select
            className={button}
            aria-label={`${c.progress}: ${item.title}`}
            value={item.status}
            onChange={(event) =>
              onStatusChange(item.id, event.target.value as BuildItemStatus)
            }
          >
            <option value="planned">{statusCopy.planned}</option>
            <option value="ordered">{statusCopy.ordered}</option>
          </select>
        )}
        <button type="button" className={button} onClick={begin}>
          {item.status === "installed" ? c.editCompletion : c.complete}
          <Check className="size-4" />
        </button>
        {item.status === "installed" && (
          <button type="button" className={button} onClick={reopen}>
            {c.reopen}
          </button>
        )}
      </div>
      {open && (
        <form
          onSubmit={save}
          className="mt-4 rounded-2xl border border-[#d6aa92]/30 bg-[#102b2e] p-4 sm:p-5"
        >
          <div className="flex justify-between gap-3">
            <h4 className="font-medium">{c.story}</h4>
            <button
              className={button}
              type="button"
              aria-label={c.cancel}
              onClick={() => setOpen(false)}
            >
              <X className="size-4" />
            </button>
          </div>
          <p className="mt-3 text-xs leading-5 text-white/65">{c.private}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm">
              {c.completedOn}
              <input
                ref={dateRef}
                required
                className={input}
                type="date"
                max={new Date().toISOString().slice(0, 10)}
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </label>
            <label className="text-sm">
              {c.actualCost}
              <input
                className={input}
                type="number"
                min="0"
                step="0.01"
                max="1000000"
                value={cost}
                onChange={(event) => setCost(event.target.value)}
              />
            </label>
          </div>
          <p className="mt-3 text-xs leading-5 text-white/65">{c.actualHelp}</p>
          <label className="mt-4 block text-sm">
            {c.accounting}
            <select
              disabled={Boolean(item.workbench?.purchase)}
              className={input}
              value={accounting}
              onChange={(event) =>
                setAccounting(event.target.value as typeof accounting)
              }
            >
              <option value="include">{c.include}</option>
              <option value="already-recorded">{c.alreadyRecorded}</option>
            </select>
          </label>
          <label className="mt-4 block text-sm">
            {c.note}
            <textarea
              maxLength={300}
              className={`${input} min-h-24 py-3`}
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </label>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {(["before", "after"] as const).map((kind) => (
              <div key={kind} className="min-w-0">
                <label className="block text-sm">
                  {c[kind]}
                  <input
                    disabled={busy}
                    className="mt-3 block w-full text-xs file:mb-2 file:rounded-lg file:border-0 file:bg-[#ede9d8] file:px-3 file:py-3 file:text-[#102b2e]"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => {
                      void photo(event.target.files?.[0], kind);
                      event.target.value = "";
                    }}
                  />
                </label>
                {(kind === "before" ? before : after) && (
                  <button
                    type="button"
                    className="min-h-11 text-xs underline"
                    onClick={() =>
                      kind === "before"
                        ? setBefore(undefined)
                        : setAfter(undefined)
                    }
                  >
                    {c.removePhoto}
                  </button>
                )}
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs leading-5 text-white/65">{c.photoHelp}</p>
          <CompletionPhotos beforePhoto={before} afterPhoto={after} />
          <button
            disabled={busy}
            className={`${button.replace("text-[#ede9d8]", "text-[#102b2e]")} mt-5 bg-[#ede9d8]`}
            type="submit"
          >
            {c.saveCompletion}
          </button>
        </form>
      )}
      {!open && item.status === "installed" && (
        <>
          <p className="mt-3 text-xs text-white/65">
            {c.private}
            {item.completion ? ` · ${item.completion.completedOn}` : ""}
          </p>
          {item.completion?.note && (
            <p className="mt-3 text-sm whitespace-pre-wrap text-white/75">
              {item.completion.note}
            </p>
          )}
          <CompletionPhotos
            beforePhoto={item.completion?.beforePhoto}
            afterPhoto={item.completion?.afterPhoto}
          />
        </>
      )}
      {message && (
        <p
          role="status"
          className="mt-4 rounded-xl border border-[#d6aa92]/30 p-3 text-sm text-[#ede9d8] motion-safe:animate-[pulse_0.8s_ease-in-out_1]"
        >
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-4 text-sm text-red-200">
          {error}
        </p>
      )}
    </div>
  );
}

export function BuildStoryPanel({
  build,
  items,
}: {
  build: Build;
  items: BuildItem[];
}) {
  const c = useGarageCopy();
  const metrics = getConnectedBuildMetrics(build, items);
  const milestones = storyMilestones(items);
  const [card, setCard] = useState<Blob>();
  const [cardSignature, setCardSignature] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);
  const data = shareCardData(items);
  async function create() {
    try {
      const blob = await createBuildProgressCard(data, c);
      setCard(blob);
      setCardSignature(JSON.stringify(data));
      setUrl(URL.createObjectURL(blob));
      setError("");
      trackAnalytics("build_share_card_created");
    } catch {
      setError(c.shareError);
    }
  }
  async function share() {
    if (!card) return;
    const file = new File([card], "capcar-build-progress.png", {
      type: "image/png",
    });
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
        trackAnalytics("build_share_requested");
      } else {
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = file.name;
        anchor.click();
      }
    } catch (caught) {
      if (!(caught instanceof DOMException && caught.name === "AbortError"))
        setError(c.shareError);
    }
  }
  const money = (amount: number) =>
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  return (
    <section className="mt-5 rounded-3xl border border-[#d6aa92]/25 bg-[#102c2e] p-5 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-medium">{c.story}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
            {c.storyHint}
          </p>
        </div>
        <Link className={button} href={`/garage/${build.vehicleId}/timeline`}>
          {c.timeline}
        </Link>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          [c.progress, `${data.completed}/${data.total} · ${data.progress}%`],
          [
            c.planned,
            items.some((item) => item.estimatedCostKnown !== false)
              ? money(metrics.planned)
              : c.moneyUnknown,
          ],
          [
            c.actual,
            items.some((item) => actualItemCost(item) !== undefined)
              ? money(metrics.paid)
              : c.moneyUnknown,
          ],
          [c.forecast, money(metrics.forecast)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-white/10 p-4">
            <p className="text-xs text-white/65">{label}</p>
            <p className="mt-2 text-lg break-words">{value}</p>
          </div>
        ))}
      </div>
      <div
        role="progressbar"
        aria-label={c.progress}
        aria-valuenow={data.progress}
        aria-valuemin={0}
        aria-valuemax={100}
        className="mt-5 h-2 overflow-hidden rounded-full bg-white/10"
      >
        <div
          className="h-full bg-[#d6aa92] motion-safe:transition-[width] motion-safe:duration-500"
          style={{ width: `${data.progress}%` }}
        />
      </div>
      <p className="mt-3 text-xs leading-5 text-white/65">{c.progressHelp}</p>
      {build.budget === 0 && (
        <p className="mt-2 text-xs text-white/65">{c.budgetHint}</p>
      )}
      <div className="mt-5 flex flex-wrap gap-2">
        {milestones.firstWork && (
          <span className="rounded-full border border-[#d6aa92]/30 px-3 py-2 text-xs">
            ✓ {c.firstWork}
          </span>
        )}
        {milestones.firstMaintenance && (
          <span className="rounded-full border border-[#d6aa92]/30 px-3 py-2 text-xs">
            ✓ {c.firstMaintenance}
          </span>
        )}
        {milestones.stages.map((stage) => (
          <span
            key={stage}
            className="rounded-full border border-[#d6aa92]/30 px-3 py-2 text-xs"
          >
            ✓ {c[stage]}
          </span>
        ))}
      </div>
      <div className="mt-5 rounded-2xl border border-white/10 p-4">
        <p className="text-xs text-[#d6aa92]">{c.next}</p>
        <p className="mt-2 text-sm">
          {items.length === 0
            ? c.empty
            : (metrics.next?.title ??
              (data.progress === 100 ? c.allDone : c.completionError))}
        </p>
      </div>
      <div className="mt-5">
        <button className={button} type="button" onClick={() => void create()}>
          <Share2 className="size-4" />
          {c.share}
        </button>
        <p className="mt-3 max-w-2xl text-xs leading-5 text-white/65">
          {c.sharePrivacy}
        </p>
        {card && url && cardSignature === JSON.stringify(data) && (
          <div className="mt-4">
            <p role="status" className="text-sm">
              {c.shareReady}
            </p>
            <Image
              src={url}
              alt={c.cardTitle}
              width={270}
              height={338}
              unoptimized
              className="mt-4 max-h-80 w-auto max-w-full rounded-xl"
            />
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                className={button}
                href={url}
                download="capcar-build-progress.png"
                onClick={() => trackAnalytics("build_share_requested")}
              >
                <Download className="size-4" />
                {c.download}
              </a>
              <button
                className={button}
                type="button"
                onClick={() => void share()}
              >
                {c.shareCard}
              </button>
            </div>
          </div>
        )}
        {error && (
          <p role="alert" className="mt-3 text-red-200">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
