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
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { Vehicle } from "@/features/vehicles/vehicle-schema";
import {
  carModels,
  matchCarModel,
} from "@/features/visualizer/car-model-catalog";
import { showroomCopy } from "@/features/garage/showroom-copy";
import { isAppLocale } from "@/i18n/config";
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
export function showroomPhoto(vehicle: Vehicle) {
  // Only replace the original, known showcase photos. Never replace an owner upload.
  if (!vehicle.photoDataUrl) {
    const cutouts: Record<string, string> = {
      "/models/cars/previews/bmw-m3-e30.webp":
        "/garage/cutouts/bmw-m3-e30.webp",
      "/models/cars/previews/nissan-gt-r.webp":
        "/garage/cutouts/nissan-gt-r.webp",
      "/models/cars/previews/toyota-supra-mk.webp":
        "/garage/cutouts/toyota-supra-mk.webp",
      "/capcar-bmw-current-side.webp": "/garage/cutouts/bmw-318i.webp",
      "/capcar-project-f150.png": "/garage/cutouts/ford-f150.webp",
      "/capcar-project-eclass.png": "/garage/cutouts/mercedes-e300.webp",
      "/capcar-project-gti-tcr.png": "/garage/cutouts/golf-gti.webp",
    };
    const original =
      vehicle.imageUrl ??
      (isProject318Vehicle(vehicle) && !vehicle.onboardingId
        ? "/capcar-bmw-current-side.webp"
        : "");
    if (cutouts[original]) return cutouts[original];
  }
  return photo(vehicle);
}
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
  const [playing, setPlaying] = useState(false);
  const rail = useRef<HTMLDivElement>(null);
  const index = Math.max(
    0,
    vehicles.findIndex((v) => v.id === selectedId),
  );
  const selected = vehicles[index];
  function select(nextIndex: number, focus = false) {
    const next = vehicles[(nextIndex + vehicles.length) % vehicles.length];
    if (!next) return;
    setPlaying(false);
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
  useEffect(() => {
    if (!playing) return;
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const stop = () => {
      if (media?.matches) setPlaying(false);
    };
    if (media?.matches) return;
    media?.addEventListener("change", stop);
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      setSelectedId((id) => {
        const current = Math.max(
          0,
          vehicles.findIndex((v) => v.id === id),
        );
        return vehicles[(current + 1) % vehicles.length]?.id ?? null;
      });
    }, 6500);
    return () => {
      window.clearInterval(timer);
      media?.removeEventListener("change", stop);
    };
  }, [playing, vehicles]);
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
    <div
      className={styles.showroom}
      onFocusCapture={(event) => {
        if (!(event.target as HTMLElement).closest("[data-showroom-play]"))
          setPlaying(false);
      }}
    >
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
          {vehicles.length > 1 && (
            <button
              type="button"
              data-showroom-play
              className={styles.play}
              aria-pressed={playing}
              onClick={() => {
                if (
                  !window.matchMedia?.("(prefers-reduced-motion: reduce)")
                    .matches
                )
                  setPlaying(!playing);
              }}
            >
              {playing ? c.pause : c.play}
            </button>
          )}
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
          previous={
            vehicles.length > 2
              ? vehicles[(index - 1 + vehicles.length) % vehicles.length]
              : undefined
          }
          next={
            vehicles.length > 1
              ? vehicles[(index + 1) % vehicles.length]
              : undefined
          }
          onInteract={() => setPlaying(false)}
          onSwipe={(direction) => select(index + direction)}
        />
        <div
          key={`details-${selected.id}`}
          className={`${styles.details} ${styles.arrival}`}
          onPointerDown={() => setPlaying(false)}
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
              {showroomPhoto(vehicle) ? (
                <Image
                  src={showroomPhoto(vehicle)!}
                  alt=""
                  fill
                  sizes="208px"
                  className="object-contain"
                />
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
  previous,
  next,
  copy: c,
  onSwipe,
  onInteract,
}: {
  vehicle: Vehicle;
  previous?: Vehicle;
  next?: Vehicle;
  copy: (typeof showroomCopy)["en"];
  onSwipe: (direction: number) => void;
  onInteract: () => void;
}) {
  const matchingModel = matchCarModel(vehicle);
  const [mode, setMode] = useState<"photo" | "model">(
    matchingModel ? "model" : "photo",
  );
  const [referenceId, setReferenceId] = useState(() => matchingModel?.id ?? "");
  const touch = useRef<{ x: number; y: number } | null>(null);
  const pointer = useRef<number | null>(null);
  const image = showroomPhoto(vehicle);
  const modelName = carModels.find((model) => model.id === referenceId)?.name;
  return (
    <div className={styles.visual} onPointerDown={onInteract}>
      <div className={styles.floatingViewport}>
        {(
          [
            [-1, previous],
            [1, next],
          ] as const
        ).map(
          ([direction, adjacent]) =>
            adjacent && (
              <button
                key={direction}
                type="button"
                className={`${styles.neighbour} ${direction < 0 ? styles.previousCar : styles.nextCar}`}
                aria-label={`${direction < 0 ? c.previous : c.next}: ${adjacent.make} ${adjacent.model}`}
                onClick={() => onSwipe(direction)}
              >
                <span className={styles.neighbourImage}>
                  {showroomPhoto(adjacent) ? (
                    <Image
                      src={showroomPhoto(adjacent)!}
                      alt=""
                      fill
                      sizes="(max-width: 600px) 22vw, 260px"
                      className="object-contain"
                    />
                  ) : (
                    <CarFront aria-hidden="true" />
                  )}
                </span>
                <span>
                  {adjacent.make} {adjacent.model}
                </span>
              </button>
            ),
        )}
        <div className={`${styles.heroCar} ${styles.arrival}`}>
          {mode === "model" && referenceId ? (
            <InteractiveModel
              key={referenceId}
              modelId={referenceId}
              autoStart
              autoRotate
              presentation="floating"
              posterUrl={matchingModel?.id === referenceId ? image : undefined}
              label={`${c.reference}: ${modelName}`}
            />
          ) : (
            <div
              className={styles.photo}
              role="img"
              aria-label={`${vehicle.productionYear} ${vehicle.make} ${vehicle.model}`}
              onPointerDown={(event) => {
                onInteract();
                if (event.pointerType === "mouse") {
                  pointer.current = event.clientX;
                  event.currentTarget.setPointerCapture?.(event.pointerId);
                }
              }}
              onPointerUp={(event) => {
                if (
                  pointer.current !== null &&
                  Math.abs(event.clientX - pointer.current) > 60
                )
                  onSwipe(event.clientX < pointer.current ? 1 : -1);
                pointer.current = null;
              }}
              onPointerCancel={() => {
                pointer.current = null;
              }}
              onTouchStart={(event) => {
                onInteract();
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
              {image ? (
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="(max-width: 600px) 90vw, 760px"
                  priority
                  className="object-contain"
                  draggable={false}
                />
              ) : (
                <CarFront className={styles.emptyCar} aria-hidden="true" />
              )}
            </div>
          )}
        </div>
      </div>
      <div
        className={styles.mode}
        role="group"
        aria-label={`${vehicle.make} ${vehicle.model} preview`}
      >
        <button
          type="button"
          aria-pressed={mode === "photo"}
          onClick={() => {
            onInteract();
            setMode("photo");
          }}
        >
          {c.photo}
        </button>
        <button
          type="button"
          aria-pressed={mode === "model"}
          onClick={() => {
            onInteract();
            setMode("model");
          }}
        >
          {c.model}
        </button>
      </div>
      <p className={styles.visualHint}>
        {mode === "model" && referenceId ? c.modelHint : c.photoHint}
      </p>
      {mode === "model" && (
        <>
          {!matchingModel && <p className={styles.visualHint}>{c.noModel}</p>}
          <details className={styles.referencePicker} open={!referenceId}>
            <summary>{modelName ?? c.reference}</summary>
            <label className={styles.referenceLabel}>
              {c.reference}
              <select
                className={styles.referenceSelect}
                value={referenceId}
                onChange={(event) => {
                  onInteract();
                  setReferenceId(event.target.value);
                }}
              >
                <option value="">{c.reference}</option>
                {carModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </label>
            <p className={styles.visualHint}>{c.referenceHint}</p>
          </details>
        </>
      )}
    </div>
  );
}
