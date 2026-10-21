"use client";

import Image from "next/image";
import { VideoModal } from "@/components/ui/video-modal";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Clapperboard, Rotate3D, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { iconicCars } from "@/features/visualizer/iconic-cars";
import { InteractiveCarModel } from "./interactive-car-model";
import { ReferenceConfigurator } from "./reference-configurator";

/** Use the publisher's preview directly, never a generic or AI-generated car. */
function ScreenImage({
  image,
  alt,
  hero = false,
}: {
  image: string;
  alt: string;
  hero?: boolean;
}) {
  const [fallback, setFallback] = useState(false);
  const youtube = image.startsWith("https://i.ytimg.com/");
  const source = youtube
    ? image.replace(
        "maxresdefault",
        hero && !fallback ? "maxresdefault" : "hqdefault",
      )
    : `${image}?width=${hero ? 1280 : 480}&quality=80`;
  const [failed, setFailed] = useState(false);
  if (failed)
    return (
      <div
        className="absolute inset-0 flex items-center justify-center bg-[#142b2d]"
        role="img"
        aria-label={alt}
      >
        <Clapperboard aria-hidden="true" className="size-12 text-white/30" />
      </div>
    );
  return (
    <Image
      src={source}
      data-screen-image="true"
      alt={alt}
      fill
      unoptimized
      loading={hero ? "eager" : "lazy"}
      sizes={
        hero
          ? "(max-width: 768px) 100vw, 1200px"
          : "(max-width: 640px) 240px, 400px"
      }
      className="object-contain"
      onError={() => {
        if (youtube && hero && !fallback) setFallback(true);
        else setFailed(true);
      }}
    />
  );
}

