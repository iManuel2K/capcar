"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CarFront,
  Database,
  Plus,
  ShieldCheck,
} from "lucide-react";

import { VehicleArt } from "@/components/garage/vehicle-art";
import { isProject318Vehicle } from "@/components/garage/vehicle-photo-gallery";
import { useVehicles } from "@/features/vehicles/use-vehicles";
import {
  announceVehicleChange,
  saveVehicle,
} from "@/features/vehicles/vehicle-storage";

export function GarageOverview() {
  const { vehicles, isReady } = useVehicles();
  const router = useRouter();

  function loadDemo() {
    const existingDemo = vehicles.find((vehicle) => vehicle.model === "318i");
    if (existingDemo) {
      router.push(`/garage/${existingDemo.id}`);
      return;
    }

    const vehicle = saveVehicle(
      {
        make: "BMW",
        model: "318i",
        productionYear: 2011,
        platform: "E90",
        bodyStyle: "Sedan",
        engineCode: "N43B20",
        transmission: "Manual",
        mileage: 148200,
        color: "Space Grey",
        nickname: "Project 318",
      },
      window.localStorage,
    );
    announceVehicleChange();
    router.push(`/garage/${vehicle.id}`);
  }

  if (!isReady) return <GarageSkeleton />;

  if (vehicles.length === 0) {
    return (
      <div className="pb-24 sm:pb-0">
        <div className="mb-10 max-w-2xl">
          <p className="mb-3 text-xs font-semibold tracking-[0.16em] text-[#ff667a] uppercase">
            Your garage
          </p>
          <h1 className="text-4xl font-medium tracking-[-0.045em] text-balance sm:text-6xl">
            Start with the car you know.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/55 sm:text-lg">
            Your exact vehicle becomes the center of maintenance, compatible
            parts, build plans and every installation that follows.
          </p>
        </div>

        <section className="grid overflow-hidden rounded-[2rem] border border-white/10 bg-[#111111] lg:grid-cols-[1.12fr_0.88fr]">
          <VehicleArt label="your future project car" />
          <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
            <span className="grid size-11 place-items-center rounded-2xl bg-[#e72d45] text-[#07101d]">
              <CarFront className="size-5" />
            </span>
            <h2 className="mt-7 text-2xl font-medium tracking-[-0.025em]">
              Add your first car
            </h2>
            <p className="mt-3 leading-7 text-white/50">
              It takes about one minute. VIN is optional for this prototype, and
              your garage is saved to your private Capcar account.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/garage/new"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#e72d45] px-5 text-sm font-semibold text-[#07101d] transition hover:-translate-y-0.5 hover:bg-[#ff667a]"
              >
                Add your car <ArrowRight className="size-4" />
              </Link>
              <button
                onClick={loadDemo}
                type="button"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-5 text-sm font-medium text-white/75 transition hover:bg-white/[0.08] hover:text-white"
              >
                Load demo 318i
              </button>
            </div>
            <div className="mt-9 grid gap-3 text-xs text-white/45 sm:grid-cols-2">
              <span className="flex items-center gap-2">
                <Database className="size-3.5" /> Private garage sync
              </span>
              <span className="flex items-center gap-2">
                <ShieldCheck className="size-3.5" /> Protected by your account
              </span>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="pb-24 sm:pb-0">
      <div className="mb-8 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <p className="mb-3 text-xs font-semibold tracking-[0.16em] text-[#ff667a] uppercase">
            Your garage
          </p>
          <h1 className="text-4xl font-medium tracking-[-0.045em] sm:text-6xl">
            {vehicles.length === 1
              ? "One car. One story."
              : `${vehicles.length} cars. One garage.`}
          </h1>
        </div>
        <Link
          href="/garage/new"
          className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl bg-[#e72d45] px-4 text-sm font-semibold text-[#07101d] sm:self-auto"
        >
          <Plus className="size-4" /> Add vehicle
        </Link>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {vehicles.map((vehicle) => (
          <Link
            key={vehicle.id}
            href={`/garage/${vehicle.id}`}
            className="group overflow-hidden rounded-[2rem] border border-white/10 bg-[#111111] transition hover:-translate-y-1 hover:border-white/20"
          >
            <VehicleArt
              label={`${vehicle.productionYear} ${vehicle.make} ${vehicle.model}`}
              compact
              badge={isProject318Vehicle(vehicle) ? "Current vehicle" : undefined}
              imageUrl={
                isProject318Vehicle(vehicle)
                  ? "/capcar-bmw-current-side.webp"
                  : vehicle.imageUrl
              }
            />
            <div className="flex items-end justify-between gap-5 p-6 sm:p-7">
              <div>
                <p className="mb-2 text-xs tracking-[0.14em] text-white/40 uppercase">
                  {vehicle.nickname ||
                    `${vehicle.platform} ${vehicle.bodyStyle}`}
                </p>
                <h2 className="text-2xl font-medium tracking-[-0.025em]">
                  {vehicle.productionYear} {vehicle.make} {vehicle.model}
                </h2>
                <p className="mt-2 text-sm text-white/45">
                  {vehicle.engineCode} · {vehicle.transmission} ·{" "}
                  {vehicle.mileage.toLocaleString("en-US")} km
                </p>
                {vehicle.demoProject && (
                  <span className="mt-4 inline-flex rounded-full border border-[#e72d45]/25 bg-[#e72d45]/10 px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] text-[#ff8796] uppercase">
                    Demo project
                  </span>
                )}
              </div>
              <span className="grid size-11 shrink-0 place-items-center rounded-full border border-white/10 text-white/60 transition group-hover:bg-[#e72d45] group-hover:text-[#07101d]">
                <ArrowRight className="size-4" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function GarageSkeleton() {
  return (
    <div aria-label="Loading garage" className="animate-pulse">
      <div className="h-4 w-28 rounded bg-white/10" />
      <div className="mt-5 h-14 max-w-xl rounded-xl bg-white/10" />
      <div className="mt-10 min-h-[520px] rounded-[2rem] border border-white/8 bg-white/[0.03]" />
    </div>
  );
}
