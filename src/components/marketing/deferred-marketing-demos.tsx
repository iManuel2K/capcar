"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const ProductDashboardPreview = dynamic(
  () =>
    import("@/components/marketing/product-dashboard-preview").then(
      (module) => module.ProductDashboardPreview,
    ),
  { ssr: false },
);

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

export function DeferredProductDashboardPreview({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action: string;
}) {
  const { nearViewport, ref } = useNearViewport<HTMLDivElement>();

  return (
    <div ref={ref} className="min-h-[760px]">
      {nearViewport ? (
        <ProductDashboardPreview />
      ) : (
        <section
          id="live-demo"
          aria-labelledby="deferred-demo-title"
          className="scroll-mt-6 bg-[#e8e6d7] px-5 py-16 text-[#0e2d30] sm:px-8 sm:py-24"
        >
          <div className="mx-auto max-w-[1440px]">
            <p className="text-xs font-semibold tracking-[0.15em] text-[#80533e] uppercase">
              {eyebrow}
            </p>
            <h2
              id="deferred-demo-title"
              className="mt-4 max-w-4xl text-4xl leading-[1.02] font-medium tracking-[-0.045em] sm:text-6xl"
            >
              {title}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#405856]">
              {description}
            </p>
            <Link
              href="/register"
              className="mt-7 inline-flex min-h-12 items-center rounded-full bg-[#0e2d30] px-5 text-sm font-semibold text-[#f5f2e8]"
            >
              {action}
            </Link>
            <div
              aria-hidden="true"
              className="mt-10 min-h-[390px] animate-pulse rounded-[1.6rem] bg-[#0b2326]/12 motion-reduce:animate-none"
            />
          </div>
        </section>
      )}
    </div>
  );
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
