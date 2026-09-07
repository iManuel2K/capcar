"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { useState } from "react";

import { CapcarWordmark } from "@/components/brand/capcar-wordmark";

type PreviewMode = "current" | "vision";

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
  const [mode, setMode] = useState<PreviewMode>("current");

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#080808] text-[#f3f1ec]">
      {(Object.keys(heroImages) as PreviewMode[]).map((imageMode) => {
        const active = mode === imageMode;

        return (
          <div
            key={imageMode}
            aria-hidden={!active}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              active ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={heroImages[imageMode].desktop}
              alt=""
              fill
              priority={imageMode === "current"}
              sizes="100vw"
              className="hidden scale-[1.015] object-cover object-center motion-safe:animate-[capcar-hero-drift_16s_ease-in-out_infinite_alternate] sm:block"
            />
            <Image
              src={heroImages[imageMode].mobile}
              alt=""
              fill
              priority={imageMode === "current"}
              sizes="100vw"
              className="scale-[1.015] object-cover object-center motion-safe:animate-[capcar-hero-drift_16s_ease-in-out_infinite_alternate] sm:hidden"
            />
          </div>
        );
      })}

      <p className="sr-only" aria-live="polite">
        {mode === "current"
          ? "Current black BMW E90 in a private garage."
          : "Planned BMW E90 build with lowered suspension, subtle body trim and red brake calipers."}
      </p>

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,5,0.94)_0%,rgba(5,5,5,0.72)_34%,rgba(5,5,5,0.12)_67%,rgba(5,5,5,0.03)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(5,5,5,0.9)_0%,transparent_48%,rgba(5,5,5,0.42)_100%)]" />

      <header className="relative z-20 mx-auto flex h-20 w-full max-w-[1500px] items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          aria-label="Capcar home"
          className="rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e72d45]"
        >
          <CapcarWordmark />
        </Link>
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-8 text-sm text-white/56 md:flex"
        >
          <a className="transition hover:text-white" href="#platform">
            Platform
          </a>
          <a className="transition hover:text-white" href="#fitment">
            Fitment
          </a>
          <a className="transition hover:text-white" href="#process">
            Process
          </a>
        </nav>
        <Link
          href="/garage"
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/16 bg-black/30 px-4 text-sm font-medium text-white backdrop-blur-xl transition hover:border-[#e72d45]/60 hover:bg-[#e72d45]"
        >
          Open garage <ArrowRight className="size-4" />
        </Link>
      </header>

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-5rem)] w-full max-w-[1500px] flex-col justify-start px-5 pt-10 pb-12 sm:justify-center sm:px-8 sm:pt-12 sm:pb-20">
        <div className="max-w-[790px]">
          <p className="text-xs font-semibold tracking-[0.2em] text-[#ff667a] uppercase">
            Plan. Source. Build.
          </p>
          <h1 className="mt-5 text-[clamp(3rem,14vw,8.5rem)] leading-[0.86] font-medium tracking-[-0.072em] text-balance sm:mt-6 sm:text-[clamp(3.7rem,8.2vw,8.5rem)] sm:leading-[0.84]">
            Build with clarity.
            <span className="mt-2 block text-white/44">
              Drive with confidence.
            </span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-6 text-white/58 sm:mt-7 sm:text-lg sm:leading-7">
            Your car, parts and projects. One place.
          </p>

          <div className="mt-6 flex flex-row gap-2 sm:mt-8 sm:gap-3">
            <Link
              href="/garage"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#e72d45] px-5 text-sm font-semibold text-white shadow-[0_18px_55px_rgba(231,45,69,0.24)] transition hover:-translate-y-0.5 hover:bg-[#f43f57] sm:min-h-13 sm:px-6"
            >
              Open Capcar <ArrowRight className="size-4" />
            </Link>
            <a
              href="#platform"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/16 bg-black/25 px-5 text-sm text-white/72 backdrop-blur-xl transition hover:bg-white/10 sm:min-h-13 sm:px-6"
            >
              Explore <ArrowDown className="size-4" />
            </a>
          </div>

          <div className="mt-5 inline-flex items-center gap-1 rounded-full border border-white/12 bg-black/38 p-1 backdrop-blur-xl sm:mt-8">
            {(["current", "vision"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={mode === option}
                onClick={() => setMode(option)}
                className={`min-h-9 rounded-full px-4 text-xs font-semibold tracking-[0.11em] uppercase transition sm:min-h-10 sm:px-5 ${
                  mode === option
                    ? "bg-[#e72d45] text-white shadow-[0_8px_24px_rgba(231,45,69,0.25)]"
                    : "text-white/48 hover:text-white"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
