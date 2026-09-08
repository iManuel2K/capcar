"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useState, type KeyboardEvent, type PointerEvent } from "react";

import { CapcarWordmark } from "@/components/brand/capcar-wordmark";

const heroImages = {
  current: {
    desktop: "/capcar-hero-bmw-garage.png",
    mobile: "/capcar-hero-bmw-garage-mobile.png",
  },
  vision: {
    desktop: "/capcar-hero-bmw-vision.png",
    mobile: "/capcar-hero-bmw-vision-mobile.png",
  },
} as const;

export function MarketingHero() {
  const [reveal, setReveal] = useState(52);

  function updateFromPointer(event: PointerEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const nextReveal = ((event.clientX - bounds.left) / bounds.width) * 100;
    setReveal(Math.min(100, Math.max(0, nextReveal)));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setReveal((current) => Math.max(0, current - 2));
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      setReveal((current) => Math.min(100, current + 2));
    }
    if (event.key === "Home") {
      event.preventDefault();
      setReveal(0);
    }
    if (event.key === "End") {
      event.preventDefault();
      setReveal(100);
    }
  }

  return (
    <section className="bg-[#e8e6d7] pb-2 sm:pb-4 lg:pb-6">
      <header className="mx-auto flex h-18 w-full max-w-[1500px] items-center justify-between px-5 text-[#0e2d30] sm:h-20 sm:px-8">
        <Link
          href="/"
          aria-label="Capcar home"
          className="rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6d0101]"
        >
          <CapcarWordmark glow={false} />
        </Link>
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-8 text-sm text-[#0e2d30]/62 md:flex"
        >
          <a className="transition hover:text-[#6d0101]" href="#platform">
            Platform
          </a>
          <a className="transition hover:text-[#6d0101]" href="#projects">
            Projects
          </a>
          <a className="transition hover:text-[#6d0101]" href="#fitment">
            Fitment
          </a>
          <a className="transition hover:text-[#6d0101]" href="#roadmap">
            Roadmap
          </a>
        </nav>
        <Link
          href="/register"
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#0e2d30] px-4 text-sm font-medium text-[#e8e6d7] transition hover:-translate-y-0.5 hover:bg-[#6d0101]"
        >
          Build your car <ArrowRight className="size-4" />
        </Link>
      </header>

      <div className="relative mx-2 min-h-[calc(100svh-5.5rem)] overflow-hidden rounded-[1.75rem] bg-[#050306] text-[#e8e6d7] shadow-[0_24px_80px_rgba(5,3,6,0.22)] sm:mx-4 sm:min-h-[calc(100svh-6rem)] sm:rounded-[2.5rem] lg:mx-6">
        <HeroPicture mode="current" priority />
        <div
          aria-hidden="true"
          className="absolute inset-0 will-change-[clip-path]"
          style={{ clipPath: `inset(0 0 0 ${reveal}%)` }}
        >
          <HeroPicture mode="vision" />
        </div>

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,5,0.94)_0%,rgba(5,5,5,0.72)_34%,rgba(5,5,5,0.12)_67%,rgba(5,5,5,0.03)_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,rgba(5,5,5,0.9)_0%,transparent_48%,rgba(5,5,5,0.42)_100%)]" />

        <div
          role="slider"
          tabIndex={0}
          aria-label="Compare current car with vision"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(reveal)}
          aria-valuetext={`${Math.round(reveal)} percent current, ${Math.round(100 - reveal)} percent vision`}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            updateFromPointer(event);
          }}
          onPointerMove={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              updateFromPointer(event);
            }
          }}
          onPointerUp={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              event.currentTarget.releasePointerCapture(event.pointerId);
            }
          }}
          onKeyDown={handleKeyDown}
          className="absolute inset-0 z-[7] cursor-ew-resize touch-none focus-visible:outline-none"
        >
          <span className="pointer-events-none absolute top-4 left-5 rounded-full border border-white/12 bg-black/38 px-3 py-1.5 text-[11px] font-semibold tracking-[0.12em] text-white/60 uppercase backdrop-blur-xl sm:left-8">
            Current
          </span>
          <span className="pointer-events-none absolute top-4 right-5 rounded-full border border-[#92644d]/35 bg-black/38 px-3 py-1.5 text-[11px] font-semibold tracking-[0.12em] text-[#bf8269] uppercase backdrop-blur-xl sm:right-8">
            Vision
          </span>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 w-px bg-[#6d0101]/80 shadow-[0_0_12px_rgba(109,1,1,0.45)]"
            style={{ left: `${reveal}%` }}
          >
            <span className="absolute top-[58%] left-1/2 grid size-9 -translate-x-1/2 place-items-center rounded-full border border-white/35 bg-[#6d0101] shadow-[0_8px_22px_rgba(109,1,1,0.3)] sm:size-10">
              <span className="h-3.5 w-px bg-white/75 shadow-[4px_0_0_rgba(255,255,255,0.75),-4px_0_0_rgba(255,255,255,0.75)]" />
            </span>
          </span>
        </div>

        <div className="pointer-events-none relative z-10 mx-auto flex min-h-[calc(100svh-5.5rem)] w-full max-w-[1500px] flex-col justify-start px-5 pt-18 pb-12 sm:min-h-[calc(100svh-6rem)] sm:justify-center sm:px-8 sm:pt-12 sm:pb-20">
          <div className="max-w-[790px]">
            <p className="text-xs font-semibold tracking-[0.2em] text-[#bf8269] uppercase">
              Your project-car workspace
            </p>
            <h1 className="mt-5 text-[clamp(3rem,14vw,8.5rem)] leading-[0.86] font-medium tracking-[-0.072em] text-balance sm:mt-6 sm:text-[clamp(3.7rem,8.2vw,8.5rem)] sm:leading-[0.84]">
              Build the car
              <span className="mt-2 block text-white/44">you planned.</span>
            </h1>
            <p className="mt-[22px] max-w-xl text-base leading-6 text-white/60 sm:mt-[30px] sm:text-lg sm:leading-7">
              Visualize upgrades, verify fitment, compare total cost and keep
              every install in one garage.
            </p>
            <div className="pointer-events-auto absolute right-5 bottom-6 left-5 flex flex-col gap-3 sm:static sm:mt-7 sm:flex-row sm:items-center">
              <Link
                href="/register"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#6d0101] px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#830705]"
              >
                Open your garage <ArrowRight className="size-4" />
              </Link>
              <a
                href="#live-demo"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/16 bg-black/28 px-6 text-sm font-medium text-white/78 backdrop-blur-xl transition hover:border-white/30 hover:text-white"
              >
                Live demo
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroPicture({
  mode,
  priority = false,
}: {
  mode: keyof typeof heroImages;
  priority?: boolean;
}) {
  return (
    <div className="absolute inset-0">
      <Image
        src={heroImages[mode].desktop}
        alt=""
        fill
        priority={priority}
        sizes="100vw"
        className="hidden scale-[1.015] object-cover object-center motion-safe:animate-[capcar-hero-drift_16s_ease-in-out_infinite_alternate] sm:block"
      />
      <Image
        src={heroImages[mode].mobile}
        alt=""
        fill
        priority={priority}
        sizes="100vw"
        className="scale-[1.015] object-cover object-center motion-safe:animate-[capcar-hero-drift_16s_ease-in-out_infinite_alternate] sm:hidden"
      />
    </div>
  );
}
