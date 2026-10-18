"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  carModels,
  getCarModel,
} from "@/features/visualizer/car-model-catalog";
import { InteractiveCarModel, studioButton } from "./interactive-car-model";

const paintColors = [
  { name: "Alpine white", value: "#e8e6d7" },
  { name: "Carbon black", value: "#191e20" },
  { name: "Racing red", value: "#a92029" },
  { name: "Deep green", value: "#174d41" },
  { name: "Estoril blue", value: "#2e64a6" },
] as const;
const storageKey = "capcar.car-studio.v1";

export function ConceptStudio() {
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
          The free model collection{" "}
          <span className="ml-2 rounded-full bg-[#0e2d30] px-2 py-1 text-[#f3f1e7]">
            25
          </span>
        </p>
        <span className="text-xs">
          No account · No subscription · Same models in your garage
        </span>
      </div>
      <label className="mx-5 mt-5 block text-sm font-semibold lg:hidden">
        Choose a car
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
                : "Reference model"}
            </span>
          </div>
          <InteractiveCarModel modelId={model.id} paint={paint} />
          <div className="mt-6 border-t border-[#0e2d30]/15 pt-5">
            <h3 className="text-sm font-semibold">
              {model.paintMaterials.length
                ? "Try a paint direction"
                : "Original model finish"}
            </h3>
            {model.paintMaterials.length > 0 ? (
              <fieldset className="mt-3">
                <legend className="sr-only">Body paint preview</legend>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={studioButton}
                    aria-pressed={paint === null}
                    onClick={() => setPaint(null)}
                  >
                    Original
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
                      {color.name}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-xs leading-5">
                  Color previews affect mapped body materials only, not real
                  paint or wrap accuracy.
                </p>
              </fieldset>
            ) : (
              <p className="mt-2 text-sm leading-6">
                This model keeps its creator’s original finish. Rotate it and
                inspect the details; paint preview is not available for this
                asset.
              </p>
            )}
            <p className="mt-4 text-xs leading-6">
              {model.notes} These are independent artist models, not
              manufacturer CAD, fitment checks or exact replicas of your
              vehicle. Parts, wheels and ride height are not editable in these
              25 models.
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
                    setMessage(
                      "Direction saved on this device. Garage builds have their own saved configuration.",
                    );
                  } catch {
                    setMessage(
                      "Saving is unavailable on this device. You can still explore every model.",
                    );
                  }
                }}
              >
                Save direction
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
                    setMessage("Your saved direction is restored.");
                  } catch {
                    setMessage(
                      "No valid saved direction found on this device.",
                    );
                  }
                }}
              >
                Restore direction
              </button>
              <Link
                href="/garage"
                className={`${studioButton} border-transparent bg-[#0e2d30] text-[#f3f1e7] hover:bg-[#19464a]`}
              >
                Use in your garage <span aria-hidden="true">↗</span>
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
          aria-label="Choose a car model"
          className="border-t border-[#0e2d30]/15 bg-[#e8e6d7]/45 p-5 sm:p-7 lg:border-t-0 lg:border-l"
        >
          <h3 className="text-xl font-medium tracking-tight">
            Pick your next icon.
          </h3>
          <p className="mt-2 text-sm leading-6">
            Find a car, load it, make it your reference.
          </p>
          <label className="mt-5 block text-xs font-semibold">
            Search cars
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Supra, E30, Skyline…"
              className="mt-2 min-h-11 w-full rounded-xl border border-[#0e2d30]/30 bg-[#f3f1e7] px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2"
            />
          </label>
          <label className="mt-3 block text-xs font-semibold">
            Manufacturer
            <select
              value={make}
              onChange={(event) => setMake(event.target.value)}
              className="mt-2 min-h-11 w-full rounded-xl border border-[#0e2d30]/30 bg-[#f3f1e7] px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <option value="all">All manufacturers</option>
              {makes.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </label>
          <p aria-live="polite" className="mt-4 text-xs">
            {visible.length} of {carModels.length} cars
          </p>
          <div
            className="mt-3 max-h-[560px] space-y-2 overflow-y-auto pr-1"
            tabIndex={0}
            aria-label="Car model collection"
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
                <p>No cars match those filters.</p>
                <button
                  type="button"
                  className={`${studioButton} mt-3`}
                  onClick={() => {
                    setMake("all");
                    setSearch("");
                  }}
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
