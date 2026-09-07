"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, ClipboardCheck, FileWarning, ShieldCheck } from "lucide-react";
import { useState, useSyncExternalStore } from "react";

import { findGuideBySlug } from "@/features/guides/guide-catalog";
import { evaluateGuideGovernance } from "@/features/guides/guide-governance";
import type { GuideReviewerRole } from "@/features/guides/guide-review-schema";
import { announceGuideReviewChange, saveGuideReview } from "@/features/guides/guide-review-storage";
import { useGuideReviews } from "@/features/guides/use-guide-reviews";

export function GuideReviewWorkspace({ vehicleId, guideSlug }: { vehicleId: string; guideSlug: string }) {
  const hydrated = useSyncExternalStore(() => () => undefined, () => true, () => false);
  const guide = findGuideBySlug(guideSlug);
  const reviews = useGuideReviews();
  const [name, setName] = useState("");
  const [role, setRole] = useState<GuideReviewerRole>("technical-editor");
  const [outcome, setOutcome] = useState<"changes-requested" | "approved">("changes-requested");
  const [sourceChecked, setSourceChecked] = useState(false);
  const [applicabilityChecked, setApplicabilityChecked] = useState(false);
  const [safetyChecked, setSafetyChecked] = useState(false);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  if (!hydrated) return <div className="min-h-[680px] animate-pulse rounded-[2rem] bg-white/[0.04]" />;
  if (!guide) return <div className="py-32 text-center text-white/45">Guide not found.</div>;
  const guideReviews = reviews.filter((review) => review.guideSlug === guideSlug);
  const governance = evaluateGuideGovernance(guide, guideReviews);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveGuideReview({ guideSlug, guideRevision: guide!.revision, reviewerName: name, reviewerRole: role, outcome, sourceChecked, applicabilityChecked, safetyChecked, notes }, window.localStorage);
    announceGuideReviewChange();
    setSaved(true);
    setNotes("");
  }

  return <div className="pb-24 sm:pb-0">
    <Link href={`/garage/${vehicleId}/guides/${guideSlug}`} className="mb-7 inline-flex items-center gap-2 text-sm text-white/45 hover:text-white"><ArrowLeft className="size-4" /> Installation guide</Link>
    <header className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_85%_10%,rgba(231,45,69,0.18),transparent_30%),#111111] p-6 sm:p-10">
      <p className="text-xs font-semibold tracking-[0.14em] text-[#ff667a] uppercase">Epic 23 · Expert review trail</p>
      <h1 className="mt-4 max-w-4xl text-4xl font-medium tracking-[-0.05em] sm:text-6xl">Review revision {guide.revision}.</h1>
      <p className="mt-5 max-w-2xl leading-7 text-white/45">Record review decisions without weakening the publication gate. Local reviews are useful workflow evidence, but never count as authenticated expert approval.</p>
    </header>
    <section className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
      <form onSubmit={submit} className="rounded-[2rem] border border-white/10 bg-[#111111] p-6 sm:p-8">
        <h2 className="flex items-center gap-2 text-xl font-medium"><ClipboardCheck className="size-5 text-[#ff667a]" /> Review decision</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="text-sm text-white/50">Reviewer name<input required minLength={2} value={name} onChange={(e) => setName(e.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-white/10 bg-black/15 px-4 text-white outline-none focus:border-[#e72d45]/50" /></label>
          <label className="text-sm text-white/50">Role<select value={role} onChange={(e) => setRole(e.target.value as GuideReviewerRole)} className="mt-2 min-h-12 w-full rounded-xl border border-white/10 bg-[#111111] px-4 text-white"><option value="mechanic">Mechanic</option><option value="technical-editor">Technical editor</option><option value="publisher">Publisher</option></select></label>
          <label className="text-sm text-white/50">Outcome<select value={outcome} onChange={(e) => setOutcome(e.target.value as typeof outcome)} className="mt-2 min-h-12 w-full rounded-xl border border-white/10 bg-[#111111] px-4 text-white"><option value="changes-requested">Changes requested</option><option value="approved">Approved</option></select></label>
        </div>
        <div className="mt-6 grid gap-3">
          {[[sourceChecked, setSourceChecked, "Sources checked"], [applicabilityChecked, setApplicabilityChecked, "Vehicle applicability checked"], [safetyChecked, setSafetyChecked, "Safety instructions checked"]].map(([checked, setter, label]) => <label key={String(label)} className="flex items-center gap-3 rounded-xl border border-white/8 p-4 text-sm text-white/55"><input type="checkbox" checked={checked as boolean} onChange={(e) => (setter as (value: boolean) => void)(e.target.checked)} className="size-4 accent-[#e72d45]" />{String(label)}</label>)}
        </div>
        <label className="mt-5 block text-sm text-white/50">Review notes<textarea value={notes} maxLength={2000} onChange={(e) => setNotes(e.target.value)} className="mt-2 min-h-28 w-full rounded-xl border border-white/10 bg-black/15 p-4 text-white outline-none focus:border-[#e72d45]/50" /></label>
        <button className="mt-5 min-h-12 rounded-xl bg-[#e72d45] px-5 text-sm font-semibold text-[#07101d]">Save local review record</button>
        {saved && <p className="mt-4 flex items-center gap-2 text-sm text-emerald-200"><CheckCircle2 className="size-4" /> Review trail updated.</p>}
      </form>
      <aside className="space-y-5">
        <div className="rounded-[2rem] border border-white/10 bg-[#111111] p-6"><p className="text-xs tracking-[0.13em] text-white/30 uppercase">Publication gate</p><h2 className="mt-3 text-2xl font-medium">{governance.label}</h2><ul className="mt-5 space-y-3">{governance.blockers.map((blocker) => <li key={blocker} className="flex gap-2 text-sm leading-6 text-white/45"><FileWarning className="mt-1 size-4 shrink-0 text-amber-200" />{blocker}</li>)}</ul></div>
        <div className="rounded-[2rem] border border-white/10 bg-[#111111] p-6"><p className="text-xs tracking-[0.13em] text-white/30 uppercase">Audit trail</p><p className="mt-3 text-3xl font-medium">{guideReviews.length}</p><p className="mt-2 text-sm text-white/40">local decisions recorded</p>{guideReviews.slice(0, 4).map((review) => <div key={review.id} className="mt-4 border-t border-white/8 pt-4 text-sm"><p className="text-white/70">{review.reviewerName} · {review.reviewerRole}</p><p className="mt-1 text-white/35">{review.outcome} · revision {review.guideRevision}</p></div>)}</div>
        <div className="flex gap-3 rounded-2xl border border-[#e72d45]/15 bg-[#e72d45]/6 p-5 text-sm leading-6 text-white/45"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#9ec2ff]" />Authenticated reviewer identity and role enforcement activate with the production backend.</div>
      </aside>
    </section>
  </div>;
}
