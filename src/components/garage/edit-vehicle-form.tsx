"use client";

import Link from "next/link";
import { ArrowLeft, Wrench } from "lucide-react";

import { AddVehicleForm } from "@/components/garage/add-vehicle-form";
import { useVehicles } from "@/features/vehicles/use-vehicles";

export function EditVehicleForm({ vehicleId }: { vehicleId: string }) {
  const { vehicles, isReady } = useVehicles();
  const vehicle = vehicles.find((candidate) => candidate.id === vehicleId);

  if (!isReady) {
    return (
      <div className="min-h-[600px] animate-pulse rounded-[2rem] border border-white/8 bg-white/[0.03]" />
    );
  }

  if (!vehicle) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center text-center">
        <Wrench className="size-6 text-white/50" />
        <h1 className="mt-6 text-3xl font-medium">Vehicle not found</h1>
        <Link
          href="/garage"
          className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#e72d45] px-5 text-sm font-semibold text-[#07101d]"
        >
          <ArrowLeft className="size-4" /> Return to garage
        </Link>
      </div>
    );
  }

  return <AddVehicleForm vehicle={vehicle} />;
}
