"use client";

import { useId, useState } from "react";
import { useLocale } from "next-intl";
import { isAppLocale } from "@/i18n/config";
import type { Vehicle } from "@/features/vehicles/vehicle-schema";
import { profileCopy } from "@/features/garage/profile-copy";
import {
  exampleVehicleProfile,
  neutralProfile,
  profileMetrics,
  radarPoint,
  radarPolygon,
  vehicleProfileSchema,
  type VehicleProfile,
} from "@/features/vehicles/vehicle-profile";
import {
  announceVehicleChange,
  readVehicles,
  updateVehicle,
} from "@/features/vehicles/vehicle-storage";
import { useVehicles } from "@/features/vehicles/use-vehicles";
import styles from "./garage-showroom.module.css";

export function VehicleRadar({
  vehicle,
  readOnly = false,
}: {
  vehicle: Vehicle;
  readOnly?: boolean;
}) {
  const locale = useLocale();
  const c = profileCopy[isAppLocale(locale) ? locale : "en"];
  const id = useId();
  const example = exampleVehicleProfile(vehicle);
  const { vehicles } = useVehicles();
  const stored = vehicles.find((entry) => entry.id === vehicle.id);
  const owner = readOnly
    ? undefined
    : stored
      ? stored.profileRatings
      : vehicle.profileRatings;
  const saved = owner ?? example;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<VehicleProfile>(saved ?? neutralProfile);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const profile = editing ? draft : saved;
  function persist(value: VehicleProfile | undefined) {
    try {
      const current = readVehicles(localStorage).find(
        (entry) => entry.id === vehicle.id,
      );
      if (!current) throw new Error("Vehicle unavailable");
      updateVehicle(
        vehicle.id,
        { ...current, profileRatings: value },
        localStorage,
      );
      setEditing(false);
      setError("");
      setMessage(c.saved);
      announceVehicleChange();
    } catch {
      setError(c.error);
    }
  }
  return (
    <section className={styles.radar} aria-labelledby={`${id}-title`}>
      <div className={styles.profileHeader}>
        <h3 id={`${id}-title`}>{c.title}</h3>
        <span>
          {editing ? c.unsaved : owner ? c.owner : example ? c.example : "1–10"}
        </span>
      </div>
      <svg
        viewBox="-28 -10 376 352"
        role="img"
        aria-labelledby={`${id}-chart-title ${id}-description`}
        className={styles.radarSvg}
      >
        <title id={`${id}-chart-title`}>
          {vehicle.make} {vehicle.model} · {c.title}
        </title>
        <desc id={`${id}-description`}>
          {c.hint}{" "}
          {profile
            ? profileMetrics
                .map((metric) => `${c.metrics[metric]} ${profile[metric]}/10`)
                .join("; ")
            : c.empty}
        </desc>
        {[2, 4, 6, 8, 10].map((level) => (
          <polygon
            key={level}
            points={profileMetrics
              .map((_, index) => radarPoint(index, level).join(","))
              .join(" ")}
            fill="none"
            stroke="currentColor"
            opacity={level === 10 ? 0.23 : 0.12}
          />
        ))}
        {profileMetrics.map((metric, index) => {
          const [x, y] = radarPoint(index, 10);
          const [lx, ly] = radarPoint(index, 10, 133);
          return (
            <g key={metric}>
              <line
                x1="160"
                y1="160"
                x2={x}
                y2={y}
                stroke="currentColor"
                opacity=".14"
              />
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                className={styles.axisLabel}
              >
                {c.metrics[metric]}
              </text>
              {profile && (
                <text
                  x={lx}
                  y={ly + 14}
                  textAnchor="middle"
                  className={styles.axisScore}
                >
                  {profile[metric]} / 10
                </text>
              )}
            </g>
          );
        })}
        {profile && (
          <>
            <polygon
              key={vehicle.id}
              points={radarPolygon(profile)}
              fill="var(--rust, #d6aa92)"
              fillOpacity=".22"
              stroke="var(--rust, #d6aa92)"
              strokeWidth="2"
              strokeLinejoin="round"
              className={styles.radarShape}
            />
            {profileMetrics.map((metric, index) => {
              const [x, y] = radarPoint(index, profile[metric]);
              return (
                <circle
                  key={metric}
                  cx={x}
                  cy={y}
                  r="3.6"
                  fill="var(--rust, #d6aa92)"
                >
                  <title>
                    {c.metrics[metric]}: {profile[metric]}/10
                  </title>
                </circle>
              );
            })}
          </>
        )}
        {!profile && (
          <text
            x="160"
            y="165"
            textAnchor="middle"
            className={styles.axisScore}
          >
            —
          </text>
        )}
      </svg>
      <p className={styles.profileHint}>{profile ? c.hint : c.empty}</p>
      {!readOnly &&
        (editing ? (
          <form
            className={styles.ratingEditor}
            onSubmit={(event) => {
              event.preventDefault();
              persist(vehicleProfileSchema.parse(draft));
            }}
          >
            {profileMetrics.map((metric) => (
              <label key={metric} htmlFor={`${id}-${metric}`}>
                <span>{c.metrics[metric]}</span>
                <output htmlFor={`${id}-${metric}`}>
                  {draft[metric]} / 10
                </output>
                <input
                  id={`${id}-${metric}`}
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={draft[metric]}
                  onChange={(event) =>
                    setDraft({ ...draft, [metric]: Number(event.target.value) })
                  }
                />
              </label>
            ))}
            <div className={styles.ratingActions}>
              <button type="submit">{c.save}</button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setError("");
                }}
              >
                {c.cancel}
              </button>
            </div>
          </form>
        ) : (
          <div className={styles.ratingActions}>
            <button
              type="button"
              onClick={() => {
                setDraft(saved ?? neutralProfile);
                setEditing(true);
                setMessage("");
                setError("");
              }}
            >
              {saved ? c.adjust : c.edit} <span aria-hidden="true">↗</span>
            </button>
            {owner && (
              <button type="button" onClick={() => persist(undefined)}>
                {c.reset}
              </button>
            )}
          </div>
        ))}
      {message && (
        <p role="status" className={styles.profileHint}>
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className={styles.profileHint}>
          {error}
        </p>
      )}
    </section>
  );
}
