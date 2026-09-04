"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  CircleGauge,
  ClipboardList,
  MapPin,
  Plus,
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
          className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#74a7ff] px-5 text-sm font-semibold text-[#07101d]"
        >
          Return to garage <ArrowRight className="size-4" />
        </Link>
      </div>
    );
  }

  const title = `${vehicle.productionYear} BMW ${vehicle.model}`;

  return (
    <div className="pb-24 sm:pb-0">
      <Link
        href="/garage"
        className="mb-7 inline-flex items-center gap-2 text-sm text-white/45 transition hover:text-white"
      >
        <ArrowLeft className="size-4" /> All vehicles
      </Link>

      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#111512]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_35%,rgba(116,167,255,0.12),transparent_32%)]" />
        <div className="relative grid lg:grid-cols-[0.72fr_1.28fr]">
          <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
            <div className="flex items-center gap-2 text-xs tracking-[0.14em] text-[#8ab7ff] uppercase">
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
            <VehicleArt label={title} />
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[1.75rem] border border-white/10 bg-[#111512] p-6 sm:p-8">
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
            Epic 05 will turn your mileage and service history into oil, fluid,
            filter, brake and inspection tasks.
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <ComingSoon icon={CircleGauge} label="Oil & fluids" />
            <ComingSoon icon={ClipboardList} label="Inspection list" />
            <ComingSoon icon={Wrench} label="Service records" />
          </div>
        </div>

        <div className="flex flex-col rounded-[1.75rem] border border-white/10 bg-[#111512] p-6 sm:p-8">
          <p className="text-xs tracking-[0.14em] text-white/35 uppercase">
            Project build
          </p>
          <h2 className="mt-2 text-2xl font-medium tracking-[-0.025em]">
            Shape what comes next.
          </h2>
          <p className="mt-4 leading-7 text-white/45">
            Build planning, real parts and stage budgets arrive in Epic 06.
          </p>
          <button
            disabled
            className="mt-8 inline-flex min-h-12 cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white/35 lg:mt-auto"
          >
            <Plus className="size-4" /> Create a build · coming soon
          </button>
        </div>
      </section>

      <section className="mt-5 rounded-[1.75rem] border border-white/10 bg-[#111512] p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <MapPin className="size-4 text-[#8ab7ff]" />
          <h2 className="font-medium">Vehicle identity</h2>
        </div>
        <dl className="mt-6 grid gap-px overflow-hidden rounded-2xl bg-white/8 sm:grid-cols-2 lg:grid-cols-4">
          <IdentityItem label="Body" value={vehicle.bodyStyle} />
          <IdentityItem label="Engine" value={vehicle.engineCode} />
          <IdentityItem label="Transmission" value={vehicle.transmission} />
          <IdentityItem
            label="VIN"
            value={
              vehicle.vin ? `••••••${vehicle.vin.slice(-5)}` : "Not provided"
            }
          />
        </dl>
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

function IdentityItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#111512] p-4">
      <dt className="text-[11px] tracking-[0.12em] text-white/30 uppercase">
        {label}
      </dt>
      <dd className="mt-2 text-sm text-white/70">{value}</dd>
    </div>
  );
}
