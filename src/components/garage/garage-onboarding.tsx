"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CarFront,
  Wrench,
  Map,
  SlidersHorizontal,
  LockKeyhole,
} from "lucide-react";
import { useGarageAccount } from "@/components/account/garage-account-boundary";
import { VehicleArt } from "./vehicle-art";
import { useGarageCopy } from "@/features/onboarding/use-garage-copy";
import {
  draftKey,
  emptyOnboardingDraft,
  ONBOARDING_EVENT,
  onboardingVehicleInput,
  readOnboardingDraft,
  saveOnboarding,
  type OnboardingDraft,
  type GarageGoal,
} from "@/features/onboarding/onboarding";
import {
  garageCarCatalog,
  garageCarCoverage,
} from "@/features/vehicles/garage-car-catalog";
import { getShowroomExamples } from "@/features/garage/showroom-examples";
import { useVehicles } from "@/features/vehicles/use-vehicles";
import { announceVehicleChange } from "@/features/vehicles/vehicle-storage";
import { announceBuildChange } from "@/features/builds/build-storage";
import { trackAnalytics } from "@/features/analytics/client";
import { preparePassportPhoto } from "@/features/passport/passport-photo";

const GarageShowroomPreview = dynamic(
  () => import("./garage-showroom").then((module) => module.GarageShowroom),
  { ssr: false },
);
const exampleVehicles = getShowroomExamples();

const input =
  "mt-2 min-h-12 w-full rounded-xl border border-white/20 bg-[#0a2022] px-4 text-base text-white outline-none focus-visible:border-[#d6aa92] focus-visible:ring-2 focus-visible:ring-[#d6aa92]/30";
export const garageButton =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d6aa92] disabled:opacity-50";
const primary = `${garageButton.replace("text-white", "text-[#102e30]").replace("hover:bg-white/10", "hover:bg-white")} border-[#e7e5d4] bg-[#e7e5d4]`;
const steps = ["car", "goal", "action", "save"] as const;
const subscribe = () => () => undefined;
export function GarageOnboarding({
  initialGoal,
  returnTo,
  initialVehicleId,
  resumeId,
}: {
  initialGoal?: GarageGoal;
  returnTo?: string;
  initialVehicleId?: string;
  resumeId?: string;
}) {
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  return hydrated ? (
    <OnboardingFlow
      initialGoal={initialGoal}
      returnTo={returnTo}
      initialVehicleId={initialVehicleId}
      resumeId={resumeId}
    />
  ) : (
    <div className="min-h-[65vh] animate-pulse rounded-3xl bg-white/5" />
  );
}

