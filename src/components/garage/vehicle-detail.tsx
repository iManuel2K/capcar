"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  Bot,
  CarFront,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  CircleGauge,
  ClipboardList,
  DatabaseZap,
  Fingerprint,
  GraduationCap,
  MapPin,
  Plus,
  Settings2,
  SquareActivity,
  Wrench,
} from "lucide-react";

import { VehicleArt } from "@/components/garage/vehicle-art";
import { useVehicles } from "@/features/vehicles/use-vehicles";

export function VehicleDetail({ vehicleId }: { vehicleId: string }) {
  const { vehicles, isReady } = useVehicles();
  const vehicle = vehicles.find((candidate) => candidate.id === vehicleId);

  if (!isReady)
    return (
      <div className="min-h-[600px] animate-pulse rounded-[2rem] border border-white/8 bg-white/[0.03]" />
    );

  if (!vehicle) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center text-center">
        <span className="grid size-14 place-items-center rounded-2xl border border-white/10 bg-white/5">
          <Wrench className="size-5 text-white/50" />
        </span>
        <h1 className="mt-6 text-3xl font-medium tracking-[-0.035em]">
          Vehicle not found
        </h1>
        <p className="mt-3 leading-7 text-white/45">
          This local vehicle may have been removed when browser data was
          cleared.
        </p>
        <Link
          href="/garage"
          className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#e72d45] px-5 text-sm font-semibold text-[#07101d]"
        >
          Return to garage <ArrowRight className="size-4" />
        </Link>
      </div>
    );
  }

  const title = `${vehicle.productionYear} ${vehicle.make} ${vehicle.model}`;

  return (
    <div className="pb-24 sm:pb-0">
      <Link
        href="/garage"
        className="mb-7 inline-flex items-center gap-2 text-sm text-white/45 transition hover:text-white"
      >
        <ArrowLeft className="size-4" /> All vehicles
      </Link>

      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#111111]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_35%,rgba(231,45,69,0.12),transparent_32%)]" />
        <div className="relative grid lg:grid-cols-[0.72fr_1.28fr]">
          <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
            <div className="flex items-center gap-2 text-xs tracking-[0.14em] text-[#ff667a] uppercase">
              <CheckCircle2 className="size-3.5" /> Vehicle profile ready
            </div>
            <p className="mt-10 text-sm text-white/35">
              {vehicle.nickname || `${vehicle.platform} ${vehicle.bodyStyle}`}
            </p>
            <h1 className="mt-2 text-4xl font-medium tracking-[-0.05em] sm:text-6xl">
              {title}
            </h1>
            <p className="mt-5 text-base text-white/50">
              {vehicle.color || "Color not recorded"} · {vehicle.engineCode} ·{" "}
              {vehicle.transmission}
            </p>
            <div className="mt-9 flex items-center gap-5">
              <div>
                <p className="text-3xl font-medium tracking-[-0.035em]">
                  {vehicle.mileage.toLocaleString("en-US")}
                </p>
                <p className="mt-1 text-xs tracking-[0.12em] text-white/30 uppercase">
                  kilometres
                </p>
              </div>
              <div className="h-12 w-px bg-white/10" />
              <div>
                <p className="text-3xl font-medium tracking-[-0.035em]">
                  {vehicle.platform}
                </p>
                <p className="mt-1 text-xs tracking-[0.12em] text-white/30 uppercase">
                  platform
                </p>
              </div>
            </div>
          </div>
          <div className="p-3 sm:p-5">
            <VehicleArt
              imageUrl={
                vehicle.imageUrl ??
                (vehicle.make === "BMW" && vehicle.model === "318i"
                  ? "/capcar-hero-bmw-garage.png"
                  : undefined)
              }
              label={title}
            />
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[1.75rem] border border-white/10 bg-[#111111] p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs tracking-[0.14em] text-white/35 uppercase">
                Next attention
              </p>
              <h2 className="mt-2 text-2xl font-medium tracking-[-0.025em]">
                Maintenance baseline
              </h2>
            </div>
            <span className="grid size-11 place-items-center rounded-2xl bg-amber-300/10 text-amber-200">
              <CalendarClock className="size-5" />
            </span>
          </div>
          <p className="mt-5 max-w-2xl leading-7 text-white/45">
            Review upcoming oil, fluid, filter, brake and inspection tasks for
            this exact garage profile.
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <ComingSoon icon={CircleGauge} label="Oil & fluids" />
            <ComingSoon icon={ClipboardList} label="Inspection list" />
            <ComingSoon icon={Wrench} label="Service records" />
          </div>
        </div>

        <div className="flex flex-col rounded-[1.75rem] border border-white/10 bg-[#111111] p-6 sm:p-8">
          <p className="text-xs tracking-[0.14em] text-white/35 uppercase">
            Project build
          </p>
          <h2 className="mt-2 text-2xl font-medium tracking-[-0.025em]">
            Shape it inside and out.
          </h2>
          <p className="mt-4 leading-7 text-white/45">
            Plan modifications in stages, preview exterior and interior
            concepts, and connect parts and offers to the roadmap.
          </p>
          <Link
            href={`/garage/${vehicleId}/builds`}
            className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white/60 hover:border-white/20 hover:text-white lg:mt-auto"
          >
            <Plus className="size-4" /> Open project builds
          </Link>
        </div>
      </section>

      <section className="relative mt-5 overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#111111] p-5 sm:p-8">
        <div className="pointer-events-none absolute -top-32 -left-20 size-72 rounded-full bg-[#e72d45]/8 blur-3xl" />
        <div className="relative flex flex-col gap-5 border-b border-white/8 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] text-[#ff667a] uppercase">
              <MapPin className="size-3.5" /> Garage profile
            </p>
            <h2 className="mt-2 text-2xl font-medium tracking-[-0.025em]">
              Vehicle identity
            </h2>
            <p className="mt-2 text-sm text-white/50">
              The specification used by parts, guides and build planning.
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/8 px-3 py-2 text-xs font-medium text-emerald-200">
            <CheckCircle2 className="size-3.5" /> Profile ready
          </span>
        </div>

        <dl className="relative mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <IdentityItem
            icon={CarFront}
            label="Body"
            value={vehicle.bodyStyle}
          />
          <IdentityItem
            icon={SquareActivity}
            label="Engine"
            value={vehicle.engineCode}
          />
          <IdentityItem
            icon={Settings2}
            label="Transmission"
            value={vehicle.transmission}
          />
          <IdentityItem
            icon={Fingerprint}
            label="VIN"
            muted={!vehicle.vin}
            value={
              vehicle.vin ? `••••••${vehicle.vin.slice(-5)}` : "Add VIN later"
            }
          />
        </dl>

        <div className="relative mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <ProfileLink
            href={`/garage/${vehicleId}/known-problems`}
            icon={CircleAlert}
            label="Known problems"
          />
          <ProfileLink
            href={`/garage/${vehicleId}/tuning`}
            icon={GraduationCap}
            label="Tuning academy"
          />
          <ProfileLink
            href={`/garage/${vehicleId}/copilot`}
            icon={Bot}
            label="Copilot"
          />
          <ProfileLink
            href={`/garage/${vehicleId}/guides`}
            icon={BookOpenCheck}
            label="Guides"
          />
          <ProfileLink
            href={`/garage/${vehicleId}/data-sources`}
            icon={DatabaseZap}
            label="Data sources"
          />
        </div>
      </section>
    </div>
  );
}

