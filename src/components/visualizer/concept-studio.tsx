"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { studioText } from "@/features/visualizer/studio-copy";
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
  const t = studioText(useLocale());
  const sourceCopy = useTranslations("CarStudio");
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
    <div className="text-foreground">
      <div className="border-foreground/15 hidden flex-wrap items-center justify-between gap-3 border-b py-4 lg:flex">
        <p className="text-xs font-semibold tracking-[0.18em] uppercase">
          {t("collection")} · {carModels.length}
        </p>
        <span className="text-xs">{t("access")}</span>
      </div>
      <label className="mt-4 block text-sm font-semibold lg:hidden">
        {t("choose")}
        <select
          className="border-foreground/30 bg-background mt-2 min-h-12 w-full rounded-xl border px-3"
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
        <div className="min-w-0 py-5 lg:pr-8">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="mb-1 text-xs tracking-widest uppercase">
                {model.make}
              </p>
              <h2 className="text-2xl font-medium tracking-tight sm:text-3xl">
                {model.name}
              </h2>
            </div>
            <span className="text-muted-foreground font-mono text-xs">
              {model.platforms.length
                ? model.platforms.join(" / ")
                : t("reference")}
            </span>
          </div>
          <InteractiveCarModel modelId={model.id} paint={paint} />
          <div className="border-foreground/15 mt-6 border-t pt-5">
            <h3 className="text-sm font-semibold">
              {model.paintMaterials.length ? t("paint") : t("finish")}
            </h3>
            {model.paintMaterials.length > 0 ? (
              <fieldset className="mt-3">
                <legend className="sr-only">{t("paintLabel")}</legend>
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
                      className={`${studioButton} ${paint === color.value ? "ring-foreground ring-2" : ""}`}
                      aria-pressed={paint === color.value}
                      onClick={() => setPaint(color.value)}
                    >
                      <span
                        aria-hidden="true"
                        className="size-4 rounded-full border border-black/20"
                        style={{ backgroundColor: color.value }}
                      />
                      {t(color.name)}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-xs leading-5">{t("paintNotice")}</p>
              </fieldset>
            ) : (
              <p className="mt-2 text-sm leading-6">{t("fixedFinish")}</p>
            )}
            <p className="mt-4 text-xs leading-6">
              {sourceCopy(`modelNotes.${model.id}`)} {t("scope")}
            </p>
            <details className="mt-3 text-xs leading-6">
              <summary className="inline-flex min-h-11 cursor-pointer items-center underline underline-offset-4">
                {t("notes")}
              </summary>
              <p lang="en">{model.notes}</p>
            </details>
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
                    setMessage(t("saveFailed"));
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
                    setMessage(t("restoreFailed"));
                  }
                }}
              >
                {t("restore")}
              </button>
              <Link
                href="/garage"
                className={`${studioButton} bg-card text-foreground hover:bg-secondary border-transparent`}
              >
                {t("garage")} <span aria-hidden="true">↗</span>
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
          aria-label={t("choose")}
          className="border-foreground/15 border-t py-5 lg:border-t-0 lg:border-l lg:pl-7"
        >
          <h3 className="text-xl font-medium tracking-tight">{t("browse")}</h3>
          <p className="mt-2 text-sm leading-6">{t("browseText")}</p>
          <label className="mt-5 block text-xs font-semibold">
            {t("search")}
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Supra, E30, Skyline…"
              className="border-foreground/30 bg-background mt-2 min-h-11 w-full rounded-xl border px-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2"
            />
          </label>
          <label className="mt-3 block text-xs font-semibold">
            {t("make")}
            <select
              value={make}
              onChange={(event) => setMake(event.target.value)}
              className="border-foreground/30 bg-background mt-2 min-h-11 w-full rounded-xl border px-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <option value="all">{t("allMakes")}</option>
              {makes.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </label>
          <p aria-live="polite" className="mt-4 text-xs">
            {t("results", { shown: visible.length, total: carModels.length })}
          </p>
          <div
            className="mt-3 max-h-[560px] space-y-2 overflow-y-auto pr-1"
            tabIndex={0}
            aria-label={t("list")}
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
                className={`flex min-h-16 w-full items-center justify-between gap-3 border-b px-3 py-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 ${car.id === model.id ? "border-foreground bg-card text-foreground" : "border-foreground/15 hover:bg-card/5"}`}
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
                <p>{t("noResults")}</p>
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