function OnboardingFlow({
  initialGoal,
  returnTo,
  initialVehicleId,
  resumeId,
}: {
  initialGoal?: GarageGoal;
  returnTo?: string;
  initialVehicleId?: string;
  resumeId?: string;
}) {
  const c = useGarageCopy();
  const { configured, userId } = useGarageAccount();
  const { vehicles } = useVehicles();
  const [draft, setDraft] = useState<OnboardingDraft>(() => {
    try {
      // Explicit handoff only: never import another signed-in account's draft.
      if (
        userId &&
        resumeId &&
        localStorage.getItem("capcar.onboarding-auth-handoff") === resumeId
      ) {
        const guest = readOnboardingDraft(localStorage, null);
        if (guest?.id === resumeId) return guest;
      }
      const own = readOnboardingDraft(localStorage, userId || null);
      if (own) return own;
    } catch {
      /* Storage errors are shown when saving. */
    }
    // Only seed a new draft. Restored progress and explicit auth handoffs win.
    const initial = { ...emptyOnboardingDraft(), goal: initialGoal };
    const vehicle =
      (userId || !configured) &&
      vehicles.find((entry) => entry.id === initialVehicleId);
    return vehicle
      ? {
          ...initial,
          existingVehicleId: vehicle.id,
          make: vehicle.make,
          model: vehicle.model,
          productionYear: String(vehicle.productionYear),
          platform: vehicle.platform,
          goal: vehicle.garageGoal,
          step: "goal",
        }
      : initial;
  });
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [example, setExample] = useState(false);
  const [savedPath, setSavedPath] = useState("");
  const [resumed] = useState(() =>
    Boolean(readOnboardingDraft(localStorage, userId || null)),
  );
  const titleRef = useRef<HTMLHeadingElement>(null);
  const leaving = useRef(false);
  const draftRef = useRef(draft);
  const saving = useRef(false);
  const authenticated = Boolean(userId) || !configured;

  useEffect(() => {
    draftRef.current = draft;
    try {
      localStorage.setItem(draftKey(userId || null), JSON.stringify(draft));
      if (
        userId &&
        resumeId === draft.id &&
        localStorage.getItem("capcar.onboarding-auth-handoff") === resumeId
      ) {
        localStorage.removeItem("capcar.onboarding-auth-handoff");
        localStorage.removeItem(draftKey(null));
      }
    } catch {
      /* Explicit actions report storage errors without blocking typing. */
    }
  }, [draft, userId, c.error, resumeId]);
  useEffect(() => {
    trackAnalytics("onboarding_started");
  }, []);
  useEffect(() => {
    if (savedPath) return;
    const goal = draftRef.current.goal;
    trackAnalytics("onboarding_step_viewed", {
      step: draft.step,
      ...(goal ? { goal } : {}),
    });
    titleRef.current?.focus();
  }, [draft.step, savedPath]);
  useEffect(() => {
    let interrupted = false;
    const report = () => {
      if (interrupted || leaving.current) return;
      interrupted = true;
      trackAnalytics("onboarding_interrupted", {
        step: draftRef.current.step,
        elapsed_seconds: String(
          Math.min(
            604800,
            Math.max(
              0,
              Math.round((Date.now() - draftRef.current.startedAt) / 1000),
            ),
          ),
        ),
      });
    };
    const visible = () => {
      if (document.visibilityState === "hidden") report();
      else interrupted = false;
    };
    window.addEventListener("pagehide", report);
    document.addEventListener("visibilitychange", visible);
    return () => {
      report();
      window.removeEventListener("pagehide", report);
      document.removeEventListener("visibilitychange", visible);
    };
  }, []);

  function update(values: Partial<OnboardingDraft>) {
    const next = { ...draft, ...values };
    setDraft(next);
    setError("");
    try {
      localStorage.setItem(draftKey(userId || null), JSON.stringify(next));
    } catch {
      setError(c.error);
    }
  }
  function next(step: OnboardingDraft["step"], skip = false) {
    if (draft.step === "car" && !draft.existingVehicleId) {
      try {
        onboardingVehicleInput(draft);
      } catch {
        setError(c.carError);
        return;
      }
    }
    if (
      draft.step === "action" &&
      !skip &&
      (draft.title.trim().length < 2 ||
        (draft.estimate !== "" &&
          (!/^\d+$/.test(draft.estimate) || Number(draft.estimate) > 1000000)))
    ) {
      setError(c.actionError);
      return;
    }
    trackAnalytics(skip ? "onboarding_skipped" : "onboarding_step_completed", {
      step: draft.step,
      ...(draft.goal ? { goal: draft.goal } : {}),
    });
    update({ step, ...(draft.step === "action" ? { skipAction: skip } : {}) });
  }
  async function photo(file?: File) {
    if (!file) return;
    setBusy(true);
    try {
      update({ photo: await preparePassportPhoto(file) });
    } catch {
      setError(c.photoError);
    } finally {
      setBusy(false);
    }
  }
  function authHandoff() {
    try {
      localStorage.setItem(draftKey(null), JSON.stringify(draft));
      localStorage.setItem("capcar.onboarding-auth-handoff", draft.id);
      leaving.current = true;
      trackAnalytics("onboarding_auth_requested", { step: "save" });
    } catch {
      setError(c.error);
      return false;
    }
    return true;
  }
  function save() {
    if (saving.current) return;
    saving.current = true;
    try {
      const result = saveOnboarding(draft, localStorage, {
        name: c.planName,
        description: c.planDescription,
      });
      announceVehicleChange();
      announceBuildChange();
      window.dispatchEvent(new Event(ONBOARDING_EVENT));
      if (result.newlyActivated) {
        const properties = {
          goal: draft.goal!,
          elapsed_seconds: String(
            Math.min(
              604800,
              Math.max(0, Math.round((Date.now() - draft.startedAt) / 1000)),
            ),
          ),
          action_type:
            draft.goal === "drives"
              ? "drive"
              : draft.goal === "maintain"
                ? "maintenance"
                : "modification",
        };
        trackAnalytics("first_useful_action_completed", properties);
        trackAnalytics("onboarding_activated", properties);
      }
      trackAnalytics("onboarding_step_completed", { step: "save" });
      if (result.carAdded) trackAnalytics("vehicle_added");
      leaving.current = true;
      localStorage.removeItem(draftKey(userId || null));
      let destination = result.record.destination!;
      if (returnTo?.startsWith("/garage/journal?")) {
        const url = new URL(returnTo, location.origin);
        url.searchParams.set("vehicle", result.vehicle.id);
        destination = url.pathname + url.search;
      }
      setSavedPath(destination);
    } catch {
      setError(c.error);
    } finally {
      saving.current = false;
    }
  }
  const preview = (() => {
    try {
      return onboardingVehicleInput(draft);
    } catch {
      return undefined;
    }
  })();
  const coverage = preview
    ? garageCarCoverage({
        ...preview,
        id: "preview",
        createdAt: new Date().toISOString(),
      })
    : undefined;
  const matches = garageCarCatalog.filter((car) =>
    `${car.make} ${car.model} ${car.platform}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const review = draft.step === "save";
  const nextPath = `/garage/new?resume=${encodeURIComponent(draft.id)}${returnTo ? `&next=${encodeURIComponent(returnTo)}` : ""}`;
  return (
    <div className="mx-auto max-w-6xl pb-24">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link className={garageButton} href="/garage">
          <ArrowLeft className="size-4" />
          {c.save}
        </Link>
        <button
          type="button"
          className={garageButton}
          onClick={() => setExample(!example)}
        >
          {example ? c.exampleClose : c.example}
        </button>
      </div>
      {example ? (
        <section aria-label={c.exampleTitle}>
          <p className="mb-5 text-sm text-[#d6aa92]">{c.exampleHint}</p>
          <GarageShowroomPreview vehicles={exampleVehicles} readOnly />
          <Link className={`${primary} mt-6`} href="/#live-demo">
            {c.exampleOpen}
            <ArrowRight className="size-4" />
          </Link>
        </section>
      ) : savedPath ? (
        <section
          aria-live="polite"
          className="rounded-3xl border border-[#d6aa92]/30 bg-[#102d30] p-8 sm:p-12"
        >
          <Check className="size-10 text-[#d6aa92]" />
          <h1 className="mt-5 text-3xl">{c.saved}</h1>
          <p className="mt-4 text-white/70">{c.savedHint}</p>
          <Link className={`${primary} mt-8`} href={savedPath}>
            {c.openGarage}
            <ArrowRight className="size-4" />
          </Link>
        </section>
      ) : (
        <>
          <ol aria-label={c.title} className="mb-8 grid grid-cols-4 gap-2">
            {steps.map((step, index) => (
              <li
                key={step}
                aria-current={draft.step === step ? "step" : undefined}
                className={`border-t-2 pt-3 text-xs sm:text-sm ${index <= steps.indexOf(draft.step) ? "border-[#d6aa92] text-[#ede9d8]" : "border-white/15 text-white/50"}`}
              >
                <span className="mr-2">0{index + 1}</span>
                {c[step]}
              </li>
            ))}
          </ol>
          {resumed && <p className="mb-4 text-sm text-white/65">{c.resume}</p>}
          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <section className="min-w-0 rounded-3xl border border-white/15 bg-[#102629] p-5 sm:p-8">
              <p className="text-[11px] tracking-[0.14em] text-[#d6aa92]">
                {c.eyebrow}
              </p>
              <h1
                ref={titleRef}
                tabIndex={-1}
                className="mt-3 text-3xl font-medium tracking-tight outline-none sm:text-4xl"
              >
                {draft.step === "car"
                  ? c.title
                  : draft.step === "goal"
                    ? c.goalTitle
                    : draft.step === "action"
                      ? c.firstTitle
                      : c.ready}
              </h1>
              <p className="mt-4 text-sm leading-6 text-white/70">
                {draft.step === "car"
                  ? c.intro
                  : draft.step === "goal"
                    ? c.goalHint
                    : draft.step === "action"
                      ? c.firstHint
                      : c.readyHint}
              </p>
              {draft.step === "car" && (
                <form
                  className="mt-6 space-y-5"
                  onSubmit={(event) => {
                    event.preventDefault();
                    next("goal");
                  }}
                >
                  {authenticated && vehicles.length > 0 && (
                    <label className="block text-sm">
                      {c.existing}
                      <select
                        className={input}
                        value={draft.existingVehicleId ?? ""}
                        onChange={(event) => {
                          const vehicle = vehicles.find(
                            (entry) => entry.id === event.target.value,
                          );
                          if (vehicle)
                            update({
                              existingVehicleId: vehicle.id,
                              make: vehicle.make,
                              model: vehicle.model,
                              productionYear: String(vehicle.productionYear),
                              platform: vehicle.platform,
                              goal: vehicle.garageGoal,
                            });
                          else update({ existingVehicleId: undefined });
                        }}
                      >
                        <option value="">{c.chooseExisting}</option>
                        {vehicles
                          .filter((vehicle) => !vehicle.demoProject)
                          .map((vehicle) => (
                            <option key={vehicle.id} value={vehicle.id}>
                              {vehicle.productionYear} {vehicle.make}{" "}
                              {vehicle.model}
                            </option>
                          ))}
                      </select>
                    </label>
                  )}
                  {!draft.existingVehicleId && (
                    <>
                      <label className="block text-sm">
                        {c.search}
                        <input
                          className={input}
                          value={query}
                          onChange={(event) => setQuery(event.target.value)}
                          placeholder={c.searchHint}
                          type="search"
                        />
                      </label>
                      <div
                        className="grid max-h-64 gap-2 overflow-y-auto rounded-2xl border border-white/10 p-2 sm:grid-cols-2"
                        aria-label={c.search}
                      >
                        {matches.map((car) => (
                          <button
                            type="button"
                            key={car.id}
                            aria-pressed={
                              draft.make === car.make &&
                              draft.model === car.model &&
                              draft.platform === car.platform
                            }
                            className={`rounded-xl border px-3 py-3 text-left text-sm transition hover:border-[#d6aa92] focus-visible:outline-2 focus-visible:outline-[#d6aa92] ${draft.make === car.make && draft.model === car.model && draft.platform === car.platform ? "border-[#d6aa92] bg-[#d6aa92]/10" : "border-white/10"}`}
                            onClick={() =>
                              update({
                                make: car.make,
                                model: car.model,
                                platform: car.platform,
                                productionYear: "",
                                existingVehicleId: undefined,
                              })
                            }
                          >
                            <strong className="block font-medium">
                              {car.make} {car.model}
                            </strong>
                            <span className="mt-1 block text-xs text-white/60">
                              {car.platform !== "UNKNOWN"
                                ? `${car.platform} · `
                                : ""}
                              {car.years.join("–")}
                              {car.visual ? ` · ${c.visual}` : ""}
                            </span>
                          </button>
                        ))}
                      </div>
                      <p className="text-xs leading-5 text-white/60">
                        {c.catalogHint}
                      </p>
                      <button
                        className="min-h-11 text-sm text-[#d6aa92] underline"
                        type="button"
                        onClick={() => {
                          update({
                            make: "",
                            model: "",
                            productionYear: "",
                            platform: "",
                          });
                          document.getElementById("setup-make")?.focus();
                        }}
                      >
                        {c.manual}
                      </button>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {(["make", "model", "productionYear"] as const).map(
                          (field) => (
                            <label className="block text-sm" key={field}>
                              {c[field === "productionYear" ? "year" : field]}
                              <input
                                id={`setup-${field}`}
                                required
                                maxLength={field === "productionYear" ? 4 : 40}
                                inputMode={
                                  field === "productionYear"
                                    ? "numeric"
                                    : "text"
                                }
                                className={input}
                                value={draft[field]}
                                onChange={(event) =>
                                  update({ [field]: event.target.value })
                                }
                              />
                            </label>
                          ),
                        )}
                      </div>
                      <details className="rounded-xl border border-white/15 p-4">
                        <summary className="cursor-pointer py-2 text-sm">
                          {c.optional}
                        </summary>
                        <p className="mt-3 text-xs leading-5 text-white/65">
                          {c.optionalHint}
                        </p>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                          {(["platform", "engineCode", "mileage"] as const).map(
                            (field) => (
                              <label className="text-sm" key={field}>
                                {c[field === "engineCode" ? "engine" : field]}
                                <input
                                  maxLength={
                                    field === "mileage"
                                      ? 7
                                      : field === "platform"
                                        ? 12
                                        : 20
                                  }
                                  inputMode={
                                    field === "mileage" ? "numeric" : "text"
                                  }
                                  className={input}
                                  value={draft[field]}
                                  onChange={(event) =>
                                    update({ [field]: event.target.value })
                                  }
                                />
                              </label>
                            ),
                          )}
                        </div>
                      </details>
                      <label className="block rounded-xl border border-dashed border-white/20 p-4 text-sm">
                        {c.photo}
                        <input
                          className="mt-3 block w-full text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-[#e7e5d4] file:px-3 file:py-3 file:text-[#102e30]"
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          disabled={busy}
                          onChange={(event) => {
                            void photo(event.target.files?.[0]);
                            event.target.value = "";
                          }}
                        />
                        <span className="mt-2 block text-xs leading-5 text-white/60">
                          {c.photoHelp}
                        </span>
                      </label>
                      {draft.photo && (
                        <button
                          className={garageButton}
                          type="button"
                          onClick={() => update({ photo: undefined })}
                        >
                          {c.removePhoto}
                        </button>
                      )}
                    </>
                  )}
                  <button disabled={busy} className={primary} type="submit">
                    {c.continue}
                    <ArrowRight className="size-4" />
                  </button>
                </form>
              )}
              {draft.step === "goal" && (
                <div className="mt-7 space-y-3">
                  {(["maintain", "modify", "drives"] as const).map((goal) => {
                    const Icon =
                      goal === "maintain"
                        ? Wrench
                        : goal === "modify"
                          ? SlidersHorizontal
                          : Map;
                    return (
                      <button
                        type="button"
                        key={goal}
                        aria-pressed={draft.goal === goal}
                        className={`flex min-h-24 w-full items-center gap-4 rounded-2xl border p-4 text-left ${draft.goal === goal ? "border-[#d6aa92] bg-[#d6aa92]/10" : "border-white/15 hover:bg-white/5"}`}
                        onClick={() => {
                          update({
                            goal,
                            title: "",
                            estimate: "",
                            skipAction: false,
                          });
                        }}
                      >
                        <Icon className="size-6 shrink-0 text-[#d6aa92]" />
                        <span>
                          <strong className="block font-medium">
                            {c[goal]}
                          </strong>
                          <span className="mt-1 block text-sm text-white/65">
                            {c[`${goal}Hint`]}
                          </span>
                        </span>
                        {draft.goal === goal && (
                          <Check className="ml-auto size-5" />
                        )}
                      </button>
                    );
                  })}
                  <div className="flex flex-wrap gap-3 pt-4">
                    <button
                      className={primary}
                      type="button"
                      disabled={!draft.goal}
                      onClick={() => next("action")}
                    >
                      {c.continue}
                      <ArrowRight className="size-4" />
                    </button>
                    <button
                      className={garageButton}
                      type="button"
                      onClick={() => {
                        trackAnalytics("onboarding_skipped", { step: "goal" });
                        update({
                          goal: undefined,
                          step: "save",
                          skipAction: true,
                        });
                      }}
                    >
                      {c.skip}
                    </button>
                  </div>
                </div>
              )}
              {draft.step === "action" && (
                <form
                  className="mt-7 space-y-5"
                  onSubmit={(event) => {
                    event.preventDefault();
                    next("save");
                  }}
                >
                  <label className="block text-sm">
                    {draft.goal === "maintain"
                      ? c.task
                      : draft.goal === "modify"
                        ? c.modification
                        : c.drive}
                    <input
                      className={input}
                      required
                      minLength={2}
                      maxLength={100}
                      value={draft.title}
                      placeholder={c[`${draft.goal ?? "maintain"}Example`]}
                      onChange={(event) =>
                        update({ title: event.target.value })
                      }
                    />
                  </label>
                  {draft.goal !== "drives" && (
                    <label className="block text-sm">
                      {c.estimate}
                      <input
                        className={input}
                        inputMode="numeric"
                        value={draft.estimate}
                        onChange={(event) =>
                          update({ estimate: event.target.value })
                        }
                      />
                    </label>
                  )}
                  <p className="text-xs leading-5 text-white/60">
                    {c.budgetHint}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button className={primary} type="submit">
                      {c.continue}
                      <ArrowRight className="size-4" />
                    </button>
                    <button
                      className={garageButton}
                      type="button"
                      onClick={() => next("save", true)}
                    >
                      {c.skip}
                    </button>
                  </div>
                </form>
              )}
              {review && (
                <div className="mt-7 space-y-5">
                  <div className="rounded-2xl border border-white/15 p-5">
                    <p className="font-medium">
                      {draft.productionYear} {draft.make} {draft.model}
                    </p>
                    <p className="mt-2 text-sm text-[#d6aa92]">
                      {draft.goal ? c[draft.goal] : c.saveLater}
                    </p>
                    <p className="mt-2 text-sm text-white/70">
                      {draft.skipAction ? c.saveLater : draft.title}
                    </p>
                  </div>
                  {authenticated ? (
                    <button type="button" className={primary} onClick={save}>
                      {c.saveGarage}
                      <Check className="size-4" />
                    </button>
                  ) : (
                    <>
                      <p className="text-sm leading-6 text-white/65">
                        {c.authHint}
                      </p>
                      <Link
                        className={primary}
                        href={`/register?next=${encodeURIComponent(nextPath)}`}
                        onClick={(event) => {
                          if (!authHandoff()) event.preventDefault();
                        }}
                      >
                        {c.createAccount}
                      </Link>
                      <Link
                        className="block min-h-11 py-3 text-sm underline"
                        href={`/login?next=${encodeURIComponent(nextPath)}`}
                        onClick={(event) => {
                          if (!authHandoff()) event.preventDefault();
                        }}
                      >
                        {c.signIn}
                      </Link>
                    </>
                  )}
                </div>
              )}
              {error && (
                <p
                  role="alert"
                  className="mt-5 rounded-xl border border-red-300/30 bg-red-300/10 p-4 text-sm text-red-100"
                >
                  {error}
                </p>
              )}
              <div className="mt-7 flex flex-wrap justify-between gap-3 border-t border-white/10 pt-5">
                {draft.step !== "car" && (
                  <button
                    type="button"
                    className={garageButton}
                    onClick={() =>
                      update({
                        step: steps[Math.max(0, steps.indexOf(draft.step) - 1)],
                      })
                    }
                  >
                    <ArrowLeft className="size-4" />
                    {c.back}
                  </button>
                )}
                <button
                  type="button"
                  className="min-h-11 px-2 text-xs text-white/60 underline"
                  onClick={() => {
                    setDraft(emptyOnboardingDraft());
                    setQuery("");
                    setError("");
                  }}
                >
                  {c.restart}
                </button>
              </div>
            </section>
            <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
              <VehicleArt
                compact
                imageUrl={draft.photo}
                label={`${draft.make} ${draft.model}`}
                badge={c.selected}
              />
              <div className="rounded-2xl border border-white/15 bg-[#102629] p-5">
                <CarFront className="size-5 text-[#d6aa92]" />
                <h2 className="mt-3 text-xl">
                  {draft.make || "CapCar"} {draft.model}
                </h2>
                <p className="mt-3 text-sm leading-6 text-white/70">
                  {draft.step === "car"
                    ? c.personalValue
                    : draft.step === "goal"
                      ? c.goalValue
                      : c.actionValue}
                </p>
                {coverage && (
                  <div
                    aria-live="polite"
                    className="mt-4 space-y-2 text-xs text-white/65"
                  >
                    <p>
                      {coverage.problems} {c.problems}
                    </p>
                    <p>
                      {coverage.parts} {c.parts}
                    </p>
                    {!coverage.problems && !coverage.parts && (
                      <p className="leading-5">{c.noCoverage}</p>
                    )}
                  </div>
                )}
              </div>
              <p className="flex gap-2 px-2 text-xs leading-5 text-white/60">
                <LockKeyhole className="size-4 shrink-0" />
                {c.authHint}
              </p>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
