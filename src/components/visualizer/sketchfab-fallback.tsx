import { RefreshCw, ShieldOff } from "lucide-react";
import Image from "next/image";

import type { VehicleReference } from "@/features/visualizer/vehicle-reference-catalog";

export function SketchfabFallback({
  reference,
  onRetry,
}: {
  reference: VehicleReference;
  onRetry: () => void;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0b0e0c]">
      <Image
        src={reference.previewImage}
        alt={`Static side preview of ${reference.title}`}
        fill
        sizes="(max-width: 1024px) 100vw, 1200px"
        className="object-cover opacity-35"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-[#090909]/72 to-[#090909]/35" />
      <div className="relative flex h-full items-end p-5 sm:p-8">
        <div className="max-w-xl rounded-[1.5rem] border border-white/12 bg-[#0e1211]/92 p-5 shadow-2xl backdrop-blur-xl sm:p-6">
          <span className="grid size-10 place-items-center rounded-xl bg-[#e72d45]/12 text-[#ff667a]">
            <ShieldOff className="size-4" />
          </span>
          <h3 className="mt-4 text-xl font-medium">3D viewer was blocked</h3>
          <p className="mt-2 text-sm leading-6 text-white/55">
            An ad blocker, Brave Shields or a privacy extension may have stopped
            the Sketchfab connection. Temporarily allow Sketchfab for CapCar,
            then retry. The static vehicle preview remains available here.
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#e72d45] px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#ff526a]"
          >
            <RefreshCw className="size-4" /> Retry 3D viewer
          </button>
        </div>
      </div>
    </div>
  );
}