function ComingSoon({
  icon: Icon,
  label,
}: {
  icon: typeof CircleGauge;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.025] p-4 text-sm text-white/45">
      <Icon className="size-4" /> {label}
    </div>
  );
}

function IdentityItem({
  icon: Icon,
  label,
  value,
  muted = false,
}: {
  icon: typeof CarFront;
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.035] p-4 transition hover:border-white/15 hover:bg-white/[0.055]">
      <div className="flex items-center gap-3">
        <span
          className={`grid size-9 place-items-center rounded-xl ${muted ? "bg-amber-300/10 text-amber-200" : "bg-[#e72d45]/10 text-[#ff667a]"}`}
        >
          <Icon className="size-4" />
        </span>
        <div>
          <dt className="text-[10px] font-semibold tracking-[0.14em] text-white/40 uppercase">
            {label}
          </dt>
          <dd
            className={`mt-1 text-sm font-medium ${muted ? "text-amber-100/80" : "text-white/85"}`}
          >
            {value}
          </dd>
        </div>
      </div>
    </div>
  );
}

function ProfileLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof CarFront;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-12 items-center justify-between gap-3 rounded-xl border border-white/8 bg-[#0d0d0d] px-3.5 text-sm font-medium text-white/65 transition hover:border-[#e72d45]/35 hover:bg-[#e72d45]/8 hover:text-white"
    >
      <span className="flex items-center gap-2.5">
        <Icon className="size-4 text-[#ff667a]" /> {label}
      </span>
      <ArrowRight className="size-3.5 text-white/25 transition group-hover:translate-x-0.5 group-hover:text-[#ff667a]" />
    </Link>
  );
}
