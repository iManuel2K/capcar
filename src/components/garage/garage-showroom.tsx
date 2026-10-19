"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useLocale } from "next-intl";
import {
  ArrowRight,
  CarFront,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import type { Vehicle } from "@/features/vehicles/vehicle-schema";
import {
  carModels,
  matchCarModel,
} from "@/features/visualizer/car-model-catalog";
import { showroomCopy } from "@/features/garage/showroom-copy";
import { isAppLocale } from "@/i18n/config";
import { VehicleArt } from "./vehicle-art";
import { isProject318Vehicle } from "./vehicle-photo-gallery";
import { VehicleRadar } from "./vehicle-radar";
import { profileCopy } from "@/features/garage/profile-copy";
import { VehicleOverviewSummary } from "./vehicle-overview-summary";
import { GarageGoalPanel } from "./garage-goal-panel";
import styles from "./garage-showroom.module.css";

const InteractiveModel = dynamic(
  () =>
    import("../visualizer/interactive-car-model").then(
      (m) => m.InteractiveCarModel,
    ),
  { ssr: false },
);
function photo(vehicle: Vehicle) {
  return (
    vehicle.photoDataUrl ??
    (isProject318Vehicle(vehicle) && !vehicle.onboardingId
      ? "/capcar-bmw-current-side.webp"
      : vehicle.imageUrl)
  );
}
const linkClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-medium transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d6aa92]";

