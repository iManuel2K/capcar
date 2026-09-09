"use client";

import { CheckCircle2, Plus, ScanLine, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { ScanImporter } from "./scan-importer";
import { RepairPlan } from "./repair-plan";

import {
  announceDiagnosticChange,
  saveDiagnostic,
  updateDiagnosticStatus,
} from "@/features/diagnostics/diagnostic-storage";
import type { DiagnosticStatus } from "@/features/diagnostics/diagnostic-schema";
import { useDiagnostics } from "@/features/diagnostics/use-diagnostics";
import { useVehicles } from "@/features/vehicles/use-vehicles";

export function DiagnosticsDashboard({ vehicleId }: { vehicleId: string }) {
  const { vehicles } = useVehicles();
  const vehicle = vehicles.find((item) => item.id === vehicleId);
  const records = useDiagnostics(vehicleId);
  const [formOpen, setFormOpen] = useState(false);
  const [error, setError] = useState("");

  if (!vehicle)
    return (
      <div className="py-32 text-center text-white/45">Vehicle not found.</div>
    );

  return (
    <div className="pb-24 sm:pb-0">
      <header className="flex flex-col gap-6 rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_85%_10%,rgba(231,45,69,0.2),transparent_30%),#111111] p-6 sm:p-10 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.15em] text-[#ff667a] uppercase">
            Diagnostic log
          </p>
          <h1 className="mt-4 text-4xl font-medium tracking-[-0.05em] sm:text-6xl">
            Faults need context.
          </h1>
          <p className="mt-4 max-w-2xl leading-7 text-white/45">
            Record manual OBD-II readings, symptoms and the work that resolved
            them. A code is evidence—not a diagnosis.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFormOpen((value) => !value)}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#e72d45] px-5 text-sm font-semibold text-white"
        >
          <Plus className="size-4" /> Log fault code
        </button>
      </header>

      <aside className="mt-5 flex gap-3 rounded-2xl border border-amber-300/15 bg-amber-300/6 p-4 text-sm leading-6 text-amber-100/65">
        <ShieldAlert className="mt-0.5 size-4 shrink-0" /> Critical warnings,
        braking faults, overheating or oil-pressure alerts require qualified
        inspection. Capcar does not clear codes or replace diagnosis.
      </aside>

      {formOpen && (
        <DiagnosticForm
          vehicleId={vehicleId}
          mileage={vehicle.mileage}
          onClose={() => setFormOpen(false)}
          onError={setError}
        />
      )}
      <ScanImporter vehicleId={vehicleId} mileage={vehicle.mileage} />
      {error && (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-red-300/15 bg-red-300/6 p-4 text-sm text-red-100/75"
        >
          {error}
        </p>
      )}

      <section className="mt-5 rounded-[2rem] border border-white/10 bg-[#111111] p-5 sm:p-8">
        <div className="grid gap-3 sm:grid-cols-3">
          <Summary
            label="Open"
            value={records.filter((item) => item.status === "open").length}
            tone="red"
          />
          <Summary
            label="Monitoring"
            value={
              records.filter((item) => item.status === "monitoring").length
            }
            tone="amber"
          />
          <Summary
            label="Resolved"
            value={records.filter((item) => item.status === "resolved").length}
            tone="green"
          />
        </div>
        {records.length === 0 ? (
          <div className="mt-7 flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 text-center">
            <ScanLine className="size-8 text-white/18" />
            <h2 className="mt-5 text-xl font-medium">No diagnostic records</h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-white/38">
              Add the exact DTC, mileage and observed symptoms after reading the
              vehicle.
            </p>
          </div>
        ) : (
          <div className="mt-7 grid gap-3">
            {records.map((record) => (
              <DiagnosticCard key={record.id} record={record} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function DiagnosticForm({
  vehicleId,
  mileage,
  onClose,
  onError,
}: {
  vehicleId: string;
  mileage: number;
  onClose: () => void;
  onError: (value: string) => void;
}) {
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      saveDiagnostic(
        {
          vehicleId,
          code: String(form.get("code") ?? ""),
          title: String(form.get("title") ?? ""),
          severity: String(form.get("severity")) as
            "info" | "warning" | "critical",
          status: "open",
          symptoms: String(form.get("symptoms") ?? ""),
          mileage: Number(form.get("mileage")),
        },
        window.localStorage,
      );
      announceDiagnosticChange();
      onError("");
      onClose();
    } catch (caught) {
      onError(
        caught instanceof Error
          ? caught.message
          : "Could not save this diagnostic record.",
      );
    }
  }
  return (
    <form
      onSubmit={submit}
      className="mt-5 rounded-[2rem] border border-[#e72d45]/20 bg-[#151010] p-5 sm:p-8"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field name="code" label="DTC code" placeholder="P0420" required />
        <Field
          name="title"
          label="Short description"
          placeholder="Catalyst efficiency below threshold"
          required
        />
        <label className="text-xs text-white/45">
          Severity
          <select
            name="severity"
            defaultValue="warning"
            className="mt-2 min-h-12 w-full rounded-xl border border-white/12 bg-[#0b0b0b] px-4 text-sm"
          >
            <option value="info">Information</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
        </label>
        <Field
          name="mileage"
          label="Mileage"
          placeholder={String(mileage)}
          defaultValue={String(mileage)}
          type="number"
          required
        />
        <label className="text-xs text-white/45 md:col-span-2">
          Observed symptoms
          <textarea
            name="symptoms"
            required
            placeholder="When it appeared, sound, temperature and driving conditions"
            className="mt-2 min-h-28 w-full rounded-xl border border-white/12 bg-[#0b0b0b] p-4 text-sm placeholder:text-white/20 focus:border-[#e72d45] focus:outline-none"
          />
        </label>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="min-h-11 rounded-xl border border-white/10 px-4 text-sm text-white/50"
        >
          Cancel
        </button>
        <button className="min-h-11 rounded-xl bg-[#e72d45] px-5 text-sm font-semibold text-white">
          Save diagnostic
        </button>
      </div>
    </form>
  );
}

function DiagnosticCard({
  record,
}: {
  record: ReturnType<typeof useDiagnostics>[number];
}) {
  const [resolution, setResolution] = useState(record.resolution ?? "");
  const [saveError, setSaveError] = useState("");
  function setStatus(status: DiagnosticStatus) {
    if (status === "resolved" && resolution.trim().length < 10) {
      setSaveError(
        "Describe the work and verification performed before resolving this fault (at least 10 characters).",
      );
      return;
    }
    try {
      updateDiagnosticStatus(
        record.id,
        status,
        resolution,
        window.localStorage,
      );
      announceDiagnosticChange();
      setSaveError("");
    } catch {
      setSaveError("Could not save. Check browser storage and retry.");
    }
  }
  const severity = {
    info: "border-sky-300/20 bg-sky-300/8 text-sky-200",
    warning: "border-amber-300/20 bg-amber-300/8 text-amber-200",
    critical: "border-red-300/20 bg-red-300/8 text-red-200",
  }[record.severity];
  return (
    <article className="rounded-2xl border border-white/8 bg-[#0c0c0c] p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-lg font-semibold text-white">
              {record.code}
            </span>
            <span
              className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase ${severity}`}
            >
              {record.severity}
            </span>
          </div>
          <h3 className="mt-3 font-medium text-white/85">{record.title}</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/40">
            {record.symptoms}
          </p>
          <p className="mt-3 text-xs text-white/25">
            Logged at {record.mileage.toLocaleString("en-US")} km
          </p>
        </div>
        <select
          aria-label={`Status for ${record.code}`}
          value={record.status}
          onChange={(event) =>
            setStatus(event.target.value as DiagnosticStatus)
          }
          className="min-h-10 rounded-xl border border-white/10 bg-[#171717] px-3 text-xs"
        >
          <option value="open">Open</option>
          <option value="monitoring">Monitoring</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
        <input
          aria-label={`Repair evidence for ${record.code}`}
          maxLength={800}
          value={resolution}
          onChange={(event) => setResolution(event.target.value)}
          placeholder="Resolution steps or workshop finding"
          className="min-h-11 rounded-xl border border-white/10 bg-[#151515] px-4 text-sm placeholder:text-white/20 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setStatus("resolved")}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-emerald-300/15 bg-emerald-300/6 px-4 text-sm text-emerald-200"
        >
          <CheckCircle2 className="size-4" /> Mark resolved
        </button>
      </div>
      {saveError && (
        <p role="alert" className="mt-3 text-sm text-red-200">
          {saveError}
        </p>
      )}
      <RepairPlan record={record} />
    </article>
  );
}

function Field({
  name,
  label,
  placeholder,
  required,
  type = "text",
  defaultValue,
}: {
  name: string;
  label: string;
  placeholder: string;
  required?: boolean;
  type?: string;
  defaultValue?: string;
}) {
  return (
    <label className="text-xs text-white/45">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="mt-2 min-h-12 w-full rounded-xl border border-white/12 bg-[#0b0b0b] px-4 text-sm placeholder:text-white/20 focus:border-[#e72d45] focus:outline-none"
      />
    </label>
  );
}
function Summary({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "red" | "amber" | "green";
}) {
  const color = {
    red: "text-red-200",
    amber: "text-amber-200",
    green: "text-emerald-200",
  }[tone];
  return (
    <div className="rounded-xl border border-white/8 bg-[#0c0c0c] p-4">
      <p className={`text-2xl font-medium ${color}`}>{value}</p>
      <p className="mt-1 text-xs text-white/30">{label}</p>
    </div>
  );
}
