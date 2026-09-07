"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CircleGauge,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { useState, useSyncExternalStore } from "react";

import {
  generateTuningPlan,
  tuningExperience,
  tuningGoals,
  type TuningPlanInput,
} from "@/features/tuning/tuning-roadmap";
import {
  announceTuningChange,
  saveTuningPlan,
} from "@/features/tuning/tuning-storage";
import { useTuningPlans } from "@/features/tuning/use-tuning-plans";
import { useVehicles } from "@/features/vehicles/use-vehicles";

const goalLabels: Record<TuningPlanInput["goal"], string> = {
  oem_plus: "OEM+ daily",
  appearance: "Better appearance",
  handling: "Better handling",
  sound: "Better sound",
  power: "More power",
};

export function TuningAcademy({ vehicleId }: { vehicleId: string }) {
  const hydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const { vehicles } = useVehicles();
  const plans = useTuningPlans();
  const vehicle = vehicles.find((candidate) => candidate.id === vehicleId);
  const plan = plans.find((candidate) => candidate.vehicleId === vehicleId);
  const [input, setInput] = useState<TuningPlanInput>({
    goal: "oem_plus",
    experience: "beginner",
    budget: 5000,
  });

  if (!hydrated)
    return (
      <div className="min-h-[720px] animate-pulse rounded-[2rem] bg-white/[0.04]" />
    );
  if (!vehicle)
    return (
      <div className="py-32 text-center text-white/45">Vehicle not found.</div>
    );

  function generate() {
    if (!vehicle) return;
    saveTuningPlan(generateTuningPlan(vehicle, input), window.localStorage);
    announceTuningChange();
  }

  return (
    <div className="pb-24 sm:pb-0">
      <Link
        href={`/garage/${vehicleId}`}
        className="mb-7 inline-flex items-center gap-2 text-sm text-white/45 hover:text-white"
      >
        <ArrowLeft className="size-4" /> Vehicle overview
      </Link>
      <header className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_84%_15%,rgba(231,45,69,0.2),transparent_30%),#111111] p-6 sm:p-10">
        <p className="text-xs font-semibold tracking-[0.15em] text-[#ff667a] uppercase">
          Epic 17 · Beginner tuning academy
        </p>
        <h1 className="mt-4 max-w-4xl text-4xl font-medium tracking-[-0.05em] sm:text-6xl">
          Start with the goal. Build in the right order.
        </h1>
        <p className="mt-5 max-w-2xl leading-7 text-white/45">
          Capcar creates a conservative roadmap for your{" "}
          {vehicle.productionYear} {vehicle.make} {vehicle.model} without
          inventing gains, fitment or legal approval.
        </p>
      </header>

      <section className="mt-5 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="rounded-[2rem] border border-white/10 bg-[#111111] p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <GraduationCap className="size-5 text-[#ff667a]" />
            <h2 className="text-xl font-medium">Your direction</h2>
          </div>
          <fieldset className="mt-7">
            <legend className="text-xs tracking-[0.12em] text-white/30 uppercase">
              Primary goal
            </legend>
            <div className="mt-3 grid gap-2">
              {tuningGoals.map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => setInput({ ...input, goal })}
                  className={`rounded-xl border px-4 py-3 text-left text-sm ${input.goal === goal ? "border-[#e72d45]/45 bg-[#e72d45]/10 text-[#bad1ff]" : "border-white/10 text-white/45"}`}
                >
                  {goalLabels[goal]}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="mt-7">
            <legend className="text-xs tracking-[0.12em] text-white/30 uppercase">
              Experience
            </legend>
            <div className="mt-3 flex gap-2">
              {tuningExperience.map((experience) => (
                <button
                  key={experience}
                  type="button"
                  onClick={() => setInput({ ...input, experience })}
                  className={`rounded-xl border px-4 py-2.5 text-sm capitalize ${input.experience === experience ? "border-[#e72d45]/45 bg-[#e72d45]/10 text-[#bad1ff]" : "border-white/10 text-white/45"}`}
                >
                  {experience}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="mt-7 block text-xs tracking-[0.12em] text-white/30 uppercase">
            Total budget
            <input
              type="number"
              min="500"
              step="250"
              value={input.budget}
              onChange={(event) =>
                setInput({ ...input, budget: Number(event.target.value) })
              }
              className="mt-3 min-h-12 w-full rounded-xl border border-white/10 bg-[#0d0d0d] px-4 text-base text-white/70 outline-none"
            />
          </label>
          <button
            type="button"
            onClick={generate}
            className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#e72d45] px-4 text-sm font-semibold text-[#07101d]"
          >
            <Sparkles className="size-4" />{" "}
            {plan ? "Regenerate roadmap" : "Create roadmap"}
          </button>
        </aside>

        <article className="rounded-[2rem] border border-white/10 bg-[#111111] p-6 sm:p-8">
          {plan ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs tracking-[0.12em] text-white/30 uppercase">
                    Your roadmap
                  </p>
                  <h2 className="mt-2 text-2xl font-medium">
                    {goalLabels[plan.goal]}
                  </h2>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs text-white/45">
                  <WalletCards className="size-3.5" /> {formatEuro(plan.budget)}
                </span>
              </div>
              <div className="mt-8 space-y-4">
                {plan.stages.map((stage) => (
                  <div
                    key={stage.id}
                    className="rounded-2xl border border-white/8 bg-black/10 p-5"
                  >
                    <div className="flex items-start gap-4">
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#e72d45]/10 text-xs text-[#9ec2ff]">
                        {String(stage.order).padStart(2, "0")}
                      </span>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <h3 className="font-medium text-white/80">
                            {stage.title}
                          </h3>
                          <span className="text-sm text-white/45">
                            {formatEuro(stage.budget)}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-white/40">
                          {stage.reason}
                        </p>
                        <ul className="mt-4 space-y-2">
                          {stage.checks.map((check) => (
                            <li
                              key={check}
                              className="flex gap-2 text-xs leading-5 text-white/40"
                            >
                              <Check className="mt-0.5 size-3.5 shrink-0 text-white/25" />
                              {check}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex min-h-[520px] flex-col items-center justify-center text-center">
              <CircleGauge className="size-10 text-white/20" />
              <h2 className="mt-6 text-2xl font-medium">Choose a direction</h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-white/40">
                Your first roadmap will always begin with maintenance and safety
                before cosmetic or performance changes.
              </p>
            </div>
          )}
        </article>
      </section>
      {plan && (
        <aside className="mt-5 rounded-2xl border border-amber-300/15 bg-amber-300/6 p-5">
          <p className="flex items-center gap-2 text-sm text-amber-100/70">
            <ShieldCheck className="size-4" /> Guardrails
          </p>
          <ul className="mt-4 space-y-2">
            {plan.warnings.map((warning) => (
              <li
                key={warning}
                className="flex gap-2 text-sm leading-6 text-white/45"
              >
                <AlertTriangle className="mt-1 size-3.5 shrink-0 text-amber-200" />
                {warning}
              </li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  );
}

function formatEuro(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}
