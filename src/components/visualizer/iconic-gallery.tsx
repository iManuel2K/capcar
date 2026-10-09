"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Rotate3D } from "lucide-react";
import { useTranslations } from "next-intl";
import { iconicCars } from "@/features/visualizer/iconic-cars";
import { ReferenceConfigurator } from "./reference-configurator";

export function IconicGallery() {
  const t = useTranslations("StudioUi");
  const s = useTranslations("StudioPolish");
  const [selected, setSelected] = useState(0);
  const car = iconicCars[selected];
  return (
    <section
      aria-label={t("galleryLabel")}
      className="overflow-hidden rounded-[2rem] border border-[#0e2d30]/15 bg-[#0b2326] text-[#e8e6d7] shadow-[0_24px_70px_rgba(14,45,48,.12)]"
    >
      <div
        className="grid gap-3 border-b border-white/10 p-4 sm:grid-cols-3 sm:p-6"
        aria-label={s("chooseCar")}
      >
        {iconicCars.map((item, index) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={selected === index}
            aria-label={item.name}
            onClick={() => setSelected(index)}
            className={`group flex min-w-0 items-center gap-3 rounded-2xl border p-3 text-left transition motion-reduce:transition-none sm:block ${selected === index ? "border-[#cfaa96]/60 bg-[#1c4143]" : "border-white/10 hover:border-white/30 hover:bg-white/5"}`}
          >
            <span className="relative block h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-[#101615] sm:aspect-[16/9] sm:h-auto sm:w-full">
              <Image
                src={item.image}
                alt=""
                fill
                sizes="(max-width: 640px) 112px, 360px"
                className="object-contain"
              />
            </span>
            <span className="block min-w-0 sm:mt-3">
              <span className="text-[10px] tracking-[.12em] text-[#cfaa96] uppercase">
                0{index + 1} / {s(item.kind)}
              </span>
              <span className="mt-1 block text-sm leading-5 font-medium">
                {item.name}
              </span>
            </span>
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-start justify-between gap-4 px-5 py-6 sm:px-8">
        <div className="max-w-2xl">
          <p className="text-xs tracking-[.16em] text-[#cfaa96] uppercase">
            {s(car.kind)}
          </p>
          <h2 className="mt-3 text-2xl font-medium tracking-tight sm:text-3xl">
            {car.name}
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#e8e6d7]/70">
            {s(car.story)}
          </p>
        </div>
        <span className="flex items-center gap-2 rounded-full border border-white/15 px-3 py-2 text-xs text-[#e8e6d7]/70">
          <Rotate3D aria-hidden="true" className="size-4" />
          {t("interactive")}
        </span>
      </div>
      <ReferenceConfigurator key={car.id} {...car} openLabel={t("explore")} />
      <div className="grid gap-6 border-t border-white/10 p-5 sm:p-8 lg:grid-cols-[1fr_auto]">
        <div className="space-y-3 text-xs leading-6 text-[#e8e6d7]/70">
          <p>
            <a
              href={`https://sketchfab.com/3d-models/${car.id}`}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4"
            >
              {car.name} {t("by")} {car.creator} ↗
            </a>
            {" · "}
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              CC BY 4.0
            </a>
          </p>
          <p>{s("modelNotice")}</p>
          <p>{s("galleryScope")}</p>
        </div>
        <div className="flex flex-wrap items-start gap-3">
          <Link
            href="/garage/new"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#e8e6d7] px-5 text-sm font-medium text-[#0e2d30]"
          >
            {s("startBuild")}
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
          <Link
            href="/studio"
            className="inline-flex min-h-11 items-center rounded-full border border-white/20 px-5 text-sm"
          >
            {s("conceptLink")}
          </Link>
        </div>
      </div>
    </section>
  );
}
