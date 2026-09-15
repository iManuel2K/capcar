"use client";

import { ArrowDown, ArrowUp, CircleAlert, Plus, Wrench } from "lucide-react";
import { useState } from "react";
import {
  getConnectedBuildMetrics,
  phaseForItem,
  planningForBuild,
} from "@/features/builds/build-planning";
import type { Build, BuildItem } from "@/features/builds/build-schema";
import {
  announceBuildChange,
  updateBuildItemPlanning,
  updateBuildPlanning,
} from "@/features/builds/build-storage";

const action =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/20 px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-35";
const input =
  "min-h-11 rounded-xl border border-white/15 bg-black/20 px-3 text-sm text-white focus-visible:outline-2";
const money = (value: number) =>
  new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(
    value,
  );

export function ConnectedBuildPlanner({
  build,
  items,
}: {
  build: Build;
  items: BuildItem[];
}) {
  const planning = planningForBuild(build);
  const metrics = getConnectedBuildMetrics(build, items, planning);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [newPhase, setNewPhase] = useState("");

  function save(next: typeof planning, success: string) {
    try {
      updateBuildPlanning(build.id, next, window.localStorage);
      announceBuildChange();
      setError("");
      setMessage(success);
    } catch (caught) {
      setMessage("");
      setError(
        caught instanceof Error ? caught.message : "The plan was not saved.",
      );
    }
  }

  function addPhase() {
    const title = newPhase.trim();
    if (title.length < 2) {
      setError("Enter a phase name.");
      return;
    }
    save(
      {
        ...planning,
        phases: [
          ...planning.phases,
          {
            id: crypto.randomUUID(),
            title,
            order: planning.phases.length,
            budget: 0,
          },
        ],
      },
      "Phase added.",
    );
    setNewPhase("");
  }

  function move(id: string, direction: -1 | 1) {
    const ordered = [...planning.phases].sort((a, b) => a.order - b.order);
    const index = ordered.findIndex((phase) => phase.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= ordered.length) return;
    [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
    save(
      {
        ...planning,
        phases: ordered.map((phase, order) => ({ ...phase, order })),
      },
      "Phase order updated.",
    );
  }

  function saveItem(item: BuildItem, form: HTMLFormElement) {
    const data = new FormData(form);
    try {
      updateBuildItemPlanning(
        build.id,
        item.id,
        {
          phaseId: String(data.get("phaseId")),
          targetDate: String(data.get("targetDate") || "") || undefined,
          priority: String(data.get("priority")) as BuildItem["priority"],
          dependsOn: data.getAll("dependsOn").map(String),
        },
        window.localStorage,
      );
      announceBuildChange();
      setError("");
      setMessage(`${item.title} planning updated.`);
    } catch (caught) {
      setMessage("");
      setError(
        caught instanceof Error
          ? caught.message
          : "The modification was not saved.",
      );
    }
  }

  return (
    <section className="mt-5 overflow-hidden rounded-[2rem] border border-white/10 bg-[#0d1918] text-[#eee7d8]">
      <div className="grid gap-6 border-b border-white/10 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-xs tracking-[0.16em] text-[#cda58e] uppercase">
            Epic 120 · Connected build plan
          </p>
          <h2 className="mt-3 text-3xl font-medium sm:text-5xl">
            Know what happens next.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">
            {build.goal} ·{" "}
            {planning.phases.find(
              (phase) => phase.id === planning.currentPhaseId,
            )?.title ?? "Choose a current phase"}
            . Dependencies keep blocked work out of the way.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs text-white/40 uppercase">Next action</p>
          <p className="mt-2 max-w-72 font-medium">
            {metrics.next?.title ??
              (items.length
                ? "Resolve the blocked modifications."
                : "Add the first modification.")}
          </p>
        </div>
      </div>

      {(error || message) && (
        <p
          className={`mx-6 mt-5 rounded-xl border p-3 text-sm ${error ? "border-red-300/30 text-red-200" : "border-emerald-300/25 text-emerald-100"}`}
          role={error ? "alert" : "status"}
        >
          {error || message}
        </p>
      )}

      <div className="grid gap-3 p-6 sm:grid-cols-2 sm:p-8 xl:grid-cols-4">
        <PlannerMetric label="Planned" value={money(metrics.planned)} />
        <PlannerMetric label="Committed" value={money(metrics.committed)} />
        <PlannerMetric label="Paid" value={money(metrics.paid)} />
        <PlannerMetric
          label="Progress"
          value={`${metrics.progress}%`}
          warning={metrics.remaining < 0}
          detail={`${money(metrics.remaining)} remaining`}
        />
      </div>

      <div className="px-6 pb-8 sm:px-8">
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <label className="flex-1 text-xs text-white/50">
            Add a build phase
            <input
              className={`mt-2 w-full ${input}`}
              value={newPhase}
              maxLength={60}
              onChange={(event) => setNewPhase(event.target.value)}
            />
          </label>
          <button className={action} type="button" onClick={addPhase}>
            <Plus className="size-4" /> Add phase
          </button>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {metrics.phases.map((phase, index) => (
            <article
              key={phase.id}
              className={`rounded-2xl border p-5 ${phase.id === planning.currentPhaseId ? "border-[#e72d45]/55 bg-[#e72d45]/8" : "border-white/10 bg-black/15"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-white/35 uppercase">
                    Phase {String(index + 1).padStart(2, "0")}
                  </p>
                  <label className="mt-1 block text-xs text-white/45">
                    Phase name
                    <input
                      className={`mt-1 w-full text-xl font-medium ${input}`}
                      defaultValue={phase.title}
                      maxLength={60}
                      onBlur={(event) => {
                        const title = event.target.value.trim();
                        if (title === phase.title) return;
                        save(
                          {
                            ...planning,
                            phases: planning.phases.map((entry) =>
                              entry.id === phase.id
                                ? { ...entry, title }
                                : entry,
                            ),
                          },
                          "Phase renamed.",
                        );
                      }}
                    />
                  </label>
                </div>
                <div className="flex gap-1">
                  <button
                    className={action}
                    aria-label={`Move ${phase.title} earlier`}
                    disabled={index === 0}
                    onClick={() => move(phase.id, -1)}
                  >
                    <ArrowUp className="size-4" />
                  </button>
                  <button
                    className={action}
                    aria-label={`Move ${phase.title} later`}
                    disabled={index === metrics.phases.length - 1}
                    onClick={() => move(phase.id, 1)}
                  >
                    <ArrowDown className="size-4" />
                  </button>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <span>{phase.itemCount} modifications</span>
                <span>{phase.completed} installed</span>
                <span>{money(phase.planned)} planned</span>
                <span>{money(phase.budget)} allocation</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  className={action}
                  disabled={phase.id === planning.currentPhaseId}
                  onClick={() =>
                    save(
                      { ...planning, currentPhaseId: phase.id },
                      `${phase.title} is now current.`,
                    )
                  }
                >
                  Set current
                </button>
                <label className="text-xs text-white/50">
                  Phase budget
                  <input
                    className={`ml-2 w-28 ${input}`}
                    type="number"
                    min="0"
                    max="1000000"
                    defaultValue={phase.budget}
                    onBlur={(event) =>
                      save(
                        {
                          ...planning,
                          phases: planning.phases.map((entry) =>
                            entry.id === phase.id
                              ? { ...entry, budget: Number(event.target.value) }
                              : entry,
                          ),
                        },
                        "Phase budget updated.",
                      )
                    }
                  />
                </label>
                <label className="text-xs text-white/50">
                  Target date
                  <input
                    className={`ml-2 ${input}`}
                    type="date"
                    defaultValue={phase.targetDate}
                    onBlur={(event) =>
                      save(
                        {
                          ...planning,
                          phases: planning.phases.map((entry) =>
                            entry.id === phase.id
                              ? {
                                  ...entry,
                                  targetDate: event.target.value || undefined,
                                }
                              : entry,
                          ),
                        },
                        "Phase target updated.",
                      )
                    }
                  />
                </label>
                <button
                  className={action}
                  type="button"
                  disabled={planning.phases.length === 1 || phase.itemCount > 0}
                  title={
                    phase.itemCount > 0
                      ? "Move its modifications before removing this phase."
                      : undefined
                  }
                  onClick={() => {
                    const remaining = planning.phases
                      .filter((entry) => entry.id !== phase.id)
                      .map((entry, order) => ({ ...entry, order }));
                    save(
                      {
                        ...planning,
                        phases: remaining,
                        currentPhaseId:
                          planning.currentPhaseId === phase.id
                            ? remaining[0].id
                            : planning.currentPhaseId,
                      },
                      "Empty phase removed.",
                    );
                  }}
                >
                  Remove phase
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10 p-6 sm:p-8">
        <h3 className="text-xl font-medium">Modification dependencies</h3>
        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <details
              key={item.id}
              className="rounded-2xl border border-white/10 p-4"
            >
              <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2">
                  <Wrench className="size-4 text-[#ff667a]" /> {item.title}
                </span>
                <span className="text-xs text-white/45">
                  {phaseForItem(item, planning)?.title} · {item.priority}
                </span>
              </summary>
              <form
                className="mt-4 grid gap-4 sm:grid-cols-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  saveItem(item, event.currentTarget);
                }}
              >
                <label className="text-xs text-white/50">
                  Phase
                  <select
                    className={`mt-2 w-full ${input}`}
                    name="phaseId"
                    defaultValue={phaseForItem(item, planning)?.id}
                  >
                    {metrics.phases.map((phase) => (
                      <option key={phase.id} value={phase.id}>
                        {phase.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs text-white/50">
                  Priority
                  <select
                    className={`mt-2 w-full ${input}`}
                    name="priority"
                    defaultValue={item.priority}
                  >
                    <option value="now">Now</option>
                    <option value="next">Next</option>
                    <option value="later">Later</option>
                  </select>
                </label>
                <label className="text-xs text-white/50">
                  Target date
                  <input
                    className={`mt-2 w-full ${input}`}
                    type="date"
                    name="targetDate"
                    defaultValue={item.targetDate}
                  />
                </label>
                <fieldset className="sm:col-span-3">
                  <legend className="text-xs text-white/50">
                    Must be installed first
                  </legend>
                  <div className="mt-2 flex flex-wrap gap-3">
                    {items
                      .filter((candidate) => candidate.id !== item.id)
                      .map((candidate) => (
                        <label
                          key={candidate.id}
                          className="flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-3 text-sm"
                        >
                          <input
                            type="checkbox"
                            name="dependsOn"
                            value={candidate.id}
                            defaultChecked={(item.dependsOn ?? []).includes(
                              candidate.id,
                            )}
                          />
                          {candidate.title}
                        </label>
                      ))}
                    {items.length === 1 && (
                      <span className="text-sm text-white/40">
                        No other modifications yet.
                      </span>
                    )}
                  </div>
                </fieldset>
                <button
                  className={`${action} sm:col-span-3 sm:justify-self-start`}
                  type="submit"
                >
                  Save planning
                </button>
              </form>
            </details>
          ))}
          {metrics.blocked.length > 0 && (
            <p className="flex gap-2 rounded-xl border border-amber-200/20 p-4 text-sm text-amber-100">
              <CircleAlert className="size-4 shrink-0" />{" "}
              {metrics.blocked.length} modification
              {metrics.blocked.length === 1 ? " is" : "s are"} waiting for
              required work.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function PlannerMetric({
  label,
  value,
  detail,
  warning = false,
}: {
  label: string;
  value: string;
  detail?: string;
  warning?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${warning ? "border-red-300/30" : "border-white/10"}`}
    >
      <p className="text-xs text-white/35 uppercase">{label}</p>
      <p className="mt-2 text-2xl font-medium">{value}</p>
      {detail && <p className="mt-1 text-xs text-white/45">{detail}</p>}
    </div>
  );
}
