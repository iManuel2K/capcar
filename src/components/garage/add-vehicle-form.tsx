"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Info, LockKeyhole } from "lucide-react";
import { useState } from "react";

import { VehicleArt } from "@/components/garage/vehicle-art";
import {
  bodyStyles,
  transmissions,
  vehicleInputSchema,
} from "@/features/vehicles/vehicle-schema";
import {
  announceVehicleChange,
  saveVehicle,
} from "@/features/vehicles/vehicle-storage";

type FormState = {
  make: string;
  model: string;
  productionYear: string;
  platform: string;
  bodyStyle: (typeof bodyStyles)[number] | "";
  engineCode: string;
  transmission: (typeof transmissions)[number] | "";
  mileage: string;
  color: string;
  nickname: string;
  vin: string;
};

const initialForm: FormState = {
  make: "BMW",
  model: "",
  productionYear: "",
  platform: "",
  bodyStyle: "",
  engineCode: "",
  transmission: "",
  mileage: "",
  color: "",
  nickname: "",
  vin: "",
};

export function AddVehicleForm() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function update<Key extends keyof FormState>(
    key: Key,
    value: FormState[Key],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    const result = vehicleInputSchema.safeParse(form);
    if (!result.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = String(issue.path[0] ?? "form");
        nextErrors[field] ??= issue.message;
      }
      setErrors(nextErrors);
      setSubmitting(false);
      requestAnimationFrame(() =>
        document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus(),
      );
      return;
    }

    const vehicle = saveVehicle(result.data, window.localStorage);
    announceVehicleChange();
    router.push(`/garage/${vehicle.id}`);
  }

  const previewLabel = `${form.productionYear || "Your"} ${form.make || "vehicle"} ${form.model || "project"}`;

  return (
    <div className="pb-24 sm:pb-0">
      <Link
        href="/garage"
        className="mb-8 inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white"
      >
        <ArrowLeft className="size-4" /> Back to garage
      </Link>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,0.88fr)_minmax(420px,0.72fr)] xl:items-start">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-[2rem] border border-white/10 bg-[#111111] p-5 sm:p-8 lg:p-10"
        >
          <div className="flex items-start justify-between gap-5 border-b border-white/8 pb-8">
            <div>
              <p className="mb-3 text-xs font-semibold tracking-[0.16em] text-[#ff667a] uppercase">
                Vehicle profile
              </p>
              <h1 className="text-3xl font-medium tracking-[-0.035em] sm:text-5xl">
                Add your car.
              </h1>
              <p className="mt-4 max-w-xl leading-7 text-white/50">
                Use the information on your registration document or what you
                already know. You can improve it later.
              </p>
            </div>
            <span className="hidden rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/40 sm:inline-flex">
              1–2 min
            </span>
          </div>

          <FormSection
            number="01"
            title="Identity"
            description="The vehicle users recognize."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Make" error={errors.make} htmlFor="make">
                <input
                  id="make"
                  className={inputClass}
                  placeholder="BMW"
                  value={form.make}
                  onChange={(event) => update("make", event.target.value)}
                  aria-invalid={Boolean(errors.make)}
                />
              </Field>
              <Field label="Model" error={errors.model} htmlFor="model">
                <input
                  id="model"
                  className={inputClass}
                  placeholder="318i"
                  value={form.model}
                  onChange={(e) => update("model", e.target.value)}
                  aria-invalid={Boolean(errors.model)}
                />
              </Field>
              <Field
                label="Production year"
                error={errors.productionYear}
                htmlFor="productionYear"
              >
                <input
                  id="productionYear"
                  className={inputClass}
                  inputMode="numeric"
                  placeholder="2011"
                  value={form.productionYear}
                  onChange={(e) => update("productionYear", e.target.value)}
                  aria-invalid={Boolean(errors.productionYear)}
                />
              </Field>
              <Field
                label="Chassis / platform"
                hint="Examples: E90, F31, G20"
                error={errors.platform}
                htmlFor="platform"
              >
                <input
                  id="platform"
                  className={inputClass}
                  placeholder="E90"
                  value={form.platform}
                  onChange={(e) => update("platform", e.target.value)}
                  aria-invalid={Boolean(errors.platform)}
                />
              </Field>
              <Field
                label="Body style"
                error={errors.bodyStyle}
                htmlFor="bodyStyle"
              >
                <select
                  id="bodyStyle"
                  className={inputClass}
                  value={form.bodyStyle}
                  onChange={(e) =>
                    update(
                      "bodyStyle",
                      e.target.value as FormState["bodyStyle"],
                    )
                  }
                  aria-invalid={Boolean(errors.bodyStyle)}
                >
                  <option value="">Select body style</option>
                  {bodyStyles.map((style) => (
                    <option key={style}>{style}</option>
                  ))}
                </select>
              </Field>
              <Field label="Exterior color" hint="Optional" htmlFor="color">
                <input
                  id="color"
                  className={inputClass}
                  placeholder="Space Grey"
                  value={form.color}
                  onChange={(e) => update("color", e.target.value)}
                />
              </Field>
            </div>
          </FormSection>

          <FormSection
            number="02"
            title="Mechanical specification"
            description="This later controls compatibility."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Engine code"
                hint="Use Unknown if unsure"
                error={errors.engineCode}
                htmlFor="engineCode"
              >
                <input
                  id="engineCode"
                  className={inputClass}
                  placeholder="N43B20"
                  value={form.engineCode}
                  onChange={(e) => update("engineCode", e.target.value)}
                  aria-invalid={Boolean(errors.engineCode)}
                />
              </Field>
              <Field
                label="Transmission"
                error={errors.transmission}
                htmlFor="transmission"
              >
                <select
                  id="transmission"
                  className={inputClass}
                  value={form.transmission}
                  onChange={(e) =>
                    update(
                      "transmission",
                      e.target.value as FormState["transmission"],
                    )
                  }
                  aria-invalid={Boolean(errors.transmission)}
                >
                  <option value="">Select transmission</option>
                  {transmissions.map((transmission) => (
                    <option key={transmission}>{transmission}</option>
                  ))}
                </select>
              </Field>
              <Field
                label="Current mileage"
                hint="Kilometres"
                error={errors.mileage}
                htmlFor="mileage"
              >
                <input
                  id="mileage"
                  className={inputClass}
                  inputMode="numeric"
                  placeholder="148200"
                  value={form.mileage}
                  onChange={(e) => update("mileage", e.target.value)}
                  aria-invalid={Boolean(errors.mileage)}
                />
              </Field>
              <Field
                label="VIN"
                hint="Optional · 17 characters"
                error={errors.vin}
                htmlFor="vin"
              >
                <input
                  id="vin"
                  className={`${inputClass} uppercase`}
                  autoCapitalize="characters"
                  maxLength={17}
                  placeholder="WBAVA..."
                  value={form.vin}
                  onChange={(e) => update("vin", e.target.value)}
                  aria-invalid={Boolean(errors.vin)}
                />
              </Field>
            </div>
          </FormSection>

          <FormSection
            number="03"
            title="Make it yours"
            description="A human name for your project."
          >
            <Field label="Garage nickname" hint="Optional" htmlFor="nickname">
              <input
                id="nickname"
                className={inputClass}
                placeholder="Project 318"
                value={form.nickname}
                onChange={(e) => update("nickname", e.target.value)}
              />
            </Field>
          </FormSection>

          <div className="mt-9 flex flex-col-reverse items-stretch justify-between gap-4 border-t border-white/8 pt-7 sm:flex-row sm:items-center">
            <p className="flex items-center gap-2 text-xs text-white/35">
              <LockKeyhole className="size-3.5" /> Stored only in this browser
            </p>
            <button
              disabled={submitting}
              type="submit"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#e72d45] px-6 text-sm font-semibold text-[#07101d] transition hover:-translate-y-0.5 hover:bg-[#ff667a] disabled:opacity-60"
            >
              {submitting ? "Saving…" : "Create vehicle"}{" "}
              <ArrowRight className="size-4" />
            </button>
          </div>
        </form>

        <aside className="xl:sticky xl:top-26">
          <VehicleArt label={previewLabel} />
          <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
            <PreviewStat
              label="Vehicle"
              value={form.model ? `${form.make} ${form.model}` : "Not set"}
            />
            <PreviewStat
              label="Platform"
              value={form.platform.toUpperCase() || "Not set"}
            />
            <PreviewStat
              label="Mileage"
              value={
                form.mileage
                  ? `${Number(form.mileage || 0).toLocaleString("en-US")} km`
                  : "Not set"
              }
            />
          </div>
          <p className="mt-4 flex items-start gap-2 px-1 text-xs leading-5 text-white/35">
            <Info className="mt-0.5 size-3.5 shrink-0" /> This silhouette is
            atmospheric, not a precise rendering of the selected vehicle.
          </p>
        </aside>
      </div>
    </div>
  );
}

const inputClass =
  "mt-2 min-h-12 w-full rounded-xl border border-white/10 bg-white/[0.045] px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#e72d45]/70 focus:ring-3 focus:ring-[#e72d45]/10 disabled:cursor-not-allowed disabled:text-white/35 aria-[invalid=true]:border-red-400/70";

function FormSection({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-6 border-b border-white/8 py-8 lg:grid-cols-[150px_1fr]">
      <div>
        <span className="text-xs text-[#ff667a]">{number}</span>
        <h2 className="mt-2 font-medium">{title}</h2>
        <p className="mt-1 text-xs leading-5 text-white/35">{description}</p>
      </div>
      <div>{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block text-sm text-white/75">
      <span>{label}</span>
      {hint && <span className="ml-2 text-xs text-white/30">{hint}</span>}
      {children}
      {error && (
        <span className="mt-1.5 block text-xs text-red-300">{error}</span>
      )}
    </label>
  );
}

function PreviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <p className="text-[11px] tracking-[0.12em] text-white/30 uppercase">
        {label}
      </p>
      <p className="mt-2 truncate text-sm font-medium text-white/75">{value}</p>
    </div>
  );
}
