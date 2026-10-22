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
    <div className="bg-background absolute inset-0 overflow-hidden">
      <Image
        src={reference.previewImage}
        alt={`Static side preview of ${reference.title}`}
        fill
        sizes="(max-width: 1024px) 100vw, 1200px"
        className="object-cover opacity-35"
      />
      <div className="from-background via-background/72 to-background/35 absolute inset-0 bg-gradient-to-t" />
      <div className="relative flex h-full items-end p-5 sm:p-8">
        <div className="bg-card/92 max-w-xl rounded-[1.5rem] border border-white/12 p-5 shadow-2xl backdrop-blur-xl sm:p-6">
          <span className="bg-primary/12 text-primary grid size-10 place-items-center rounded-xl">
            <ShieldOff className="size-4" />
          </span>
          <h3 className="mt-4 text-xl font-medium">3D viewer was blocked</h3>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            An ad blocker, Brave Shields or a privacy extension may have stopped
            the Sketchfab connection. Temporarily allow Sketchfab for CapCar,
            then retry. The static vehicle preview remains available here.
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="bg-primary text-primary-foreground hover:bg-primary-hover mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition hover:-translate-y-0.5"
          >
            <RefreshCw className="size-4" /> Retry 3D viewer
          </button>
        </div>
      </div>
    </div>
  );
}
