"use client";

import { ArrowUpRight, BadgeInfo, Rotate3D } from "lucide-react";
import { useEffect, useState } from "react";

import { SketchfabFallback } from "@/components/visualizer/sketchfab-fallback";
import type { VehicleReference } from "@/features/visualizer/vehicle-reference-catalog";

export function SketchfabReferenceStage({
  reference,
}: {
  reference: VehicleReference;
}) {
  const [status, setStatus] = useState<"loading" | "ready" | "blocked">(
    "loading",
  );
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const timeout = window.setTimeout(
      () => setStatus((current) => (current === "ready" ? current : "blocked")),
      10_000,
    );
    const detectBlock = (event: ErrorEvent | PromiseRejectionEvent) => {
      const value = "reason" in event ? event.reason : event.message;
      const message =
        value instanceof Error ? value.message : String(value ?? "");
      if (
        /ERR_BLOCKED_BY_CLIENT|extension (?:context )?disconnected|Sketchfab/i.test(
          message,
        )
      )
        setStatus("blocked");
    };
    window.addEventListener("error", detectBlock);
    window.addEventListener("unhandledrejection", detectBlock);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("error", detectBlock);
      window.removeEventListener("unhandledrejection", detectBlock);
    };
  }, [retryKey]);

  function retry() {
    setStatus("loading");
    setRetryKey((value) => value + 1);
  }

  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#090909] shadow-[0_24px_80px_rgba(0,0,0,0.34)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 bg-[#0e1211] px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2 text-sm text-white/65">
          <Rotate3D className="size-4 text-[#ff667a]" />
          <span>
            {reference.title} · {reference.yearLabel}
          </span>
        </div>
        <span className="rounded-full border border-[#e72d45]/20 bg-[#e72d45]/10 px-3 py-1 text-xs text-[#ff8a9a]">
          Interactive 3D reference
        </span>
      </div>
      <div className="relative aspect-[16/10] min-h-[430px] w-full bg-[radial-gradient(circle_at_50%_28%,rgba(231,45,69,0.18)_0%,rgba(19,31,38,0.72)_32%,#090909_72%)] sm:min-h-[560px]">
        <iframe
          key={retryKey}
          title={`${reference.title} ${reference.yearLabel} 3D reference`}
          src={reference.embedUrl}
          allow="autoplay; fullscreen; xr-spatial-tracking"
          allowFullScreen
          loading="eager"
          onLoad={() => setStatus("ready")}
          onError={() => setStatus("blocked")}
          className={`absolute inset-0 h-full w-full border-0 transition-opacity duration-300 ${status === "ready" ? "opacity-100" : "opacity-0"}`}
        />
        {status === "loading" && (
          <div className="absolute inset-0 grid place-items-center text-sm text-white/40">
            Connecting to the 3D viewer…
          </div>
        )}
        {status === "blocked" && (
          <SketchfabFallback reference={reference} onRetry={retry} />
        )}
      </div>
      <footer className="flex flex-col gap-3 border-t border-white/8 bg-[#0e1211] px-4 py-4 text-xs leading-5 text-white/40 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p className="flex max-w-xl items-start gap-2">
          <BadgeInfo className="mt-0.5 size-3.5 shrink-0 text-[#ff667a]" />
          Reference model only. Year, facelift details, equipment and installed
          parts may differ from your vehicle.
        </p>
        <p className="shrink-0 rounded-full border border-white/8 bg-white/[0.025] px-3 py-1.5">
          <a
            href={reference.sourceUrl}
            target="_blank"
            rel="noreferrer nofollow"
            className="text-[#ff667a] hover:text-white"
          >
            {reference.title}
          </a>
          {" by "}
          <a
            href={reference.creatorUrl}
            target="_blank"
            rel="noreferrer nofollow"
            className="text-[#ff667a] hover:text-white"
          >
            {reference.creator}
          </a>
          {" on Sketchfab "}
          <ArrowUpRight className="inline size-3" />
        </p>
      </footer>
    </section>
  );
}
