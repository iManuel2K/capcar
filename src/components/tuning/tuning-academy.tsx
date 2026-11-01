"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, Copy, Route } from "lucide-react";
import { useRef, useState, useSyncExternalStore } from "react";
import { useLocale } from "next-intl";
import { resolveJournalLocale } from "@/features/journal/routes";
import type { AppLocale } from "@/i18n/config";
import type { Vehicle } from "@/features/vehicles/vehicle-schema";
import {
  generateTuningPlan,
  isStageComplete,
  tuningAiBrief,
  tuningCheckKey,
  tuningExperience,
  tuningGoals,
  tuningPlanInputSchema,
  tuningUsage,
  type TuningPlan,
  type TuningPlanInput,
} from "@/features/tuning/tuning-roadmap";
import { goalCopy, tuningCopy } from "@/features/tuning/tuning-copy";
import {
  announceTuningChange,
  saveTuningPlan,
  updateTuningCheck,
} from "@/features/tuning/tuning-storage";
import { useTuningPlans } from "@/features/tuning/use-tuning-plans";
import { useVehicles } from "@/features/vehicles/use-vehicles";

const control =
  "min-h-11 rounded-xl border px-3 py-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
const button =
  "min-h-11 rounded-xl border border-primary/40 px-4 py-3 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export function TuningAcademy({ vehicleId }: { vehicleId: string }) {
  const locale = resolveJournalLocale(useLocale());
  const hydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const { vehicles } = useVehicles();
  const plans = useTuningPlans();
  const vehicle = vehicles.find((candidate) => candidate.id === vehicleId);
  const plan = plans.find((candidate) => candidate.vehicleId === vehicleId);
  if (!hydrated)
    return (
      <div
        aria-busy="true"
        className="bg-card min-h-[720px] animate-pulse rounded-3xl"
      />
    );
  if (!vehicle)
    return (
      <p className="text-muted-foreground py-24 text-center">
        {tuningCopy.missing[locale]}
      </p>
    );
  return (
    <TuningEditor
      key={vehicleId}
      vehicle={vehicle}
      savedPlan={plan}
      locale={locale}
    />
  );
}

