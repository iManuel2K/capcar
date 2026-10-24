"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const FitmentLookup = dynamic(
  () =>
    import("@/components/marketing/fitment-lookup").then(
      (module) => module.FitmentLookup,
    ),
  { ssr: false },
);

function useNearViewport<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [nearViewport, setNearViewport] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || nearViewport) return;

    const Observer = globalThis.IntersectionObserver;
    if (typeof Observer === "undefined") {
      const fallback = setTimeout(() => setNearViewport(true), 0);
      return () => clearTimeout(fallback);
    }

    const observer = new Observer(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setNearViewport(true);
        observer.disconnect();
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [nearViewport]);

  return { nearViewport, ref };
}

export function DeferredFitmentLookup() {
  const { nearViewport, ref } = useNearViewport<HTMLDivElement>();

  return (
    <div ref={ref} className="min-h-[560px]">
      {nearViewport ? (
        <FitmentLookup />
      ) : (
        <div
          aria-hidden="true"
          className="min-h-[560px] animate-pulse rounded-[1.6rem] border border-black/15 bg-[#050306]/92 shadow-[0_30px_100px_rgba(40,0,7,0.2)] motion-reduce:animate-none sm:rounded-[2rem]"
        />
      )}
    </div>
  );
}
