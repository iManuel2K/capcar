"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Cuboid,
  DatabaseZap,
  KeyRound,
  PackageSearch,
  RefreshCw,
  ServerCog,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";
import { MotionLoader as LoaderCircle } from "@/components/ui/motion-loader";
import { useState, useSyncExternalStore } from "react";

import type {
  ProviderStatus,
  ResolvedVehicleData,
} from "@/features/providers/provider-contracts";
import {
  announceVehicleResolutionChange,
  saveVehicleResolution,
} from "@/features/vehicle-data/vehicle-resolution-storage";
import { useVehicleResolutions } from "@/features/vehicle-data/use-vehicle-resolutions";
import { useVehicles } from "@/features/vehicles/use-vehicles";

const domainIcons: Record<ProviderStatus["domain"], LucideIcon> = {
  vehicle: DatabaseZap,
  catalog: PackageSearch,
  offers: ShoppingBag,
  models: Cuboid,
};

export function DataSourcesDashboard({
  vehicleId,
  statuses,
}: {
  vehicleId: string;
  statuses: ProviderStatus[];
}) {
  const hydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const { vehicles } = useVehicles();
  const resolutions = useVehicleResolutions();
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState("");
  const vehicle = vehicles.find((candidate) => candidate.id === vehicleId);
  const resolution = resolutions.find(
    (candidate) => candidate.vehicleId === vehicleId,
  );

  if (!hydrated)
    return (
      <div className="min-h-[700px] animate-pulse rounded-[2rem] bg-white/[0.04]" />
    );
  if (!vehicle)
    return (
      <div className="text-muted-foreground py-32 text-center">
        Vehicle not found.
      </div>
    );

  async function resolveVehicle() {
    if (!vehicle) return;
    setResolving(true);
    setError("");
    try {
      const response = await fetch("/api/vehicle-data/resolve", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          vin: vehicle.vin,
          make: vehicle.make,
          model: vehicle.model,
          productionYear: vehicle.productionYear,
          platform: vehicle.platform,
          bodyStyle: vehicle.bodyStyle,
          engineCode: vehicle.engineCode,
          transmission: vehicle.transmission,
        }),
      });
      const body = (await response.json()) as
        ResolvedVehicleData | { error?: string };
      if (!response.ok || "error" in body)
        throw new Error(
          "error" in body && body.error
            ? body.error
            : "Vehicle resolution failed.",
        );
      saveVehicleResolution(vehicle.id, body, window.localStorage);
      announceVehicleResolutionChange();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Vehicle resolution failed.",
      );
    } finally {
      setResolving(false);
    }
  }

  return (
    <div className="pb-24 sm:pb-0">
      <Link
        href={`/garage/${vehicleId}`}
        className="text-muted-foreground hover:text-foreground mb-7 inline-flex items-center gap-2 text-sm"
      >
        <ArrowLeft className="size-4" /> Vehicle overview
      </Link>

      <header className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_85%_12%,rgba(184,199,217,0.2),transparent_30%),#111111] p-6 sm:p-10">
        <p className="text-primary text-xs font-semibold tracking-[0.15em] uppercase">
          Vehicle data foundation
        </p>
        <h1 className="mt-4 max-w-4xl text-4xl font-medium tracking-[-0.05em] sm:text-6xl">
          Know the exact car behind the badge.
        </h1>
        <p className="text-muted-foreground mt-5 max-w-2xl leading-7">
          Vehicle identity, catalogue records, offers and 3D assets use separate
          server-side provider contracts. Every resolved field keeps its source
          and verification state.
        </p>
      </header>

      <section className="mt-5 grid gap-4 lg:grid-cols-3">
        {statuses.map((status) => {
          const Icon = domainIcons[status.domain];
          return (
            <article
              key={status.domain}
              className="bg-card rounded-[2rem] border border-white/10 p-6"
            >
              <div className="flex items-center justify-between">
                <span className="bg-primary/10 text-primary grid size-11 place-items-center rounded-xl">
                  <Icon className="size-5" />
                </span>
                <span
                  className={`rounded-full border px-2.5 py-1 text-[10px] uppercase ${status.mode === "demo" ? "border-amber-300/20 bg-amber-300/8 text-amber-100/65" : status.configured ? "border-emerald-300/20 bg-emerald-300/8 text-emerald-200" : "border-red-300/20 bg-red-300/8 text-red-200"}`}
                >
                  {status.mode}
                </span>
              </div>
              <p className="text-muted-foreground mt-7 text-xs tracking-[0.12em] uppercase">
                {status.label}
              </p>
              <h2 className="mt-2 text-xl font-medium">
                {status.providerName}
              </h2>
              <p className="text-muted-foreground mt-3 text-sm leading-6">
                {status.message}
              </p>
            </article>
          );
        })}
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <article className="bg-card rounded-[2rem] border border-white/10 p-6 sm:p-8">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-muted-foreground text-xs tracking-[0.14em] uppercase">
                Vehicle / VIN identity
              </p>
              <h2 className="mt-2 text-2xl font-medium">
                Resolve the current profile
              </h2>
            </div>
            {resolution && <CheckCircle2 className="size-5 text-emerald-200" />}
          </div>
          <p className="text-muted-foreground mt-4 text-sm leading-6">
            Demo resolution normalizes what you entered. A licensed adapter can
            later return build date, manufacturer type code, market, drivetrain
            details, paint and factory option codes without changing this
            screen.
          </p>
          <button
            type="button"
            disabled={resolving}
            onClick={resolveVehicle}
            className="bg-primary text-primary-foreground mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl px-5 text-sm font-semibold disabled:opacity-50"
          >
            {resolving ? (
              <LoaderCircle className="size-4" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            {resolution ? "Resolve identity again" : "Resolve vehicle identity"}
          </button>
          {error && (
            <p className="mt-4 flex items-start gap-2 text-sm text-red-200/75">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" /> {error}
            </p>
          )}
          {resolution && (
            <div className="mt-7 rounded-2xl border border-white/8 bg-black/10 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-medium">
                  {resolution.identity.productionYear}{" "}
                  {resolution.identity.make} {resolution.identity.model}
                </p>
                <span className="text-muted-foreground rounded-full border border-white/10 px-2.5 py-1 text-[10px] uppercase">
                  {resolution.confidence}
                </span>
              </div>
              <p className="text-muted-foreground mt-2 text-sm">
                {resolution.identity.platform} ·{" "}
                {resolution.identity.engineCode} ·{" "}
                {resolution.identity.bodyStyle}
              </p>
              <dl className="mt-5 grid gap-2 sm:grid-cols-2">
                <IdentityField
                  label="VIN state"
                  value={resolution.bmwIdentity.vinStatus}
                />
                <IdentityField
                  label="Build date"
                  value={
                    resolution.bmwIdentity.productionDate ?? "Not resolved"
                  }
                />
                <IdentityField
                  label="Manufacturer type code"
                  value={resolution.bmwIdentity.typeCode ?? "Not resolved"}
                />
                <IdentityField
                  label="Market"
                  value={resolution.bmwIdentity.market ?? "Not resolved"}
                />
                <IdentityField
                  label="Factory options"
                  value={
                    resolution.bmwIdentity.optionCodes.length > 0
                      ? `${resolution.bmwIdentity.optionCodes.length} codes`
                      : "Not resolved"
                  }
                />
                <IdentityField
                  label="Verified fields"
                  value={`${resolution.fieldSources.filter((field) => field.verified).length} / ${resolution.fieldSources.length}`}
                />
              </dl>
              <ul className="mt-5 space-y-2">
                {resolution.evidence.map((item) => (
                  <li
                    key={item}
                    className="text-muted-foreground flex gap-2 text-xs leading-5"
                  >
                    <Check className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </article>

        <aside className="bg-card rounded-[2rem] border border-white/10 p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <ServerCog className="text-primary size-5" />
            <h2 className="text-xl font-medium">Activate later</h2>
          </div>
          <p className="text-muted-foreground mt-4 text-sm leading-6">
            Provider keys remain on the server and never enter browser code.
            Each source can be activated independently.
          </p>
          <ol className="mt-6 space-y-4">
            <ActivationStep number="1" text="Choose and license a provider." />
            <ActivationStep
              number="2"
              text="Add its adapter endpoint and API key."
            />
            <ActivationStep
              number="3"
              text="Switch only that provider to external mode."
            />
          </ol>
          <div className="text-muted-foreground mt-7 flex items-start gap-3 rounded-2xl border border-amber-300/15 bg-amber-300/6 p-4 text-xs leading-5">
            <KeyRound className="mt-0.5 size-4 shrink-0 text-amber-200" />
            Never prefix provider secrets with NEXT_PUBLIC_.
          </div>
        </aside>
      </section>
    </div>
  );
}

function ActivationStep({ number, text }: { number: string; text: string }) {
  return (
    <li className="text-muted-foreground flex items-center gap-3 text-sm">
      <span className="text-muted-foreground grid size-8 shrink-0 place-items-center rounded-lg border border-white/10 text-xs">
        {number}
      </span>
      {text}
    </li>
  );
}

function IdentityField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/8 p-3">
      <dt className="text-muted-foreground text-[10px] tracking-[0.1em] uppercase">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-white/60">{value}</dd>
    </div>
  );
}
