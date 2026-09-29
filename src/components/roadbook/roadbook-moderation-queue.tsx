"use client";

import {
  CalendarDays,
  Check,
  ExternalLink,
  ImageIcon,
  MapPinned,
  Shield,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import {
  fetchRoadbookDiscoveryQueue,
  fetchRoadbookModerationQueue,
  isRoadbookModerator,
  moderateRoadbookDiscoveryCandidate,
  moderateRoadbookReport,
  type RoadbookDiscoveryCandidate,
  type RoadbookModerationReport,
} from "@/features/roadbook/roadbook-client";

type QueueTab = "discoveries" | "reports";

export function RoadbookModerationQueue() {
  const t = useTranslations("Roadbook.moderation");
  const [reports, setReports] = useState<RoadbookModerationReport[]>([]);
  const [candidates, setCandidates] = useState<RoadbookDiscoveryCandidate[]>(
    [],
  );
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<QueueTab>("discoveries");
  const [note, setNote] = useState("");
  const [activeId, setActiveId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void isRoadbookModerator()
      .then(async (moderator) => {
        if (!moderator || cancelled) return;
        const [reportQueue, discoveryQueue] = await Promise.all([
          fetchRoadbookModerationQueue(),
          fetchRoadbookDiscoveryQueue(),
        ]);
        if (!cancelled) {
          setReports(reportQueue);
          setCandidates(discoveryQueue);
          setVisible(true);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  if (!visible) return null;

  async function decideReport(status: "accepted" | "rejected") {
    if (!activeId || note.trim().length < 10) return;
    setBusy(true);
    setError("");
    try {
      await moderateRoadbookReport(activeId, status, note);
      setReports((current) =>
        current.filter((report) => report.id !== activeId),
      );
      setActiveId("");
      setNote("");
    } catch {
      setError(t("error"));
    } finally {
      setBusy(false);
    }
  }

  async function decideCandidate(status: "approved" | "rejected") {
    if (!activeId || note.trim().length < 10) return;
    setBusy(true);
    setError("");
    try {
      await moderateRoadbookDiscoveryCandidate(activeId, status, note);
      setCandidates((current) =>
        current.filter((candidate) => candidate.id !== activeId),
      );
      setActiveId("");
      setNote("");
    } catch {
      setError(t("error"));
    } finally {
      setBusy(false);
    }
  }

  const queueCount = reports.length + candidates.length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/12 bg-[#09100d]/88 px-4 text-xs font-semibold text-white/70 shadow-xl backdrop-blur-xl"
      >
        <Shield className="size-4 text-[#6bd2ae]" aria-hidden="true" />
        {t("action")} · {queueCount}
      </button>
      {open && (
        <section className="absolute top-13 right-0 w-[min(28rem,calc(100vw-2rem))] rounded-2xl border border-white/12 bg-[#09100d]/98 p-4 text-white shadow-2xl backdrop-blur-xl">
          <h2 className="text-sm font-semibold">{t("title")}</h2>
          <p className="mt-1 text-xs leading-5 text-white/42">
            {t("description")}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2" role="tablist">
            {(["discoveries", "reports"] as const).map((value) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={tab === value}
                onClick={() => {
                  setTab(value);
                  setActiveId("");
                  setNote("");
                }}
                className={`min-h-9 rounded-lg border px-3 text-xs font-semibold transition ${tab === value ? "border-white/28 bg-white/10 text-white" : "border-white/8 text-white/45 hover:text-white/75"}`}
              >
                {t(`tabs.${value}`)} ·
                {value === "discoveries" ? candidates.length : reports.length}
              </button>
            ))}
          </div>
          {error && (
            <p className="mt-2 rounded-lg bg-red-300/8 p-2 text-xs text-red-100">
              {error}
            </p>
          )}
          <div className="mt-3 max-h-[min(34rem,70dvh)] space-y-3 overflow-y-auto">
            {tab === "discoveries" && !candidates.length && (
              <p className="text-xs text-white/45">{t("emptyDiscoveries")}</p>
            )}
            {tab === "reports" && !reports.length && (
              <p className="text-xs text-white/45">{t("emptyReports")}</p>
            )}

            {tab === "discoveries" &&
              candidates.map((candidate) => (
                <DiscoveryCandidate
                  key={candidate.id}
                  candidate={candidate}
                  active={activeId === candidate.id}
                  note={note}
                  busy={busy}
                  onReview={() => setActiveId(candidate.id)}
                  onNoteChange={setNote}
                  onApprove={() => void decideCandidate("approved")}
                  onReject={() => void decideCandidate("rejected")}
                />
              ))}

            {tab === "reports" &&
              reports.map((report) => (
                <article
                  key={report.id}
                  className="rounded-xl border border-white/9 bg-white/[0.035] p-3"
                >
                  <p className="text-xs font-semibold">{report.venueName}</p>
                  <p className="mt-2 text-xs leading-5 text-white/48">
                    {report.reason}
                  </p>
                  {report.evidenceUrl && (
                    <a
                      href={report.evidenceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex min-h-8 items-center gap-1 text-xs text-[#ff788a]"
                    >
                      {t("evidence")} <ExternalLink className="size-3" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveId(report.id)}
                    className="mt-2 block min-h-8 text-xs font-semibold text-white/60 underline"
                  >
                    {t("review")}
                  </button>
                  {activeId === report.id && (
                    <DecisionControls
                      note={note}
                      busy={busy}
                      approveLabel={t("acceptReport")}
                      rejectLabel={t("reject")}
                      noteLabel={t("note")}
                      onNoteChange={setNote}
                      onApprove={() => void decideReport("accepted")}
                      onReject={() => void decideReport("rejected")}
                    />
                  )}
                </article>
              ))}
          </div>
        </section>
      )}
    </div>
  );
}

function DiscoveryCandidate({
  candidate,
  active,
  note,
  busy,
  onReview,
  onNoteChange,
  onApprove,
  onReject,
}: {
  candidate: RoadbookDiscoveryCandidate;
  active: boolean;
  note: string;
  busy: boolean;
  onReview: () => void;
  onNoteChange: (value: string) => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  const t = useTranslations("Roadbook.moderation");
  const Icon =
    candidate.kind === "image"
      ? ImageIcon
      : candidate.kind === "event"
        ? CalendarDays
        : MapPinned;
  return (
    <article className="rounded-xl border border-white/9 bg-white/[0.035] p-3">
      {candidate.image && (
        <div className="mb-3 overflow-hidden rounded-lg border border-white/8 bg-black/25">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={candidate.image.url}
            alt={candidate.image.alt}
            loading="lazy"
            decoding="async"
            className="h-32 w-full object-cover"
          />
          {candidate.image.photographer && (
            <p className="px-2 py-1.5 text-[10px] text-white/40">
              {t("photographer", {
                photographer: candidate.image.photographer,
              })}
            </p>
          )}
        </div>
      )}
      <p className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.1em] text-[#6bd2ae] uppercase">
        <Icon className="size-3.5" aria-hidden="true" />
        {t(`kinds.${candidate.kind}`)} ·{Math.round(candidate.confidence * 100)}
        %
      </p>
      <p className="mt-1 text-xs font-semibold">{candidate.title}</p>
      {(candidate.region || candidate.countryCode) && (
        <p className="mt-1 text-[11px] text-white/42">
          {[candidate.region, candidate.countryCode]
            .filter(Boolean)
            .join(" · ")}
        </p>
      )}
      <a
        href={candidate.sourceUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-2 inline-flex min-h-8 items-center gap-1 text-xs text-[#ff788a]"
      >
        {t("source")} <ExternalLink className="size-3" />
      </a>
      <button
        type="button"
        onClick={onReview}
        className="mt-1 block min-h-8 text-xs font-semibold text-white/60 underline"
      >
        {t("review")}
      </button>
      {active && (
        <DecisionControls
          note={note}
          busy={busy}
          approveLabel={t("approveCandidate")}
          rejectLabel={t("reject")}
          noteLabel={t("note")}
          onNoteChange={onNoteChange}
          onApprove={onApprove}
          onReject={onReject}
        />
      )}
    </article>
  );
}

function DecisionControls({
  note,
  busy,
  approveLabel,
  rejectLabel,
  noteLabel,
  onNoteChange,
  onApprove,
  onReject,
}: {
  note: string;
  busy: boolean;
  approveLabel: string;
  rejectLabel: string;
  noteLabel: string;
  onNoteChange: (value: string) => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <div className="mt-3 grid gap-2">
      <textarea
        value={note}
        onChange={(event) => onNoteChange(event.target.value)}
        minLength={10}
        maxLength={1000}
        placeholder={noteLabel}
        className="rounded-lg border border-white/12 bg-black/30 p-2 text-xs"
      />
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={busy || note.trim().length < 10}
          onClick={onApprove}
          className="inline-flex min-h-9 items-center justify-center gap-1 rounded-lg bg-emerald-300/15 px-2 text-xs text-emerald-100 disabled:opacity-45"
        >
          <Check className="size-3" /> {approveLabel}
        </button>
        <button
          type="button"
          disabled={busy || note.trim().length < 10}
          onClick={onReject}
          className="inline-flex min-h-9 items-center justify-center gap-1 rounded-lg bg-white/7 px-2 text-xs text-white/60 disabled:opacity-45"
        >
          <X className="size-3" /> {rejectLabel}
        </button>
      </div>
    </div>
  );
}
