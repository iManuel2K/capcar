"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  carModels,
  getCarModel,
} from "@/features/visualizer/car-model-catalog";
import { InteractiveCarModel, studioButton } from "./interactive-car-model";

const paintColors = [
  { name: "white", value: "#e8e6d7" },
  { name: "black", value: "#191e20" },
  { name: "red", value: "#a92029" },
  { name: "green", value: "#174d41" },
  { name: "blue", value: "#2e64a6" },
] as const;
const storageKey = "capcar.car-studio.v1";

export function ConceptStudio() {
  const t = useTranslations("CarStudio");
  const [modelId, setModelId] = useState("bmw-m3-e30");
  const [paint, setPaint] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [make, setMake] = useState("all");
  const [message, setMessage] = useState("");
  const model = getCarModel(modelId) ?? carModels[0];
  const makes = useMemo(
    () => [...new Set(carModels.map((car) => car.make))].sort(),
    [],
  );
  const visible = carModels.filter(
    (car) =>
      (make === "all" || car.make === make) &&
      `${car.name} ${car.make} ${car.model} ${car.platforms.join(" ")}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  );
  return (
    <div className="overflow-hidden rounded-3xl border border-[#0e2d30]/20 bg-[#f3f1e7] text-[#0e2d30]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#0e2d30]/15 px-5 py-4 sm:px-7">
        <p className="text-xs font-semibold tracking-[0.18em] uppercase">
          {t("collectionTitle")}{" "}
          <span className="ml-2 rounded-full bg-[#0e2d30] px-2 py-1 text-[#f3f1e7]">
            {carModels.length}
          </span>
        </p>
        <span className="text-xs">{t("access")}</span>
      </div>
      <label className="mx-5 mt-5 block text-sm font-semibold lg:hidden">
        {t("choose")}
        <select
          className="mt-2 min-h-12 w-full rounded-xl border border-[#0e2d30]/30 bg-[#f3f1e7] px-3"
          value={model.id}
          onChange={(event) => {
            setModelId(event.target.value);
            setPaint(null);
            setMessage("");
          }}
        >
          {makes.map((brand) => (
            <optgroup label={brand} key={brand}>
              {carModels
                .filter((car) => car.make === brand)
                .map((car) => (
                  <option key={car.id} value={car.id}>
                    {car.name}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
      </label>
      <div className="grid lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 p-5 sm:p-7">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="mb-1 text-xs tracking-widest uppercase">
                {model.make}
              </p>
              <h2 className="text-2xl font-medium tracking-tight sm:text-3xl">
                {model.name}
              </h2>
            </div>
            <span className="rounded-full border border-[#0e2d30]/20 px-3 py-1.5 text-xs">
              {model.platforms.length
                ? model.platforms.join(" / ")
                : t("reference")}
            </span>
          </div>
          <InteractiveCarModel modelId={model.id} paint={paint} />
          <div className="mt-6 border-t border-[#0e2d30]/15 pt-5">
            <h3 className="text-sm font-semibold">
              {model.paintMaterials.length
                ? t("paintTitle")
                : t("originalFinish")}
            </h3>
            {model.paintMaterials.length > 0 ? (
              <fieldset className="mt-3">
                <legend className="sr-only">{t("paintLegend")}</legend>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={studioButton}
                    aria-pressed={paint === null}
                    onClick={() => setPaint(null)}
                  >
                    {t("original")}
                  </button>
                  {paintColors.map((color) => (
                    <button
                      type="button"
                      key={color.name}
                      className={`${studioButton} ${paint === color.value ? "ring-2 ring-[#0e2d30]" : ""}`}
                      aria-pressed={paint === color.value}
                      onClick={() => setPaint(color.value)}
                    >
                      <span
                        aria-hidden="true"
                        className="size-4 rounded-full border border-black/20"
                        style={{ backgroundColor: color.value }}
                      />
                      {t(`paint.${color.name}`)}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-xs leading-5">{t("paintNote")}</p>
              </fieldset>
            ) : (
              <p className="mt-2 text-sm leading-6">{t("originalNote")}</p>
            )}
            <p className="mt-4 text-xs leading-6">
              {t(`modelNotes.${model.id}`)}{" "}
              {t("referenceNote", { count: carModels.length })}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                className={studioButton}
                onClick={() => {
                  try {
                    localStorage.setItem(
                      storageKey,
                      JSON.stringify({ modelId: model.id, paint }),
                    );
                    setMessage(t("saved"));
                  } catch {
                    setMessage(t("saveError"));
                  }
                }}
              >
                {t("save")}
              </button>
              <button
                type="button"
                className={studioButton}
                onClick={() => {
                  try {
                    const saved: unknown = JSON.parse(
                      localStorage.getItem(storageKey) ?? "null",
                    );
                    if (
                      !saved ||
                      typeof saved !== "object" ||
                      !("modelId" in saved) ||
                      typeof saved.modelId !== "string" ||
                      !getCarModel(saved.modelId)
                    )
                      throw new Error("Invalid saved model");
                    const color = "paint" in saved ? saved.paint : null;
                    if (
                      color !== null &&
                      (typeof color !== "string" ||
                        !/^#[\da-f]{6}$/i.test(color))
                    )
                      throw new Error("Invalid paint");
                    setModelId(saved.modelId);
                    setPaint(color);
                    setMessage(t("restored"));
                  } catch {
                    setMessage(t("restoreError"));
                  }
                }}
              >
                {t("restore")}
              </button>
              <Link
                href="/garage"
                className={`${studioButton} border-transparent bg-[#0e2d30] text-[#f3f1e7] hover:bg-[#19464a]`}
              >
                {t("useGarage")} <span aria-hidden="true">↗</span>
              </Link>
            </div>
            {message && (
              <p role="status" className="mt-3 text-xs leading-5">
                {message}
              </p>
            )}
          </div>
        </div>
        <aside
          aria-label={t("chooseModel")}
          className="border-t border-[#0e2d30]/15 bg-[#e8e6d7]/45 p-5 sm:p-7 lg:border-t-0 lg:border-l"
        >
          <h3 className="text-xl font-medium tracking-tight">
            {t("browseTitle")}
          </h3>
          <p className="mt-2 text-sm leading-6">{t("browseText")}</p>
          <label className="mt-5 block text-xs font-semibold">
            {t("search")}
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Supra, E30, Skyline…"
              className="mt-2 min-h-11 w-full rounded-xl border border-[#0e2d30]/30 bg-[#f3f1e7] px-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2"
            />
          </label>
          <label className="mt-3 block text-xs font-semibold">
            {t("manufacturer")}
            <select
              value={make}
              onChange={(event) => setMake(event.target.value)}
              className="mt-2 min-h-11 w-full rounded-xl border border-[#0e2d30]/30 bg-[#f3f1e7] px-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <option value="all">{t("allManufacturers")}</option>
              {makes.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </label>
          <p aria-live="polite" className="mt-4 text-xs">
            {t("count", { visible: visible.length, total: carModels.length })}
          </p>
          <div
            className="mt-3 max-h-[560px] space-y-2 overflow-y-auto pr-1"
            tabIndex={0}
            aria-label={t("collectionLabel")}
          >
            {visible.map((car) => (
              <button
                type="button"
                key={car.id}
                aria-pressed={car.id === model.id}
                onClick={() => {
                  setModelId(car.id);
                  setPaint(null);
                  setMessage("");
                }}
                className={`flex min-h-16 w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 ${car.id === model.id ? "border-[#0e2d30] bg-[#0e2d30] text-[#f3f1e7]" : "border-[#0e2d30]/15 bg-[#f3f1e7] hover:border-[#0e2d30]/50"}`}
              >
                <span>
                  <span className="block text-[10px] tracking-widest uppercase">
                    {car.make}
                  </span>
                  <span className="mt-1 block text-sm font-medium">
                    {car.name.replace(`${car.make} `, "")}
                  </span>
                </span>
                <span aria-hidden="true">
                  {car.id === model.id ? "●" : "↗"}
                </span>
              </button>
            ))}
            {visible.length === 0 && (
              <div className="py-8 text-sm leading-6">
                <p>{t("empty")}</p>
                <button
                  type="button"
                  className={`${studioButton} mt-3`}
                  onClick={() => {
                    setMake("all");
                    setSearch("");
                  }}
                >
                  {t("clear")}
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
