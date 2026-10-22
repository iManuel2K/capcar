"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import type { Vehicle } from "@/features/vehicles/vehicle-schema";
import {
  announceVehicleChange,
  updateVehicle,
} from "@/features/vehicles/vehicle-storage";
import {
  ONBOARDING_EVENT,
  ONBOARDING_KEY,
  readOnboarding,
} from "@/features/onboarding/onboarding";
import { useGarageCopy } from "@/features/onboarding/use-garage-copy";

function subscribe(listener: () => void) {
  window.addEventListener(ONBOARDING_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(ONBOARDING_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}
export function GarageGoalPanel({ vehicle }: { vehicle: Vehicle }) {
  const c = useGarageCopy();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(ONBOARDING_KEY),
    () => null,
  );
  const record =
    typeof window === "undefined"
      ? undefined
      : readOnboarding(localStorage).find(
          (entry) =>
            entry.vehicleId === vehicle.id && entry.goal === vehicle.garageGoal,
        );
  const goal = vehicle.garageGoal;
  const savedPlan = record?.destination?.startsWith(
    `/garage/${vehicle.id}/builds/`,
  )
    ? record.destination
    : undefined;
  const link =
    savedPlan ??
    (record?.activatedAt && goal !== "drives"
      ? `/garage/${vehicle.id}/${goal === "maintain" ? "maintenance" : "builds"}`
      : `/garage/new?vehicle=${encodeURIComponent(vehicle.id)}`);
  return (
    <section className="border-primary/25 bg-card mb-6 rounded-3xl border p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-primary text-xs tracking-wider">{c.mainAction}</p>
          <h2 className="mt-2 text-2xl">{goal ? c[goal] : c.goalTitle}</h2>
          <p className="mt-3 text-sm text-white/70">
            {goal ? c[`${goal}Hint`] : c.noAction}
          </p>
        </div>
        <button
          className="min-h-11 px-3 text-sm underline"
          type="button"
          onClick={() => setEditing(!editing)}
        >
          {c.changeGoal}
        </button>
      </div>
      {editing && (
        <div className="mt-4 flex flex-wrap gap-3">
          {(["maintain", "modify", "drives"] as const).map((value) => (
            <button
              className={`min-h-12 rounded-xl border px-4 text-sm ${goal === value ? "border-primary bg-primary/10" : "border-white/20"}`}
              key={value}
              type="button"
              onClick={() => {
                try {
                  updateVehicle(
                    vehicle.id,
                    { ...vehicle, garageGoal: value },
                    localStorage,
                  );
                  announceVehicleChange();
                  setEditing(false);
                  setError("");
                } catch {
                  setError(c.error);
                }
              }}
            >
              {c[value]}
            </button>
          ))}
        </div>
      )}
      {record?.driveIdea && (
        <div className="mt-4 rounded-xl border border-white/10 p-4">
          <p className="text-xs text-white/60">{c.driveSaved}</p>
          <p className="mt-2 text-sm">{record.driveIdea}</p>
        </div>
      )}
      <Link
        href={goal === "drives" && record?.driveIdea ? "/ai" : link}
        className="bg-background text-foreground mt-5 inline-flex min-h-12 items-center gap-3 rounded-xl px-5 text-sm font-medium"
      >
        {savedPlan && goal !== "drives"
          ? c.viewPlan
          : goal === "maintain"
            ? c.maintainAction
            : goal === "modify"
              ? c.modifyAction
              : goal === "drives"
                ? c.planDrive
                : c.continue}
        <ArrowRight className="size-4" />
      </Link>
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-200">
          {error}
        </p>
      )}
    </section>
  );
}
