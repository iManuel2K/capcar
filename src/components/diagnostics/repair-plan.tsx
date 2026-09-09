"use client";
import Link from "next/link";
import { useState } from "react";
import type { DiagnosticLog } from "@/features/diagnostics/diagnostic-schema";
import { diagnosticInsightFor } from "@/features/diagnostics/diagnostic-inspector";
import {
  announceDiagnosticChange,
  saveRepairPlan,
} from "@/features/diagnostics/diagnostic-storage";
import { useDiagnostics } from "@/features/diagnostics/use-diagnostics";

export function RepairPlan({ record }: { record: DiagnosticLog }) {
  const [message, setMessage] = useState("");
  const insight = diagnosticInsightFor(record.code);
  function save(checks: Array<{ label: string; done: boolean }>) {
    try {
      saveRepairPlan(record.id, checks, localStorage);
      announceDiagnosticChange();
      setMessage(
        "Repair checks saved. Checking a step does not resolve the fault.",
      );
    } catch {
      setMessage(
        "Could not save repair checks. Existing records were not replaced.",
      );
    }
  }
  return (
    <div className="mt-5 space-y-3 border-t border-white/15 pt-4 text-sm">
      <h4 className="font-medium">Diagnostic-to-repair plan</h4>
      <p className="leading-6 text-white/65">{insight.summary}</p>
      {record.repairPlan ? (
        record.repairPlan.checks.map((check, index) => (
          <label key={index} className="flex min-h-11 items-start gap-3">
            <input
              type="checkbox"
              className="mt-1 size-5 shrink-0"
              checked={check.done}
              onChange={(event) =>
                save(
                  record.repairPlan!.checks.map((item, i) =>
                    i === index
                      ? { ...item, done: event.target.checked }
                      : item,
                  ),
                )
              }
            />
            <span>{check.label}</span>
          </label>
        ))
      ) : (
        <button
          type="button"
          className="min-h-11 rounded-xl border border-white/25 px-4"
          onClick={() =>
            save(insight.steps.map((label) => ({ label, done: false })))
          }
        >
          Create repair checklist
        </button>
      )}
      <div className="flex flex-wrap gap-4">
        {insight.partQueries.map((part) => (
          <Link
            className="inline-flex min-h-11 items-center underline"
            key={part.query}
            href={`/parts-search?q=${encodeURIComponent(part.query)}`}
          >
            {part.label} →
          </Link>
        ))}
      </div>
      <div className="flex flex-wrap gap-4">
        <Link
          className="inline-flex min-h-11 items-center underline"
          href={`/garage/${record.vehicleId}/maintenance`}
        >
          Maintenance
        </Link>
        <Link
          className="inline-flex min-h-11 items-center underline"
          href="/verified-work"
        >
          Request specialist confirmation
        </Link>
        <Link
          className="inline-flex min-h-11 items-center underline"
          href={`/garage/${record.vehicleId}/timeline`}
        >
          Vehicle timeline
        </Link>
      </div>
      <p className="text-xs text-white/60">
        Parts are research suggestions, not a confirmed diagnosis. Stop and seek
        qualified inspection for critical warnings. Specialist confirmation is
        requested separately.
      </p>
      <p role="status">{message}</p>
    </div>
  );
}

export function MaintenanceRepairPlans({ vehicleId }: { vehicleId: string }) {
  const records = useDiagnostics(vehicleId).filter(
    (record) => record.repairPlan && record.status !== "resolved",
  );
  if (!records.length) return null;
  return (
    <section className="my-6 rounded-2xl border border-white/15 bg-[#111] p-5">
      <h2 className="text-xl">Active diagnostic repairs</h2>
      {records.map((record) => (
        <article key={record.id} className="mt-5">
          <h3>
            {record.code} · {record.title}
          </h3>
          <RepairPlan record={record} />
        </article>
      ))}
    </section>
  );
}
