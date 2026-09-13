"use client";

import Image from "next/image";
import { ReferenceConfigurator } from "./reference-configurator";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

const cars = [
  {
    name: "Nissan Skyline R34 GT-R",
    id: "ff8fb2251dfa4bb9979e7022c5a6666c",
    creator: "Lexyc16",
    image: "/showcase/skyline.jpg",
  },
  {
    name: "1975 Porsche 911 Turbo",
    id: "8568d9d14a994b9cae59499f0dbed21e",
    creator: "Lionsharp Studios",
    image: "/showcase/porsche.jpg",
  },
  {
    name: "Brian’s R34 · 2 Fast 2 Furious",
    id: "c424e4f18c9742d296920f069d139b45",
    creator: "DRIVER-FIRE",
    image: "/showcase/brians-r34.jpg",
  },
];

export function IconicGallery() {
  const expansion = useTranslations("Expansion");
  const [configuring, setConfiguring] = useState(false);
  const t = useTranslations("StudioUi");
  const [selected, setSelected] = useState(0);
  const [active, setActive] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const car = cars[selected];
  useEffect(() => {
    if (!active || loaded) return;
    const timer = window.setTimeout(() => {
      setActive(false);
      setUnavailable(true);
    }, 15000);
    return () => window.clearTimeout(timer);
  }, [active, loaded, attempt, selected]);
  return (
    <section
      aria-label={t("galleryLabel")}
      className="overflow-hidden rounded-3xl border border-[#0e2d30]/20 bg-[#101615] text-[#e8e6d7]"
    >
      <div className="flex gap-3 overflow-x-auto p-4">
        {cars.map((item, index) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={index === selected}
            onClick={() => {
              setSelected(index);
              setConfiguring(false);
              setActive(false);
              setLoaded(false);
              setUnavailable(false);
            }}
            className={`min-h-12 shrink-0 rounded-xl border px-5 text-sm ${selected === index ? "border-[#e8e6d7] bg-[#e8e6d7] text-[#0e2d30]" : "border-white/25"}`}
          >
            {item.name}
          </button>
        ))}
      </div>
      {configuring ? (
        <ReferenceConfigurator key={car.id} {...car} />
      ) : (
        <div className="relative h-[420px] sm:h-[600px]">
          {active ? (
            <iframe
              key={`${car.id}-${attempt}`}
              title={`${car.name} ${t("interactive")}`}
              src={`https://sketchfab.com/models/${car.id}/embed?autostart=1&ui_theme=dark`}
              allow="fullscreen; xr-spatial-tracking"
              allowFullScreen
              onLoad={() => setLoaded(true)}
              onError={() => {
                setActive(false);
                setUnavailable(true);
              }}
              className="h-full w-full border-0"
            />
          ) : (
            <>
              <Image
                src={car.image}
                alt={t("previewAlt", { car: car.name })}
                fill
                sizes="(max-width: 768px) 100vw, 1200px"
                className="object-contain"
              />
              <button
                type="button"
                onClick={() => {
                  setActive(true);
                  setLoaded(false);
                  setUnavailable(false);
                }}
                className="absolute bottom-6 left-1/2 min-h-12 -translate-x-1/2 rounded-xl bg-[#e8e6d7] px-6 font-semibold whitespace-nowrap text-[#0e2d30]"
              >
                {t("explore")}
              </button>
            </>
          )}
          {active && !loaded && (
            <p
              role="status"
              className="pointer-events-none absolute top-4 left-4 rounded-xl bg-[#101615] px-4 py-3 text-sm"
            >
              {t("opening")}
            </p>
          )}
        </div>
      )}
      <div className="space-y-3 border-t border-white/15 p-5 text-sm leading-6">
        <button
          className="min-h-11 rounded-xl border border-white/30 px-4"
          onClick={() => {
            setConfiguring((value) => !value);
            setActive(false);
          }}
        >
          {configuring ? expansion("close3d") : expansion("configure")}
        </button>
        {car.id === "c424e4f18c9742d296920f069d139b45" && (
          <p>{expansion("fanModel")}</p>
        )}
        {unavailable && <p role="status">{t("connectionFailed")}</p>}
        <p>{t("controls")}</p>
        {active && (
          <p>
            {t("blank")}{" "}
            <button
              type="button"
              className="min-h-11 underline"
              onClick={() => {
                setLoaded(false);
                setAttempt((value) => value + 1);
              }}
            >
              {t("retry")}
            </button>
            {" · "}
            <button
              type="button"
              className="min-h-11 underline"
              onClick={() => setActive(false)}
            >
              {t("showPreview")}
            </button>
          </p>
        )}
        <p>
          <a
            className="underline"
            href={`https://sketchfab.com/3d-models/${car.id}`}
            target="_blank"
            rel="noreferrer"
          >
            {car.name} {t("by")} {car.creator}
          </a>
          {" · "}
          <a
            className="underline"
            href="https://creativecommons.org/licenses/by/4.0/"
          >
            CC BY 4.0
          </a>
          . {configuring ? expansion("adapted") : t("unmodified")}
        </p>
        <p className="text-xs text-white/60">{t("creatorNotice")}</p>
      </div>
    </section>
  );
}
