"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CarFront, Database, ShieldCheck } from "lucide-react";

import { GarageShowroom } from "./garage-showroom";
import { VehicleArt } from "@/components/garage/vehicle-art";
import { useVehicles } from "@/features/vehicles/use-vehicles";
import {
  announceVehicleChange,
  saveVehicle,
} from "@/features/vehicles/vehicle-storage";

export function GarageOverview() {
  const { vehicles, isReady } = useVehicles();
  const router = useRouter();

  function loadDemo() {
    const existingDemo = vehicles.find(
      (vehicle) => vehicle.model === "318i" && vehicle.demoProject,
    );
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
        demoProject: true,
        imageUrl: "/capcar-bmw-current-side.webp",
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
          <p className="text-primary mb-3 text-xs font-semibold tracking-[0.16em] uppercase">
            Your garage
          </p>
          <h1 className="text-4xl font-medium tracking-[-0.045em] text-balance sm:text-6xl">
            Start with the car you know.
          </h1>
          <p className="text-muted-foreground mt-5 max-w-xl text-base leading-7 sm:text-lg">
            Your exact vehicle becomes the center of maintenance, compatible
            parts, build plans and every installation that follows.
          </p>
        </div>

        <Link
          href="/studio"
          className="mb-6 inline-flex min-h-11 items-center gap-3 text-sm underline"
        >
          Explore showcase builds{" "}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
        <section className="bg-background grid overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_28px_80px_rgba(0,0,0,.18)] lg:grid-cols-[1.12fr_0.88fr]">
          <VehicleArt label="your future project car" />
          <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
            <span className="bg-primary/16 text-primary grid size-11 place-items-center rounded-2xl">
              <CarFront className="size-5" />
            </span>
            <h2 className="mt-7 text-2xl font-medium tracking-[-0.025em]">
              Add your first car
            </h2>
            <p className="text-muted-foreground mt-3 leading-7">
              It takes about one minute. VIN is optional for this prototype, and
              your garage is saved to your private CapCar account.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/garage/new"
                className="bg-primary text-primary-foreground hover:bg-primary inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold shadow-[0_12px_30px_rgba(184,199,217,.2)] transition hover:-translate-y-0.5"
              >
                Add your car <ArrowRight className="size-4" />
              </Link>
              <button
                onClick={loadDemo}
                type="button"
                className="hover:text-foreground inline-flex min-h-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-5 text-sm font-medium text-white/75 transition hover:bg-white/[0.08]"
              >
                Load demo 318i
              </button>
            </div>
            <div className="text-muted-foreground mt-9 grid gap-3 text-xs sm:grid-cols-2">
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
      <GarageShowroom vehicles={vehicles} />
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