export function GarageShowroom({
  vehicles,
  readOnly = false,
}: {
  vehicles: Vehicle[];
  readOnly?: boolean;
}) {
  const requestedLocale = useLocale();
  const c = showroomCopy[isAppLocale(requestedLocale) ? requestedLocale : "en"];
  const profileText =
    profileCopy[isAppLocale(requestedLocale) ? requestedLocale : "en"];
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const rail = useRef<HTMLDivElement>(null);
  const index = Math.max(
    0,
    vehicles.findIndex((v) => v.id === selectedId),
  );
  const selected = vehicles[index];
  function select(nextIndex: number, focus = false) {
    const next = vehicles[(nextIndex + vehicles.length) % vehicles.length];
    if (!next) return;
    setSelectedId(next.id);
    const button = rail.current?.querySelector<HTMLButtonElement>(
      `[data-vehicle-index="${(nextIndex + vehicles.length) % vehicles.length}"]`,
    );
    if (focus) button?.focus({ preventScroll: true });
    const strip = rail.current;
    if (button && strip) {
      const stripBounds = strip.getBoundingClientRect();
      const itemBounds = button.getBoundingClientRect();
      strip.scrollTo?.({
        left:
          strip.scrollLeft +
          itemBounds.left -
          stripBounds.left -
          (strip.clientWidth - button.offsetWidth) / 2,
        behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)")
          .matches
          ? "instant"
          : "smooth",
      });
    }
  }
  function navigate(event: KeyboardEvent, position: number) {
    const next =
      event.key === "ArrowRight"
        ? position + 1
        : event.key === "ArrowLeft"
          ? position - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? vehicles.length - 1
              : null;
    if (next !== null) {
      event.preventDefault();
      select(next, true);
    }
  }
  if (!selected) return null;
  return (
    <div className={styles.showroom}>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className={styles.eyebrow}>
            {c.garage} · {vehicles.length}
          </p>
          <h1 className={styles.headline}>{c.title}</h1>
          <p className={styles.intro}>{c.hint}</p>
        </div>
        {!readOnly && (
          <Link href="/garage/new" className={`${linkClass} ${styles.action}`}>
            <Plus className="size-4" />
            {c.add}
          </Link>
        )}
      </div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className={styles.collectionLabel}>{c.collection}</p>
        <div className={styles.controls}>
          <span
            className="mr-2 font-mono text-xs text-[#d6aa92]"
            aria-hidden="true"
          >
            {String(index + 1).padStart(2, "0")} /{" "}
            {String(vehicles.length).padStart(2, "0")}
          </span>
          <button
            type="button"
            className={styles.arrow}
            aria-label={c.previous}
            disabled={vehicles.length < 2}
            onClick={() => select(index - 1)}
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            className={styles.arrow}
            aria-label={c.next}
            disabled={vehicles.length < 2}
            onClick={() => select(index + 1)}
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
      <section className={styles.stage} aria-label={c.selected}>
        <SelectedVehicle
          key={selected.id}
          vehicle={selected}
          copy={c}
          onSwipe={(direction) => select(index + direction)}
        />
        <div
          key={`details-${selected.id}`}
          className={`${styles.details} ${styles.arrival}`}
        >
          <p className="sr-only" role="status" aria-live="polite">
            {selected.productionYear} {selected.make} {selected.model}
          </p>
          <div className={styles.identity}>
            <p>
              {selected.make} / {selected.productionYear}
            </p>
            <h2>{selected.model}</h2>
            <span>
              {selected.platform} · {selected.transmission}
            </span>
          </div>
          <VehicleRadar
            key={`profile-${selected.id}`}
            vehicle={selected}
            readOnly={readOnly}
          />
          {!readOnly && (
            <>
              {" "}
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  className={`${linkClass} ${styles.action} ${styles.primaryAction}`}
                  href={`/garage/${selected.id}`}
                >
                  {c.open}
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  className={`${linkClass} ${styles.action}`}
                  href={`/garage/${selected.id}/builds`}
                >
                  {c.build}
                </Link>
                <Link
                  className={`${linkClass} ${styles.action}`}
                  href={`/garage/${selected.id}/maintenance`}
                >
                  {c.maintenance}
                </Link>
              </div>
              <details className={styles.workshop}>
                <summary>{profileText.workshop}</summary>
                <VehicleOverviewSummary vehicle={selected} />
              </details>
            </>
          )}
        </div>
      </section>
      <div
        ref={rail}
        className={styles.rail}
        role="group"
        aria-label={c.collection}
      >
        {vehicles.map((vehicle, position) => (
          <button
            key={vehicle.id}
            data-vehicle-index={position}
            type="button"
            className={styles.car}
            aria-pressed={vehicle.id === selected.id}
            aria-label={`${vehicle.productionYear} ${vehicle.make} ${vehicle.model}`}
            onClick={() => select(position)}
            onKeyDown={(event) => navigate(event, position)}
          >
            <div className={styles.thumb}>
              {photo(vehicle) ? (
                <Image src={photo(vehicle)!} alt="" fill sizes="208px" />
              ) : (
                <span className="grid h-full place-items-center text-[#d6aa92]">
                  <CarFront className="size-14" />
                </span>
              )}
            </div>
            <div className={styles.carLabel}>
              <p className="text-sm font-medium">
                {vehicle.make} {vehicle.model}
              </p>
              <p className={styles.carYear}>
                {vehicle.productionYear} · {vehicle.platform}
              </p>
            </div>
          </button>
        ))}
      </div>
      {!readOnly && selected.garageGoal && (
        <div className={styles.darkContent}>
          <GarageGoalPanel key={`goal-${selected.id}`} vehicle={selected} />
        </div>
      )}
      <Link href="/studio" className={styles.studioLink}>
        {c.studio}
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
function SelectedVehicle({
  vehicle,
  copy: c,
  onSwipe,
}: {
  vehicle: Vehicle;
  copy: (typeof showroomCopy)["en"];
  onSwipe: (direction: number) => void;
}) {
  const orbitId = useId();
  const [mode, setMode] = useState<"photo" | "model">("photo");
  const [referenceId, setReferenceId] = useState(
    () => matchCarModel(vehicle)?.id ?? "",
  );
  const touch = useRef<{ x: number; y: number } | null>(null);
  return (
    <div className={`${styles.visual} ${styles.arrival}`}>
      <svg
        className={styles.orbitText}
        viewBox="0 0 400 400"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <path
            id={orbitId}
            d="M 200,200 m -170,0 a 170,170 0 1,1 340,0 a 170,170 0 1,1 -340,0"
          />
        </defs>
        <text>
          <textPath
            href={`#${orbitId}`}
            textLength="1065"
            lengthAdjust="spacing"
          >
            {`${vehicle.make} · ${vehicle.model} · ${vehicle.productionYear} · `.repeat(
              3,
            )}
          </textPath>
        </text>
      </svg>
      <div
        className={styles.mode}
        role="group"
        aria-label={`${vehicle.make} ${vehicle.model} preview`}
      >
        <button
          type="button"
          aria-pressed={mode === "photo"}
          onClick={() => setMode("photo")}
        >
          {c.photo}
        </button>
        <button
          type="button"
          aria-pressed={mode === "model"}
          onClick={() => setMode("model")}
        >
          {c.model}
        </button>
      </div>
      {mode === "photo" ? (
        <>
          <div
            className={styles.photo}
            onPointerMove={(event) => {
              if (event.pointerType !== "mouse") return;
              const bounds = event.currentTarget.getBoundingClientRect();
              event.currentTarget.style.setProperty(
                "--tilt",
                `${((event.clientX - bounds.left) / bounds.width - 0.5) * 5}deg`,
              );
            }}
            onPointerLeave={(event) =>
              event.currentTarget.style.setProperty("--tilt", "0deg")
            }
            onTouchStart={(event) => {
              const point = event.touches[0];
              touch.current = point
                ? { x: point.clientX, y: point.clientY }
                : null;
            }}
            onTouchEnd={(event) => {
              const point = event.changedTouches[0];
              const start = touch.current;
              touch.current = null;
              if (
                point &&
                start &&
                Math.abs(point.clientX - start.x) > 60 &&
                Math.abs(point.clientX - start.x) >
                  Math.abs(point.clientY - start.y) * 1.5
              )
                onSwipe(point.clientX < start.x ? 1 : -1);
            }}
            onTouchCancel={() => {
              touch.current = null;
            }}
          >
            <VehicleArt
              label={`${vehicle.productionYear} ${vehicle.make} ${vehicle.model}`}
              imageUrl={photo(vehicle)}
              badge={c.selected}
            />
          </div>
          <p className={styles.visualHint}>{c.photoHint}</p>
        </>
      ) : (
        <>
          {!matchCarModel(vehicle) && (
            <p className={styles.visualHint}>{c.noModel}</p>
          )}
          <label className={styles.referenceLabel}>
            {c.reference}
            <select
              className="mt-2 min-h-11 w-full rounded-xl border border-white/20 bg-[#102629] px-3 text-sm text-white"
              value={referenceId}
              onChange={(event) => setReferenceId(event.target.value)}
            >
              <option value="">{c.reference}</option>
              {carModels.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </label>
          {referenceId && (
            <div className="rounded-2xl bg-[#e8e6d7] p-3 text-[#0e2d30] sm:p-4">
              <InteractiveModel
                key={referenceId}
                modelId={referenceId}
                autoStart
                autoRotate
                label={`${c.reference}: ${carModels.find((model) => model.id === referenceId)?.name}`}
              />
            </div>
          )}
          <p className={styles.visualHint}>{c.referenceHint}</p>
        </>
      )}
    </div>
  );
}
