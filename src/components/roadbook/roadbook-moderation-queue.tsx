"use client";

import { Check, ExternalLink, Shield, X } from "lucide-react";
import { useEffect, useState } from "react";

import {
  fetchRoadbookModerationQueue,
  isRoadbookModerator,
  moderateRoadbookReport,
  type RoadbookModerationReport,
} from "@/features/roadbook/roadbook-client";

export function RoadbookModerationQueue() {
  const [reports, setReports] = useState<RoadbookModerationReport[]>([]);
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    let cancelled = false;
    void isRoadbookModerator()
      .then(async (moderator) => {
        if (!moderator || cancelled) return;
        const queue = await fetchRoadbookModerationQueue();
        if (!cancelled) {
          setReports(queue);
          setVisible(true);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  if (!visible) return null;

  async function decide(status: "accepted" | "rejected") {
    if (!activeId || note.trim().length < 10) return;
    await moderateRoadbookReport(activeId, status, note);
    setReports((current) => current.filter((report) => report.id !== activeId));
    setActiveId("");
    setNote("");
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/12 bg-[#09100d]/88 px-4 text-xs font-semibold text-white/70 shadow-xl backdrop-blur-xl"
      >
        <Shield className="size-4 text-[#6bd2ae]" />
        Review queue · {reports.length}
      </button>
      {open && (
        <section className="absolute top-13 right-0 w-[min(24rem,calc(100vw-2rem))] rounded-2xl border border-white/12 bg-[#09100d]/96 p-4 text-white shadow-2xl backdrop-blur-xl">
          <h2 className="text-sm font-semibold">Roadbook reports</h2>
          <div className="mt-3 max-h-80 space-y-3 overflow-y-auto">
            {!reports.length && (
              <p className="text-xs text-white/45">No reports waiting.</p>
            )}
            {reports.map((report) => (
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
                    className="mt-2 inline-flex items-center gap-1 text-xs text-[#ff788a]"
                  >
                    Evidence <ExternalLink className="size-3" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setActiveId(report.id)}
                  className="mt-3 block text-xs font-semibold text-white/60 underline"
                >
                  Review
                </button>
                {activeId === report.id && (
                  <div className="mt-3 grid gap-2">
                    <textarea
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      minLength={10}
                      maxLength={1000}
                      placeholder="Decision note"
                      className="rounded-lg border border-white/12 bg-black/30 p-2 text-xs"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => void decide("accepted")}
                        className="inline-flex min-h-9 items-center justify-center gap-1 rounded-lg bg-amber-300/15 text-xs text-amber-100"
                      >
                        <Check className="size-3" /> Accept report
                      </button>
                      <button
                        type="button"
                        onClick={() => void decide("rejected")}
                        className="inline-flex min-h-9 items-center justify-center gap-1 rounded-lg bg-white/7 text-xs text-white/60"
                      >
                        <X className="size-3" /> Reject
                      </button>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
