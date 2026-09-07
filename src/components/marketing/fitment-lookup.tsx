"use client";

import {
  ArrowRight,
  BadgeCheck,
  CarFront,
  CircleAlert,
  LoaderCircle,
  Search,
  ShieldAlert,
} from "lucide-react";
import { FormEvent, useState } from "react";

type FitmentTone = "green" | "amber" | "red";

const parts: Array<{
  name: string;
  detail: string;
  status: string;
  tone: FitmentTone;
}> = [
  {
    name: "Dark-red rear lamps",
    detail: "E90 sedan · EU specification",
    status: "Direct Bolt-On",
    tone: "green",
  },
  {
    name: "M-style rear wing",
    detail: "Drilling and approval check",
    status: "Modification Required",
    tone: "amber",
  },
  {
    name: "F30 front brake kit",
    detail: "Different carrier and geometry",
    status: "Incompatible",
    tone: "red",
  },
];

export function FitmentLookup() {
  const [query, setQuery] = useState("WBA-E90-DEMO");
  const [loading, setLoading] = useState(false);
  const [resolved, setResolved] = useState(true);
  const [activePart, setActivePart] = useState(0);
  const selected = parts[activePart];

  function lookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResolved(false);
    window.setTimeout(() => {
      setLoading(false);
      setResolved(true);
    }, 550);
  }

  return (
    <div className="overflow-hidden rounded-[1.6rem] border border-black/15 bg-[#111111] text-white shadow-[0_30px_100px_rgba(40,0,7,0.28)] sm:rounded-[2rem]">
      <div className="border-b border-white/8 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] tracking-[0.14em] text-white/34 uppercase">
              Vehicle lookup
            </p>
            <p className="mt-2 font-medium">Check the exact setup</p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] text-white/38">
            Demo data
          </span>
        </div>

        <form onSubmit={lookup} className="mt-5 flex gap-2">
          <label className="flex min-h-12 flex-1 items-center gap-3 rounded-xl border border-white/10 bg-black/28 px-4 focus-within:border-white/30">
            <Search className="size-4 text-white/30" />
            <span className="sr-only">VIN or vehicle</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value.toUpperCase())}
              placeholder="VIN or vehicle"
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/22"
            />
          </label>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            aria-label="Look up vehicle"
            className="grid size-12 shrink-0 place-items-center rounded-xl bg-white text-black transition hover:-translate-y-0.5 disabled:opacity-50"
          >
            {loading ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <ArrowRight className="size-4" />
            )}
          </button>
        </form>
      </div>

      <div
        className={`transition duration-300 ${resolved ? "opacity-100" : "translate-y-1 opacity-35"}`}
      >
        <div className="flex items-center gap-4 border-b border-white/8 p-5 sm:p-6">
          <span className="grid size-11 place-items-center rounded-xl bg-white/[0.06] text-white/70">
            <CarFront className="size-5" />
          </span>
          <div>
            <p className="font-medium">2011 BMW 318i</p>
            <p className="mt-1 text-xs text-white/35">
              E90 · Sedan · N43B20 · EU
            </p>
          </div>
          <BadgeCheck className="ml-auto size-5 text-emerald-300" />
        </div>

        <div className="grid gap-px bg-white/8 sm:grid-cols-[0.9fr_1.1fr]">
          <div className="bg-[#0e0e0e] p-4 sm:p-5">
            <p className="px-2 text-[10px] tracking-[0.13em] text-white/28 uppercase">
              Select a part
            </p>
            <div className="mt-3 space-y-1.5">
              {parts.map((part, index) => (
                <button
                  key={part.name}
                  type="button"
                  onClick={() => setActivePart(index)}
                  className={`w-full rounded-xl px-3 py-3 text-left transition ${
                    activePart === index
                      ? "bg-white text-black"
                      : "text-white/52 hover:bg-white/[0.05] hover:text-white"
                  }`}
                >
                  <span className="block text-xs font-medium">{part.name}</span>
                  <span
                    className={`mt-1 block text-[10px] ${activePart === index ? "text-black/48" : "text-white/26"}`}
                  >
                    {part.detail}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <FitmentResult
            name={selected.name}
            detail={selected.detail}
            status={selected.status}
            tone={selected.tone}
          />
        </div>
      </div>
    </div>
  );
}

function FitmentResult({
  name,
  detail,
  status,
  tone,
}: {
  name: string;
  detail: string;
  status: string;
  tone: FitmentTone;
}) {
  const styles = {
    green: {
      badge: "border-emerald-300/20 bg-emerald-300/9 text-emerald-200",
      icon: BadgeCheck,
      copy: "Matches the selected vehicle configuration.",
    },
    amber: {
      badge: "border-amber-300/20 bg-amber-300/9 text-amber-200",
      icon: CircleAlert,
      copy: "Additional work or documentation is required.",
    },
    red: {
      badge: "border-red-300/20 bg-red-300/9 text-red-200",
      icon: ShieldAlert,
      copy: "The selected configuration does not match.",
    },
  };
  const Icon = styles[tone].icon;

  return (
    <div className="flex min-h-72 flex-col bg-[#111111] p-5 sm:p-6">
      <span
        className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium ${styles[tone].badge}`}
      >
        <Icon className="size-3.5" /> {status}
      </span>
      <div className="mt-auto pt-10">
        <p className="text-xl font-medium tracking-[-0.025em]">{name}</p>
        <p className="mt-2 text-xs text-white/35">{detail}</p>
        <p className="mt-5 border-t border-white/8 pt-5 text-sm leading-6 text-white/48">
          {styles[tone].copy}
        </p>
      </div>
    </div>
  );
}
