"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Flag,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { useState, useSyncExternalStore } from "react";

import { buildGoals, buildInputSchema } from "@/features/builds/build-schema";
import {
  announceBuildChange,
  createStarterBuild,
} from "@/features/builds/build-storage";
import { useVehicles } from "@/features/vehicles/use-vehicles";
import {
  buildItemInputSchema,
  buildStages,
} from "@/features/builds/build-schema";

export function CreateBuildForm({ vehicleId }: { vehicleId: string }) {
  const hydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const router = useRouter();
  const { vehicles } = useVehicles();
  const vehicle = vehicles.find((candidate) => candidate.id === vehicleId);
  const [form, setForm] = useState({
    name: "",
    goal: "",
    description: "",
    budget: "",
    modification: "",
    stage: "appearance",
    estimate: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  if (!hydrated)
    return (
      <div className="min-h-[600px] animate-pulse rounded-[2rem] bg-white/[0.04]" />
    );
  if (!vehicle)
    return (
      <p className="py-32 text-center text-white/45">Vehicle not found.</p>
    );

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === "goal" && value
        ? {
            name: current.name || `${vehicle?.model ?? "My car"} ${value}`,
            description:
              current.description ||
              `An ${value} build, starting with one considered modification and a clear budget.`,
          }
        : {}),
    }));
    setErrors((current) => ({ ...current, [key]: "" }));
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const result = buildInputSchema.safeParse({
      vehicleId,
      ...form,
      status: "planning",
    });
    if (!result.success) {
      const next: Record<string, string> = {};
      for (const issue of result.error.issues)
        next[String(issue.path[0])] ??= issue.message;
      setErrors(next);
      return;
    }
    const first = buildItemInputSchema.safeParse({
      buildId: "pending",
      title: form.modification,
      stage: form.stage,
      estimatedCost: form.estimate,
      priority: "now",
      status: "planned",
      note: "Owner estimate. Confirm fitment and delivered price before purchase.",
    });
    if (!first.success) {
      setErrors({
        first: first.error.issues.map((issue) => issue.message).join(". "),
      });
      return;
    }
    setSaving(true);
    try {
      const build = createStarterBuild(
        result.data,
        first.data,
        window.localStorage,
      );
      announceBuildChange();
      router.push(`/garage/${vehicleId}/builds/${build.id}`);
    } catch {
      setErrors({
        save: "Your build could not be saved. Check browser storage and try again; your form is still here.",
      });
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl pb-24 sm:pb-0">
      <Link
        href={`/garage/${vehicleId}/builds`}
        className="mb-7 inline-flex items-center gap-2 text-sm text-white/45 hover:text-white"
      >
        <ArrowLeft className="size-4" /> All builds
      </Link>
      <form
        onSubmit={submit}
        noValidate
        className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#111111]"
      >
        <header className="border-b border-white/8 p-6 sm:p-10">
          <p className="text-xs font-semibold tracking-[0.16em] text-[#ff667a] uppercase">
            New build
          </p>
          <h1 className="mt-4 text-4xl font-medium tracking-[-0.045em] sm:text-6xl">
            Name the direction.
          </h1>
          <p className="mt-5 max-w-2xl leading-7 text-white/45">
            A strong project starts with a coherent goal and a budget
            ceiling—not a random shopping list.
          </p>
        </header>
        <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[160px_1fr]">
          <SectionIntro
            icon={Flag}
            title="Vision"
            text="What the finished car should feel like."
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Build name" error={errors.name}>
              <input
                className={inputClass}
                placeholder="Stealth Rear"
                value={form.name}
                onChange={(event) => update("name", event.target.value)}
              />
            </Field>
            <Field label="Primary goal" error={errors.goal}>
              <select
                className={inputClass}
                value={form.goal}
                onChange={(event) => update("goal", event.target.value)}
              >
                <option value="">Select a goal</option>
                {buildGoals.map((goal) => (
                  <option key={goal}>{goal}</option>
                ))}
              </select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Describe the direction" error={errors.description}>
                <textarea
                  className={`${inputClass} min-h-32 py-3`}
                  placeholder="Darker, cleaner and still coherent with the original design..."
                  value={form.description}
                  onChange={(event) =>
                    update("description", event.target.value)
                  }
                />
              </Field>
            </div>
          </div>
        </div>
        <div className="grid gap-8 border-t border-white/8 p-6 sm:p-10 lg:grid-cols-[160px_1fr]">
          <SectionIntro
            icon={WalletCards}
            title="Budget"
            text="The ceiling for the complete direction."
          />
          <Field
            label="Maximum project budget"
            hint="EUR"
            error={errors.budget}
          >
            <input
              className={inputClass}
              inputMode="numeric"
              placeholder="1200"
              value={form.budget}
              onChange={(event) => update("budget", event.target.value)}
            />
          </Field>
        </div>
        <fieldset className="grid gap-5 border-t border-white/10 p-6 sm:grid-cols-3 sm:p-10">
          <legend className="px-2 text-lg">Your first modification</legend>
          <Field label="Modification">
            <input
              className={inputClass}
              required
              maxLength={100}
              value={form.modification}
              onChange={(event) => update("modification", event.target.value)}
              placeholder="Rear lights"
            />
          </Field>
          <Field label="Build phase">
            <select
              className={inputClass}
              value={form.stage}
              onChange={(event) => update("stage", event.target.value)}
            >
              {buildStages.map((stage) => (
                <option key={stage}>{stage}</option>
              ))}
            </select>
          </Field>
          <Field label="Initial estimate · EUR">
            <input
              className={inputClass}
              type="number"
              min="0"
              step="1"
              value={form.estimate}
              onChange={(event) => update("estimate", event.target.value)}
              placeholder="0 if unknown"
            />
          </Field>
          {errors.first && (
            <p role="alert" className="text-red-200 sm:col-span-3">
              {errors.first}
            </p>
          )}
          {errors.save && (
            <p role="alert" className="text-red-200 sm:col-span-3">
              {errors.save}
            </p>
          )}
        </fieldset>
        <footer className="flex flex-col-reverse items-stretch justify-between gap-4 border-t border-white/8 p-6 sm:flex-row sm:items-center sm:p-8">
          <p className="flex items-center gap-2 text-xs text-white/35">
            <ShieldCheck className="size-3.5" /> Concept plan · no fitment
            claims
          </p>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#e72d45] px-6 text-sm font-semibold text-[#07101d]"
          >
            {saving ? "Saving build…" : "Create build"}{" "}
            <ArrowRight className="size-4" />
          </button>
        </footer>
      </form>
    </div>
  );
}

const inputClass =
  "mt-2 min-h-12 w-full rounded-xl border border-white/10 bg-white/[0.045] px-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#e72d45]/70 focus:ring-3 focus:ring-[#e72d45]/10";

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm text-white/70">
      <span>{label}</span>
      {hint && <span className="ml-2 text-xs text-white/30">{hint}</span>}
      {children}
      {error && (
        <span className="mt-1.5 block text-xs text-red-300">{error}</span>
      )}
    </label>
  );
}

function SectionIntro({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Flag;
  title: string;
  text: string;
}) {
  return (
    <div>
      <Icon className="size-4 text-[#ff667a]" />
      <h2 className="mt-3 font-medium">{title}</h2>
      <p className="mt-1 text-xs leading-5 text-white/35">{text}</p>
    </div>
  );
}
