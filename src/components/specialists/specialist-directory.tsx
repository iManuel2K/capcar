"use client";

import { BadgeCheck, MapPin, Search, Store, Wrench } from "lucide-react";
import { useMemo, useState } from "react";
import Link from "next/link";

import {
  announceInstallStampChange,
  createBetaInstallStamp,
} from "@/features/specialists/install-stamp-storage";
import {
  specialistCatalog,
  specialistTypes,
  type Specialist,
  type SpecialistType,
} from "@/features/specialists/specialist-catalog";
import { useInstallStamps } from "@/features/specialists/use-install-stamps";
import { useVehicles } from "@/features/vehicles/use-vehicles";

export function SpecialistDirectory({ vehicleId }: { vehicleId: string }) {
  const { vehicles } = useVehicles();
  const vehicle = vehicles.find((item) => item.id === vehicleId);
  const stamps = useInstallStamps(vehicleId);
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState<SpecialistType>("All specialties");
  const [selected, setSelected] = useState<Specialist>();
  const [message, setMessage] = useState("");
  const results = useMemo(
    () =>
      specialistCatalog.filter((shop) => {
        const matchesText =
          `${shop.name} ${shop.city} ${shop.specialties.join(" ")}`
            .toLowerCase()
            .includes(query.toLowerCase());
        const matchesType =
          specialty === "All specialties" ||
          shop.specialties.includes(specialty);
        return matchesText && matchesType;
      }),
    [query, specialty],
  );
  if (!vehicle)
    return (
      <div className="py-32 text-center text-white/45">Vehicle not found.</div>
    );

  return (
    <div className="pb-24 sm:pb-0">
      <header className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_84%_10%,rgba(231,45,69,0.2),transparent_30%),#111111] p-6 sm:p-10">
        <p className="text-xs font-semibold tracking-[0.15em] text-[#ff667a] uppercase">
          Specialist directory
        </p>
        <h1 className="mt-4 text-4xl font-medium tracking-[-0.05em] sm:text-6xl">
          Find the right hands.
        </h1>
        <p className="mt-4 max-w-2xl leading-7 text-white/45">
          Filter specialist capabilities and keep workshop-installed work in the
          vehicle record.
        </p>
      </header>
      <Link
        href="/verified-work"
        className="mt-5 inline-flex min-h-12 items-center rounded-xl border border-white/20 px-5"
      >
        Request or review a specialist work stamp →
      </Link>
      <aside className="mt-5 rounded-2xl border border-amber-300/15 bg-amber-300/6 p-4 text-sm leading-6 text-amber-100/65">
        Beta listings are illustrative and are not recommendations. Confirm
        qualifications, insurance and pricing directly with each business.
      </aside>
      <section className="mt-5 rounded-[2rem] border border-white/10 bg-[#111111] p-5 sm:p-8">
        <div className="grid gap-3 sm:grid-cols-[1fr_280px]">
          <label className="relative">
            <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-white/25" />
            <input
              aria-label="Search specialists"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by city or capability"
              className="min-h-12 w-full rounded-xl border border-white/10 bg-[#0c0c0c] pr-4 pl-11 text-sm placeholder:text-white/20 focus:border-[#e72d45] focus:outline-none"
            />
          </label>
          <select
            aria-label="Specialty"
            value={specialty}
            onChange={(event) =>
              setSpecialty(event.target.value as SpecialistType)
            }
            className="min-h-12 rounded-xl border border-white/10 bg-[#0c0c0c] px-4 text-sm"
          >
            {specialistTypes.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
        {results.length === 0 ? (
          <div className="mt-7 grid min-h-56 place-items-center rounded-2xl border border-dashed border-white/10 text-center text-sm text-white/35">
            No beta listings match these filters.
          </div>
        ) : (
          <div className="mt-7 grid gap-4 lg:grid-cols-3">
            {results.map((shop) => (
              <article
                key={shop.id}
                className="flex flex-col rounded-2xl border border-white/8 bg-[#0c0c0c] p-5"
              >
                <div className="flex items-center justify-between">
                  <Store className="size-5 text-[#ff667a]" />
                  <span className="text-xs text-white/30">
                    {shop.distanceKm} km
                  </span>
                </div>
                <h2 className="mt-6 text-xl font-medium">{shop.name}</h2>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-white/35">
                  <MapPin className="size-3.5" /> {shop.city}
                </p>
                <p className="mt-4 text-sm leading-6 text-white/40">
                  {shop.description}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {shop.specialties.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/8 px-2.5 py-1 text-[10px] text-white/45"
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => setSelected(shop)}
                  className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 text-sm text-white/60 hover:border-[#e72d45]/30 hover:text-white"
                >
                  <BadgeCheck className="size-4" /> Create beta install stamp
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
      {selected && (
        <StampForm
          vehicleId={vehicleId}
          shop={selected}
          onClose={() => setSelected(undefined)}
          onSaved={(value) => {
            setMessage(value);
            setSelected(undefined);
          }}
        />
      )}
      {message && (
        <p className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-300/15 bg-emerald-300/6 p-4 text-sm text-emerald-100/70">
          <BadgeCheck className="size-4" /> {message}
        </p>
      )}
      {stamps.length > 0 && (
        <section className="mt-5 rounded-[2rem] border border-white/10 bg-[#111111] p-5 sm:p-8">
          <h2 className="text-xl font-medium">Installation stamps</h2>
          <div className="mt-5 grid gap-3">
            {stamps.map((stamp) => (
              <div
                key={stamp.id}
                className="flex flex-col justify-between gap-3 rounded-xl border border-white/8 bg-[#0c0c0c] p-4 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="font-medium">{stamp.work}</p>
                  <p className="mt-1 text-xs text-white/35">
                    {stamp.specialistName} · {stamp.installedAt}
                  </p>
                </div>
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-amber-300/20 bg-amber-300/8 px-3 py-1.5 text-[10px] font-semibold text-amber-200 uppercase">
                  <BadgeCheck className="size-3" /> Beta shop stamp
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function StampForm({
  vehicleId,
  shop,
  onClose,
  onSaved,
}: {
  vehicleId: string;
  shop: Specialist;
  onClose: () => void;
  onSaved: (value: string) => void;
}) {
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    createBetaInstallStamp(
      {
        vehicleId,
        specialistId: shop.id,
        specialistName: shop.name,
        work: String(form.get("work")),
        installedAt: String(form.get("date")),
      },
      window.localStorage,
    );
    announceInstallStampChange();
    onSaved("Beta install stamp added to the vehicle record.");
  }
  return (
    <form
      onSubmit={submit}
      className="mt-5 rounded-[2rem] border border-[#e72d45]/20 bg-[#151010] p-5 sm:p-8"
    >
      <p className="text-xs text-white/35">
        Mock partner workflow · {shop.name}
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_220px]">
        <label className="text-xs text-white/45">
          Installed work
          <input
            name="work"
            required
            placeholder="Four-wheel alignment"
            className="mt-2 min-h-12 w-full rounded-xl border border-white/12 bg-[#0b0b0b] px-4 text-sm placeholder:text-white/20"
          />
        </label>
        <label className="text-xs text-white/45">
          Date
          <input
            name="date"
            type="date"
            required
            defaultValue={new Date().toISOString().slice(0, 10)}
            className="mt-2 min-h-12 w-full rounded-xl border border-white/12 bg-[#0b0b0b] px-4 text-sm"
          />
        </label>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="min-h-11 rounded-xl border border-white/10 px-4 text-sm text-white/50"
        >
          Cancel
        </button>
        <button className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#e72d45] px-5 text-sm font-semibold text-white">
          <Wrench className="size-4" /> Add stamp
        </button>
      </div>
    </form>
  );
}