export function IconicGallery() {
  const t = useTranslations("StudioUi");
  const s = useTranslations("StudioPolish");
  const g = useTranslations("MovieGallery");
  const [selected, setSelected] = useState(0);
  const [workspace, setWorkspace] = useState(false);
  const car = iconicCars[selected];
  const clipUrl = `https://www.youtube.com/watch?v=${car.videoId}`;
  return (
    <section
      aria-label={g("collection")}
      className="overflow-hidden rounded-[2rem] border border-[#0e2d30]/15 bg-[#091c1f] text-[#e8e6d7] shadow-[0_24px_70px_rgba(14,45,48,.16)]"
    >
      <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-7">
        <p className="flex items-center gap-2 text-[10px] font-semibold tracking-[.2em] uppercase">
          <Clapperboard className="size-4 text-[#cfaa96]" aria-hidden="true" />
          {g("collection")}
        </p>
        <span className="text-xs text-[#e8e6d7]/65">0{selected + 1} / 03</span>
      </div>
      <div
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto p-4 sm:grid sm:grid-cols-3 sm:p-6"
        aria-label={s("chooseCar")}
      >
        {iconicCars.map((item, index) => (
          <button
            type="button"
            key={item.slug}
            aria-pressed={selected === index}
            aria-label={item.name}
            onClick={() => {
              setSelected(index);
              setWorkspace(false);
            }}
            className={`group relative min-w-[240px] flex-[0_0_78%] snap-start overflow-hidden rounded-2xl border text-left transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e8e6d7] motion-reduce:transition-none sm:min-w-0 ${selected === index ? "border-[#cfaa96] ring-1 ring-[#cfaa96]/40" : "border-white/15 hover:border-white/50"}`}
          >
            <span className="relative block aspect-[16/8] sm:aspect-[16/10]">
              <ScreenImage
                image={item.image}
                alt={g(`${item.story}.imageAlt`)}
              />
            </span>
            <span className="block border-t border-white/15 p-4">
              <span className="block text-[10px] tracking-[.1em] text-[#e8e6d7]/75 uppercase">
                {item.production} · {item.year}
              </span>
              <span className="mt-1 block text-xl font-medium tracking-tight">
                {g(`${item.story}.title`)}
              </span>
            </span>
          </button>
        ))}
      </div>
      <div className="px-4 pb-4 sm:px-6 sm:pb-6">
        <div className="relative isolate overflow-hidden rounded-2xl bg-[#041416]">
          <div className="relative aspect-[16/10] sm:aspect-[16/8]">
            <ScreenImage
              key={car.videoId}
              image={car.image}
              alt={g(`${car.story}.imageAlt`)}
              hero
            />
          </div>
          <div className="flex items-center justify-between gap-3 px-5 pt-5 text-[#c8d4cb] sm:px-7">
            <span className="text-xs">
              {g(car.kind === "tvReference" ? "television" : "film")} ·{" "}
              {car.year}
            </span>
            <span className="text-xs">{g("screenImage")}</span>
          </div>
          <div className="relative px-5 py-6 sm:px-7">
            <p
              className="text-xs font-semibold tracking-[.2em] uppercase"
              style={{ color: car.accent }}
            >
              {car.production}
            </p>
            <h2 className="mt-3 max-w-3xl text-4xl leading-[1.02] font-medium tracking-[-.04em] sm:text-6xl">
              {g(`${car.story}.title`)}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-[#e8e6d7]/90">
              {g(`${car.story}.hook`)}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <VideoModal
                key={car.videoId}
                src={clipUrl}
                title={car.production}
                trigger={g("watchScene")}
              />
              <button
                type="button"
                aria-expanded={workspace}
                aria-controls="movie-model-workspace"
                onClick={() => setWorkspace((open) => !open)}
                className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/35 bg-black/35 px-5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                <Rotate3D className="size-4" aria-hidden="true" />
                {workspace ? g("closeModel") : g("exploreModel")}
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-1 pt-4 text-[11px] leading-5 text-[#e8e6d7]/65">
          <a
            href={car.imageSourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4"
          >
            {g("imageSource")} · {car.publisher} ↗
          </a>
          <p>{g("imageNotice")}</p>
        </div>
      </div>
      <div className="grid gap-6 border-t border-white/10 px-5 py-7 sm:px-8 lg:grid-cols-[1.25fr_1fr]">
        <div>
          <p className="text-[10px] font-semibold tracking-[.18em] text-[#cfaa96] uppercase">
            {g("whyItStays")}
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#e8e6d7]/85">
            {g(`${car.story}.story`)}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[.035] p-5">
          <p className="text-[10px] font-semibold tracking-[.18em] text-[#cfaa96] uppercase">
            {g("designNotes")}
          </p>
          <p className="mt-3 text-sm leading-7 text-[#e8e6d7]/85">
            {g(`${car.story}.details`)}
          </p>
        </div>
      </div>
      <div id="movie-model-workspace" hidden={!workspace}>
        {workspace && (
          <div className="border-t border-white/10">
            <div className="flex items-start justify-between gap-5 px-5 py-6 sm:px-8">
              <div>
                <h3 className="text-xl font-medium">{g("modelHeading")}</h3>
                <p className="mt-2 max-w-2xl text-xs leading-6 text-[#e8e6d7]/70">
                  {g(car.modelType)} {g("modelNotice")}
                </p>
              </div>
              <button
                type="button"
                aria-label={g("closeModel")}
                className="flex size-11 shrink-0 items-center justify-center rounded-full border border-white/20"
                onClick={() => setWorkspace(false)}
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
            {"localModelId" in car ? (
              <div className="mx-4 mb-6 rounded-2xl bg-[#f3f1e7] p-4 text-[#0e2d30] sm:mx-6">
                <InteractiveCarModel modelId={car.localModelId} />
              </div>
            ) : (
              <ReferenceConfigurator
                key={car.id}
                id={car.id}
                name={car.name}
                image={car.modelImage}
                imageUnoptimized
                openLabel={t("explore")}
              />
            )}
            <p className="px-5 py-5 text-xs leading-6 text-[#e8e6d7]/70 sm:px-8">
              <a
                href={`https://sketchfab.com/3d-models/${car.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4"
              >
                {g("modelSource")} · {car.creator}
              </a>
              {" · "}
              <a
                href="https://creativecommons.org/licenses/by/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                CC BY 4.0
              </a>
            </p>
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 bg-white/[.025] px-5 py-6 sm:px-8">
        <p className="max-w-lg text-xs leading-6 text-[#e8e6d7]/65">
          {g("buildInvitation")}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/garage/new"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#e8e6d7] px-5 text-sm font-medium text-[#0e2d30]"
          >
            {s("startBuild")}
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
          <Link
            href="/studio"
            className="inline-flex min-h-11 items-center rounded-full border border-white/25 px-5 text-sm"
          >
            {s("conceptLink")}
          </Link>
        </div>
      </div>
    </section>
  );
}
