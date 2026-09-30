"use client";

import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  CircleAlert,
  CloudOff,
  PencilLine,
  Plus,
  Wrench,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  dependencyBlockers,
  getConnectedBuildMetrics,
  phaseForItem,
  planningForBuild,
} from "@/features/builds/build-planning";
import {
  buildGoals,
  type Build,
  type BuildItem,
} from "@/features/builds/build-schema";
import { findGuideForPart } from "@/features/guides/guide-catalog";
import {
  announceBuildChange,
  updateBuildDetails,
  updateBuildItemPlanning,
  updateBuildPlanning,
} from "@/features/builds/build-storage";

const action =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/20 px-3 text-sm transition hover:border-white/40 focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-35";
const primaryAction = `${action} border-[#e72d45] bg-[#e72d45] font-semibold text-white hover:border-[#ff667a]`;
const input =
  "mt-2 min-h-11 w-full rounded-xl border border-white/15 bg-black/20 px-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#e72d45]/70 focus:ring-3 focus:ring-[#e72d45]/10";
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
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  function report(caught: unknown, fallback: string) {
    setMessage("");
    setError(caught instanceof Error ? caught.message : fallback);
  }

  function savePlan(next: typeof planning, success: string) {
    try {
      updateBuildPlanning(build.id, next, window.localStorage);
      announceBuildChange();
      setError("");
      setMessage(success);
    } catch (caught) {
      report(caught, "The plan was not saved.");
    }
  }

  function saveBuild(form: HTMLFormElement) {
    const data = new FormData(form);
    try {
      updateBuildDetails(
        build.id,
        {
          name: String(data.get("name") ?? ""),
          goal: String(data.get("goal") ?? "") as Build["goal"],
          description: String(data.get("description") ?? ""),
          budget: Number(data.get("budget")),
        },
        window.localStorage,
      );
      announceBuildChange();
      setError("");
      setMessage("Build brief updated.");
    } catch (caught) {
      report(caught, "The build brief was not saved.");
    }
  }

  function addPhase() {
    const title = newPhase.trim();
    if (title.length < 2) {
      setError("Enter a phase name.");
      return;
    }
    savePlan(
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
    savePlan(
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
          title: String(data.get("title") ?? ""),
          note: String(data.get("note") ?? "").trim() || undefined,
          estimatedCost: Number(data.get("estimatedCost")),
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
      report(caught, "The modification was not saved.");
    }
  }

  return (
    <section className="mt-5 overflow-hidden rounded-[2rem] border border-white/10 bg-[#0d1918] text-[#eee7d8]">
      <div className="grid gap-6 border-b border-white/10 p-5 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs tracking-[0.16em] text-[#cda58e] uppercase">
              Build Planner 2.0 · Available now
            </p>
            {!online && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/20 px-2.5 py-1 text-[10px] text-amber-100">
                <CloudOff className="size-3" /> Offline · saved on this device
              </span>
            )}
          </div>
          <h2 className="mt-3 text-3xl font-medium tracking-[-0.04em] sm:text-5xl">
            Know what happens next.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">
            {build.goal} · Current phase:{" "}
            <strong className="font-medium text-white/85">
              {planning.phases.find(
                (phase) => phase.id === planning.currentPhaseId,
              )?.title ?? "Choose a phase"}
            </strong>
          </p>
        </div>
        <div className="max-w-sm rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs text-white/40 uppercase">Next action</p>
          <p className="mt-2 font-medium">
            {metrics.next?.title ??
              (metrics.blocked.length
                ? "Resolve the blocked modifications."
                : items.length
                  ? "Review the completed build record."
                  : "Add the first modification.")}
          </p>
        </div>
      </div>

      {(error || message) && (
        <p
          className={`mx-5 mt-5 rounded-xl border p-3 text-sm sm:mx-8 ${error ? "border-red-300/30 text-red-200" : "border-emerald-300/25 text-emerald-100"}`}
          role={error ? "alert" : "status"}
        >
          {error || message}
        </p>
      )}

      <details className="border-b border-white/10 px-5 py-5 sm:px-8">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4">
          <span>
            <span className="block font-medium">Build brief</span>
            <span className="mt-1 block text-xs text-white/45">
              Goal, direction and overall budget
            </span>
          </span>
          <PencilLine className="size-4 text-[#ff667a]" />
        </summary>
        <form
          className="mt-5 grid gap-4 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            saveBuild(event.currentTarget);
          }}
        >
          <PlannerField label="Build name">
            <input
              className={input}
              name="name"
              defaultValue={build.name}
              maxLength={60}
              required
            />
          </PlannerField>
          <PlannerField label="Goal">
            <select className={input} name="goal" defaultValue={build.goal}>
              {buildGoals.map((goal) => (
                <option key={goal}>{goal}</option>
              ))}
            </select>
          </PlannerField>
          <PlannerField label="Overall budget · EUR">
            <input
              className={input}
              name="budget"
              type="number"
              min="100"
              max="1000000"
              step="1"
              defaultValue={build.budget}
              required
            />
          </PlannerField>
          <div className="sm:col-span-2">
            <PlannerField label="Direction">
              <textarea
                className={`${input} min-h-28 py-3`}
                name="description"
                defaultValue={build.description}
                maxLength={500}
                required
              />
            </PlannerField>
          </div>
          <button className={`${primaryAction} sm:justify-self-start`}>
            Save build brief
          </button>
        </form>
      </details>

      <div className="grid grid-cols-2 gap-3 p-5 sm:p-8 lg:grid-cols-3 xl:grid-cols-6">
        <PlannerMetric label="Planned" value={money(metrics.planned)} />
        <PlannerMetric label="Committed" value={money(metrics.committed)} />
        <PlannerMetric label="Paid" value={money(metrics.paid)} />
        <PlannerMetric label="Forecast" value={money(metrics.forecast)} />
        <PlannerMetric
          label="Remaining"
          value={money(metrics.remaining)}
          warning={metrics.remaining < 0}
        />
        <PlannerMetric
          label="Installed"
          value={`${metrics.progress}%`}
          detail={`${items.filter((item) => item.status === "installed").length}/${items.length}`}
        />
      </div>

      <div className="px-5 pb-7 sm:px-8 sm:pb-8">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex-1 text-xs text-white/50">
            Add a build phase
            <input
              className={input}
              value={newPhase}
              maxLength={60}
              onChange={(event) => setNewPhase(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addPhase();
                }
              }}
            />
          </label>
          <button className={action} type="button" onClick={addPhase}>
            <Plus className="size-4" /> Add phase
          </button>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {metrics.phases.map((phase, index) => {
            const overBudget = phase.budget > 0 && phase.remaining < 0;
            return (
              <article
                key={phase.id}
                className={`rounded-2xl border p-4 sm:p-5 ${phase.id === planning.currentPhaseId ? "border-[#e72d45]/55 bg-[#e72d45]/8" : overBudget ? "border-amber-200/30 bg-amber-200/[0.03]" : "border-white/10 bg-black/15"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-white/35 uppercase">
                      Phase {String(index + 1).padStart(2, "0")}
                    </p>
                    <label className="mt-1 block text-xs text-white/45">
                      Phase name
                      <input
                        className={`${input} text-lg font-medium sm:text-xl`}
                        defaultValue={phase.title}
                        maxLength={60}
                        onBlur={(event) => {
                          const title = event.target.value.trim();
                          if (title === phase.title) return;
                          savePlan(
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
                      type="button"
                      className={action}
                      aria-label={`Move ${phase.title} earlier`}
                      disabled={index === 0}
                      onClick={() => move(phase.id, -1)}
                    >
                      <ArrowUp className="size-4" />
                    </button>
                    <button
                      type="button"
                      className={action}
                      aria-label={`Move ${phase.title} later`}
                      disabled={index === metrics.phases.length - 1}
                      onClick={() => move(phase.id, 1)}
                    >
                      <ArrowDown className="size-4" />
                    </button>
                  </div>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                  <PhaseStat label="Modifications" value={phase.itemCount} />
                  <PhaseStat label="Installed" value={phase.completed} />
                  <PhaseStat label="Forecast" value={money(phase.forecast)} />
                  <PhaseStat
                    label={phase.budget ? "Allocation left" : "Allocation"}
                    value={phase.budget ? money(phase.remaining) : "Not set"}
                    warning={overBudget}
                  />
                </dl>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <PlannerField label="Phase budget · EUR">
                    <input
                      className={input}
                      type="number"
                      min="0"
                      max="1000000"
                      defaultValue={phase.budget}
                      onBlur={(event) => {
                        const budget = Number(event.target.value);
                        if (budget === phase.budget) return;
                        savePlan(
                          {
                            ...planning,
                            phases: planning.phases.map((entry) =>
                              entry.id === phase.id
                                ? { ...entry, budget }
                                : entry,
                            ),
                          },
                          "Phase budget updated.",
                        );
                      }}
                    />
                  </PlannerField>
                  <PlannerField label="Target date">
                    <input
                      className={input}
                      type="date"
                      defaultValue={phase.targetDate}
                      onBlur={(event) => {
                        const targetDate = event.target.value || undefined;
                        if (targetDate === phase.targetDate) return;
                        savePlan(
                          {
                            ...planning,
                            phases: planning.phases.map((entry) =>
                              entry.id === phase.id
                                ? { ...entry, targetDate }
                                : entry,
                            ),
                          },
                          "Phase target updated.",
                        );
                      }}
                    />
                  </PlannerField>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={action}
                    disabled={phase.id === planning.currentPhaseId}
                    onClick={() =>
                      savePlan(
                        { ...planning, currentPhaseId: phase.id },
                        `${phase.title} is now current.`,
                      )
                    }
                  >
                    Set current
                  </button>
                  <button
                    type="button"
                    className={action}
                    disabled={
                      planning.phases.length === 1 || phase.itemCount > 0
                    }
                    title={
                      phase.itemCount > 0
                        ? "Move its modifications before removing this phase."
                        : undefined
                    }
                    onClick={() => {
                      const remaining = planning.phases
                        .filter((entry) => entry.id !== phase.id)
                        .map((entry, order) => ({ ...entry, order }));
                      savePlan(
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
                    Remove empty phase
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <div className="border-t border-white/10 p-5 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-xl font-medium">Modification plan</h3>
            <p className="mt-2 text-sm text-white/45">
              Edit estimates, priorities, dates and the work that must happen
              first.
            </p>
          </div>
          <span className="text-xs text-white/35">
            {metrics.blocked.length} blocked · {items.length} total
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {items.map((item) => {
            const blockers = dependencyBlockers(item, items);
            const guide = item.catalogPartId
              ? findGuideForPart(item.catalogPartId)
              : undefined;
            return (
              <details
                key={item.id}
                className={`rounded-2xl border p-4 ${blockers.length ? "border-amber-200/25" : "border-white/10"}`}
              >
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4">
                  <span className="inline-flex min-w-0 items-center gap-2">
                    <Wrench className="size-4 shrink-0 text-[#ff667a]" />
                    <span className="truncate">{item.title}</span>
                  </span>
                  <span className="shrink-0 text-right text-xs text-white/45">
                    {phaseForItem(item, planning)?.title} · {item.priority}
                  </span>
                </summary>

                {blockers.length > 0 && (
                  <p className="mt-3 flex gap-2 rounded-xl border border-amber-200/15 bg-amber-200/[0.03] p-3 text-sm text-amber-100">
                    <CircleAlert className="mt-0.5 size-4 shrink-0" />
                    Blocked until{" "}
                    {blockers.map((blocker) => blocker.title).join(", ")} is
                    installed.
                  </p>
                )}

                <div className="mt-3 rounded-xl border border-white/10 bg-black/10 p-3">
                  <p className="text-[10px] font-semibold tracking-[0.12em] text-white/35 uppercase">
                    Installation preparation
                  </p>
                  {guide ? (
                    <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="font-medium text-white/80">
                          {guide.title}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-white/45">
                          {guide.difficulty} · {guide.estimatedMinutes} min
                          {guide.installationPlan
                            ? " · " + guide.installationPlan.recommendedSetting
                            : ""}
                          {blockers.length
                            ? " · Dependencies must be installed first"
                            : " · Sequence ready"}
                        </p>
                      </div>
                      <Link
                        href={
                          "/garage/" +
                          encodeURIComponent(build.vehicleId) +
                          "/guides/" +
                          encodeURIComponent(guide.slug)
                        }
                        className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border border-white/15 px-4 text-sm font-medium text-white/70 hover:border-[#e72d45]/50 hover:text-white"
                      >
                        Open preparation
                      </Link>
                    </div>
                  ) : (
                    <p className="mt-2 text-xs leading-5 text-white/40">
                      No vehicle-specific guide is attached. This plan is not
                      installation instruction; verify the exact workshop
                      procedure before starting.
                    </p>
                  )}
                </div>

                <form
                  className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                  onSubmit={(event) => {
                    event.preventDefault();
                    saveItem(item, event.currentTarget);
                  }}
                >
                  <PlannerField label="Modification">
                    <input
                      className={input}
                      name="title"
                      defaultValue={item.title}
                      maxLength={100}
                      required
                    />
                  </PlannerField>
                  <PlannerField label="Estimate · EUR">
                    <input
                      className={input}
                      name="estimatedCost"
                      type="number"
                      min="0"
                      max="1000000"
                      step="1"
                      defaultValue={item.estimatedCost}
                      required
                    />
                  </PlannerField>
                  <PlannerField label="Phase">
                    <select
                      className={input}
                      name="phaseId"
                      defaultValue={phaseForItem(item, planning)?.id}
                    >
                      {metrics.phases.map((phase) => (
                        <option key={phase.id} value={phase.id}>
                          {phase.title}
                        </option>
                      ))}
                    </select>
                  </PlannerField>
                  <PlannerField label="Priority">
                    <select
                      className={input}
                      name="priority"
                      defaultValue={item.priority}
                    >
                      <option value="now">Now</option>
                      <option value="next">Next</option>
                      <option value="later">Later</option>
                    </select>
                  </PlannerField>
                  <PlannerField label="Target date">
                    <input
                      className={input}
                      type="date"
                      name="targetDate"
                      defaultValue={item.targetDate}
                    />
                  </PlannerField>
                  <div className="sm:col-span-2 lg:col-span-3">
                    <PlannerField label="Planning note">
                      <textarea
                        className={`${input} min-h-24 py-3`}
                        name="note"
                        defaultValue={item.note}
                        maxLength={300}
                      />
                    </PlannerField>
                  </div>
                  <fieldset className="sm:col-span-2 lg:col-span-3">
                    <legend className="text-xs text-white/50">
                      Must be installed first
                    </legend>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
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
                            <span>{candidate.title}</span>
                          </label>
                        ))}
                      {items.length === 1 && (
                        <span className="text-sm text-white/40">
                          Add another modification to create a dependency.
                        </span>
                      )}
                    </div>
                  </fieldset>
                  <button className={`${primaryAction} sm:justify-self-start`}>
                    Save modification plan
                  </button>
                </form>
              </details>
            );
          })}

          {items.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/15 p-6 text-sm text-white/45">
              No modifications yet. Add the first modification below to create
              the build sequence.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function PlannerField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-xs text-white/55">
      <span>{label}</span>
      {children}
    </label>
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
      className={`min-w-0 rounded-2xl border p-3 sm:p-4 ${warning ? "border-red-300/30" : "border-white/10"}`}
    >
      <p className="text-[10px] text-white/35 uppercase sm:text-xs">{label}</p>
      <p
        className={`mt-2 truncate text-lg font-medium sm:text-xl ${warning ? "text-red-200" : ""}`}
        title={value}
      >
        {value}
      </p>
      {detail && <p className="mt-1 text-xs text-white/45">{detail}</p>}
    </div>
  );
}

function PhaseStat({
  label,
  value,
  warning = false,
}: {
  label: string;
  value: string | number;
  warning?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs text-white/35">{label}</dt>
      <dd className={`mt-0.5 ${warning ? "text-amber-100" : "text-white/75"}`}>
        {value}
      </dd>
    </div>
  );
}
