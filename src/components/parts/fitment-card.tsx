import { CheckCircle2, TriangleAlert, CircleHelp, XCircle } from "lucide-react";

export type FitmentCardState =
  "bolt-on" | "modification" | "incompatible" | "unverified";
const states = {
  "bolt-on": {
    label: "Direct Bolt-On",
    icon: CheckCircle2,
    tone: "border-emerald-300/30 bg-emerald-300/10 text-emerald-200",
  },
  modification: {
    label: "Requires Modification",
    icon: TriangleAlert,
    tone: "border-amber-300/30 bg-amber-300/10 text-amber-200",
  },
  incompatible: {
    label: "Incompatible",
    icon: XCircle,
    tone: "border-red-300/30 bg-red-300/10 text-red-200",
  },
  unverified: {
    label: "Fitment Unverified",
    icon: CircleHelp,
    tone: "border-white/20 bg-white/5 text-white/80",
  },
};

export function FitmentCard({
  state,
  vehicle,
  explanation,
  requirements = [],
  evidence,
}: {
  state: FitmentCardState;
  vehicle: string;
  explanation: string;
  requirements?: readonly string[];
  evidence?: { source: string; checkedOn: string };
}) {
  // A positive fitment claim must carry a source and review date.
  const hasEvidence = Boolean(
    evidence?.source.trim() && evidence.checkedOn.trim(),
  );
  const resolved = state === "bolt-on" && !hasEvidence ? "unverified" : state;
  const { label, icon: Icon, tone } = states[resolved];
  return (
    <section
      aria-label={`Fitment for ${vehicle}`}
      className="rounded-2xl border border-white/15 bg-[#0e1918] p-5 text-[#f3efdf] sm:p-6"
    >
      <p className="text-xs tracking-widest text-white/65 uppercase">
        {vehicle}
      </p>
      <h2
        className={`mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold ${tone}`}
      >
        <Icon aria-hidden="true" className="size-4 shrink-0" />
        {label}
      </h2>
      <p className="mt-4 text-sm leading-6 text-white/80">{explanation}</p>
      {requirements.length > 0 && (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-white/80">
          {requirements.map((item, index) => (
            <li key={`${index}-${item}`}>{item}</li>
          ))}
        </ul>
      )}
      <p className="mt-4 border-t border-white/10 pt-3 text-xs leading-5 text-white/65">
        {evidence
          ? `${evidence.source} · checked ${evidence.checkedOn}`
          : "Add a manufacturer application sheet or verified fitment record to confirm compatibility."}
      </p>
    </section>
  );
}