function TuningEditor({
  vehicle,
  savedPlan,
  locale,
}: {
  vehicle: Vehicle;
  savedPlan?: TuningPlan;
  locale: AppLocale;
}) {
  const c = (key: keyof typeof tuningCopy) => tuningCopy[key][locale];
  const [input, setInput] = useState<TuningPlanInput>(() => ({
    goal: savedPlan?.goal ?? "oem_plus",
    experience: savedPlan?.experience ?? "beginner",
    budget: savedPlan?.budget ?? 5000,
    usage: savedPlan?.usage ?? "daily",
    reservePercent: savedPlan?.reservePercent ?? 10,
  }));
  const [budget, setBudget] = useState(String(input.budget));
  const [preview, setPreview] = useState<TuningPlan>();
  const [error, setError] = useState("");
  const [budgetError, setBudgetError] = useState(false);
  const [status, setStatus] = useState("");
  const [brief, setBrief] = useState("");
  const budgetRef = useRef<HTMLInputElement>(null);
  const roadmapRef = useRef<HTMLElement>(null);
  const sourcePlan = preview ?? savedPlan;
  // Versioned templates keep saved progress stable when the interface language changes.
  const plan =
    sourcePlan?.version === 2
      ? {
          ...generateTuningPlan(
            vehicle,
            sourcePlan,
            sourcePlan.generatedAt,
            locale,
          ),
          completedChecks: sourcePlan.completedChecks ?? [],
        }
      : sourcePlan;
  const completed = plan?.completedChecks ?? [];
  const total =
    plan?.stages.reduce((sum, stage) => sum + stage.checks.length, 0) ?? 0;
  const completedCount =
    plan?.stages.reduce(
      (sum, stage) =>
        sum +
        stage.checks.filter((_, i) =>
          completed.includes(tuningCheckKey(stage, i)),
        ).length,
      0,
    ) ?? 0;
  const nextStage = plan?.stages.find(
    (stage) => !isStageComplete(stage, completed),
  );
  const euro = (value: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value);

  function createPreview(event: React.FormEvent) {
    event.preventDefault();
    const parsed = tuningPlanInputSchema.safeParse({
      ...input,
      budget: budget.trim() ? Number(budget) : NaN,
    });
    setStatus("");
    setBrief("");
    if (!parsed.success) {
      setBudgetError(true);
      setError(c("invalidBudget"));
      budgetRef.current?.focus();
      return;
    }
    setBudgetError(false);
    setError("");
    setPreview(generateTuningPlan(vehicle, parsed.data, undefined, locale));
    requestAnimationFrame(() => {
      roadmapRef.current?.focus();
      roadmapRef.current?.scrollIntoView?.({ block: "start" });
    });
  }

  function savePreview() {
    if (!preview) return;
    try {
      saveTuningPlan(preview, window.localStorage);
      announceTuningChange();
      setPreview(undefined);
      setError("");
      setStatus(c("saved"));
    } catch {
      setError(c("saveError"));
      setStatus("");
    }
  }

  function toggle(stageId: string, index: number, checked: boolean) {
    if (!savedPlan || preview) return;
    try {
      updateTuningCheck(
        vehicle.id,
        savedPlan.generatedAt,
        stageId,
        index,
        checked,
        window.localStorage,
      );
      announceTuningChange();
      setError("");
      setStatus(c("saved"));
      setBrief("");
    } catch {
      setError(c("saveError"));
      setStatus("");
    }
  }

  async function copyBrief() {
    if (!plan) return;
    const value = tuningAiBrief(vehicle, plan, locale);
    try {
      await navigator.clipboard.writeText(value);
      setStatus(c("copied"));
      setBrief("");
    } catch {
      setBrief(value);
      setStatus(c("copyError"));
    }
  }

  return (
    <div className="pb-24 sm:pb-0">
      <Link
        href={`/garage/${vehicle.id}`}
        className="text-muted-foreground mb-6 inline-flex min-h-11 items-center gap-2"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        {c("back")}
      </Link>
      <header className="bg-card rounded-3xl border border-white/10 p-6 sm:p-8">
        <p className="text-primary font-medium">CapCar · Tuning</p>
        <h1 className="mt-3 text-3xl font-medium tracking-tight sm:text-5xl">
          {c("title")}
        </h1>
        <p className="text-muted-foreground mt-4 max-w-2xl leading-7">
          {c("intro")}
        </p>
        <p className="mt-3">
          {vehicle.productionYear} {vehicle.make} {vehicle.model} ·{" "}
          {vehicle.engineCode}
        </p>
      </header>
      <p role="status" className="text-primary mt-4 empty:hidden">
        {status}
      </p>
      {error && (
        <p role="alert" className="text-destructive mt-4">
          {error}
        </p>
      )}
      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <form
          onSubmit={createPreview}
          noValidate
          className="bg-card min-w-0 space-y-6 rounded-3xl border border-white/10 p-5 sm:p-7"
        >
          <fieldset>
            <legend className="text-lg font-medium">{c("direction")}</legend>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {tuningGoals.map((goal) => (
                <button
                  type="button"
                  key={goal}
                  aria-pressed={input.goal === goal}
                  onClick={() => setInput({ ...input, goal })}
                  className={`${control} ${input.goal === goal ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground border-white/15"}`}
                >
                  {goalCopy[goal][locale]}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="font-medium">{c("usage")}</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {tuningUsage.map((usage) => (
                <button
                  key={usage}
                  type="button"
                  aria-pressed={input.usage === usage}
                  onClick={() => setInput({ ...input, usage })}
                  className={`${control} ${input.usage === usage ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground border-white/15"}`}
                >
                  {c(usage)}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="font-medium">{c("experience")}</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {tuningExperience.map((experience) => (
                <button
                  key={experience}
                  type="button"
                  aria-pressed={input.experience === experience}
                  onClick={() => setInput({ ...input, experience })}
                  className={`${control} ${input.experience === experience ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground border-white/15"}`}
                >
                  {c(experience)}
                </button>
              ))}
            </div>
          </fieldset>
          <div>
            <label htmlFor="tuning-budget" className="font-medium">
              {c("budget")} (EUR)
            </label>
            <input
              ref={budgetRef}
              id="tuning-budget"
              type="number"
              inputMode="numeric"
              min={500}
              max={100000}
              step={1}
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
              aria-invalid={budgetError}
              aria-describedby={budgetError ? "tuning-budget-error" : undefined}
              className="bg-background focus-visible:outline-primary mt-3 min-h-12 w-full rounded-xl border border-white/20 px-4 focus-visible:outline-2"
            />
            {budgetError && (
              <p id="tuning-budget-error" className="text-destructive mt-2">
                {c("invalidBudget")}
              </p>
            )}
          </div>
          <fieldset>
            <legend className="font-medium">{c("reserve")}</legend>
            <div className="mt-3 flex gap-2">
              {([0, 10, 20] as const).map((reservePercent) => (
                <button
                  key={reservePercent}
                  type="button"
                  aria-pressed={input.reservePercent === reservePercent}
                  onClick={() => setInput({ ...input, reservePercent })}
                  className={`${control} ${input.reservePercent === reservePercent ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground border-white/15"}`}
                >
                  {reservePercent}%
                </button>
              ))}
            </div>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              {c("reserveHelp")}
            </p>
          </fieldset>
          <button
            type="submit"
            className={`${button} bg-primary text-primary-foreground w-full`}
          >
            {c("create")}
          </button>
          <p className="text-muted-foreground text-sm leading-6">
            {c("local")}
          </p>
        </form>
        <section
          ref={roadmapRef}
          tabIndex={-1}
          aria-label={c("create")}
          className="bg-card min-w-0 scroll-mt-24 rounded-3xl border border-white/10 p-5 focus:outline-none sm:p-7"
        >
          {plan ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-medium">
                  {goalCopy[plan.goal][locale]}
                </h2>
                <span className="text-primary">{euro(plan.budget)}</span>
              </div>
              <p className="text-muted-foreground mt-2">
                {c(plan.usage ?? "daily")} · {c(plan.experience)}
              </p>
              <p className="text-primary mt-3">
                {c("reserve")}: {euro(plan.reserveBudget ?? 0)}
              </p>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                {c("allocation")}
              </p>
              {preview ? (
                <div className="bg-primary/10 mt-5 rounded-xl p-4">
                  <p className="font-medium">{c("preview")}</p>
                  {savedPlan && (
                    <p className="mt-2 text-sm leading-6">{c("replace")}</p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={savePreview}
                      className={`${button} bg-primary text-primary-foreground`}
                    >
                      {c("save")}
                    </button>
                    {savedPlan && (
                      <button
                        type="button"
                        onClick={() => {
                          setPreview(undefined);
                          setBrief("");
                          setError("");
                          setStatus("");
                          setInput({
                            ...savedPlan,
                            usage: savedPlan.usage ?? "daily",
                            reservePercent: savedPlan.reservePercent ?? 10,
                          });
                          setBudget(String(savedPlan.budget));
                        }}
                        className={button}
                      >
                        {c("discard")}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-5">
                  <label htmlFor="tuning-progress">
                    {c("progress")}: {completedCount}/{total}
                  </label>
                  <progress
                    id="tuning-progress"
                    max={total}
                    value={completedCount}
                    className="accent-primary mt-2 h-2 w-full"
                  />
                  <p className="text-muted-foreground mt-2 text-sm leading-6">
                    {c("completeHelp")} {c("reopen")}
                  </p>
                </div>
              )}
              <ol className="mt-6 space-y-5">
                {plan.stages.map((stage, stageIndex) => {
                  const done = isStageComplete(stage, completed);
                  const blocked = plan.stages
                    .slice(0, stageIndex)
                    .some((previous) => !isStageComplete(previous, completed));
                  return (
                    <li
                      key={stage.id}
                      className={`rounded-2xl border p-4 sm:p-5 ${nextStage?.id === stage.id ? "border-primary/50 bg-primary/5" : "border-white/15"}`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="font-medium">
                          {stage.order}. {stage.title}
                        </h3>
                        <span className="text-muted-foreground">
                          {euro(stage.budget)}
                        </span>
                      </div>
                      <p className="text-primary mt-2 text-sm">
                        {done ? (
                          <>
                            <CheckCircle2
                              aria-hidden="true"
                              className="mr-1 inline size-4"
                            />
                            {c("complete")}
                          </>
                        ) : blocked ? (
                          `${c("after")} ${stage.order - 1}`
                        ) : (
                          c("next")
                        )}
                      </p>
                      <p className="text-muted-foreground mt-3 leading-7">
                        {stage.reason}
                      </p>
                      <ul className="mt-3 space-y-2">
                        {stage.checks.map((check, index) => (
                          <li key={index}>
                            <label className="flex min-h-11 items-start gap-3 py-2 leading-7">
                              <input
                                type="checkbox"
                                checked={completed.includes(
                                  tuningCheckKey(stage, index),
                                )}
                                disabled={Boolean(preview) || blocked}
                                onChange={(event) =>
                                  toggle(stage.id, index, event.target.checked)
                                }
                                className="accent-primary focus-visible:outline-primary mt-1.5 size-5 shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2"
                              />
                              <span>{check}</span>
                            </label>
                          </li>
                        ))}
                      </ul>
                    </li>
                  );
                })}
              </ol>
              <div className="mt-6 border-t border-white/15 pt-5">
                <button
                  type="button"
                  onClick={copyBrief}
                  className={`${button} flex items-center gap-2`}
                >
                  <Copy aria-hidden="true" className="size-4 shrink-0" />
                  {c("ai")}
                </button>
                <p className="text-muted-foreground mt-3 text-sm leading-6">
                  {c("aiHelp")}
                </p>
                {brief && (
                  <textarea
                    readOnly
                    aria-label={c("ai")}
                    value={brief}
                    onFocus={(event) => event.target.select()}
                    rows={10}
                    className="bg-background mt-3 w-full rounded-xl border border-white/20 p-3"
                  />
                )}
              </div>
            </>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center gap-5 text-center">
              <Route aria-hidden="true" className="text-primary size-10" />
              <p className="text-muted-foreground max-w-sm leading-7">
                {c("empty")}
              </p>
            </div>
          )}
        </section>
      </div>
      {plan && (
        <aside className="bg-card mt-5 rounded-2xl border border-white/15 p-5">
          <ul className="text-muted-foreground space-y-3 text-sm leading-6">
            {plan.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  );
}
