"use client";

import { Search, Store } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useCommunity } from "@/features/community/use-community";
import { activeSpecialists } from "@/features/community/specialists";
import { useInstallStamps } from "@/features/specialists/use-install-stamps";
import { useVehicles } from "@/features/vehicles/use-vehicles";

export function SpecialistDirectory({ vehicleId }: { vehicleId: string }) {
  const { vehicles } = useVehicles();
  const vehicle = vehicles.find((item) => item.id === vehicleId);
  const { data, error, refresh } = useCommunity();
  const stamps = useInstallStamps(vehicleId);
  const [query, setQuery] = useState("");
  const specialists = activeSpecialists(data?.roles ?? [], data?.userId);
  const results = specialists.filter((shop) =>
    shop.display_name
      .toLocaleLowerCase()
      .includes(query.trim().toLocaleLowerCase()),
  );
  const workHref = `/verified-work?vehicle=${encodeURIComponent(vehicleId)}`;

  return (
    <div className="space-y-5 pb-24 sm:pb-0">
      <header className="rounded-[2rem] border border-white/10 bg-[#111111] p-6 sm:p-10">
        <p className="text-xs font-semibold tracking-[0.15em] text-[#8fbcb0] uppercase">
          Specialist directory
        </p>
        <h1 className="mt-4 text-4xl font-medium tracking-[-0.05em] sm:text-6xl">
          Find the right hands.
        </h1>
        <p className="mt-4 max-w-2xl leading-7 text-white/65">
          Request a work record from an enrolled specialist
          {vehicle ? ` for your ${vehicle.make} ${vehicle.model}` : ""}. The
          specialist reviews and confirms work through their own account.
        </p>
        <Link
          href={workHref}
          className="mt-5 inline-flex min-h-12 items-center rounded-xl border border-white/20 px-5 text-sm"
        >
          View work requests →
        </Link>
      </header>
      <section
        aria-label="Enrolled specialists"
        className="rounded-[2rem] border border-white/10 bg-[#111111] p-5 sm:p-8"
      >
        <label className="block text-sm text-white/75">
          Search specialists
          <span className="relative mt-2 block">
            <Search
              aria-hidden="true"
              className="absolute top-4 left-4 size-4 text-white/50"
            />
            <input
              type="search"
              value={query}
              maxLength={120}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Specialist name"
              className="min-h-12 w-full rounded-xl border border-white/20 bg-[#0c0c0c] pr-4 pl-11 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8fbcb0]"
            />
          </span>
        </label>
        {!data && !error && (
          <p role="status" className="mt-6 text-white/65">
            Loading enrolled specialists…
          </p>
        )}
        {error && (
          <div role="alert" className="mt-6 space-y-3">
            <p>
              Specialists could not be loaded. Check your connection and that
              you are signed in.
            </p>
            <button
              type="button"
              onClick={() => void refresh()}
              className="min-h-11 rounded-xl border border-white/20 px-4"
            >
              Try again
            </button>
          </div>
        )}
        {data && !specialists.length && (
          <div className="mt-6 rounded-2xl border border-dashed border-white/20 p-6">
            <h2 className="text-xl">Specialist enrolment is opening up.</h2>
            <p className="mt-3 text-sm leading-6 text-white/65">
              No other approved specialist accounts are available yet. You can
              keep recording maintenance in your garage; specialist confirmation
              becomes available when a workshop is enrolled.
            </p>
          </div>
        )}
        {data && specialists.length > 0 && (
          <p role="status" className="mt-5 text-sm text-white/65">
            {results.length} specialist{results.length === 1 ? "" : "s"} found.
          </p>
        )}
        {data && specialists.length > 0 && !results.length && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="mt-3 min-h-11 rounded-xl border border-white/20 px-4"
          >
            Clear search
          </button>
        )}
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {results.map((shop) => (
            <article
              key={shop.user_id}
              className="flex flex-col rounded-2xl border border-white/15 bg-[#0c0c0c] p-5"
            >
              <Store aria-hidden="true" className="size-5 text-[#8fbcb0]" />
              <h2 className="mt-4 text-xl break-words">{shop.display_name}</h2>
              <p className="mt-2 text-xs text-[#8fbcb0]">Enrolled specialist</p>
              <p className="my-4 text-sm leading-6 text-white/65">
                Request confirmation for work this specialist has performed on
                your vehicle.
              </p>
              {vehicle && !vehicle.demoProject ? (
                <Link
                  href={`${workHref}&specialist=${encodeURIComponent(shop.user_id)}`}
                  className="mt-auto inline-flex min-h-12 items-center justify-center rounded-xl border border-white/20 px-4 text-sm hover:bg-white/5"
                >
                  Request work confirmation →
                </Link>
              ) : (
                <p className="mt-auto text-sm text-white/65">
                  Add and sync your own vehicle to request confirmation.
                </p>
              )}
            </article>
          ))}
        </div>
        <p className="mt-6 text-xs leading-6 text-white/60">
          Enrolment permits a specialist to attest to their own work. It is not
          a safety inspection or a guarantee of qualifications, insurance or
          pricing.
        </p>
      </section>
      {stamps.length > 0 && (
        <section className="rounded-[2rem] border border-white/10 bg-[#111111] p-5 sm:p-8">
          <h2 className="text-xl">Previous local work notes</h2>
          <p className="mt-2 text-sm leading-6 text-white/65">
            Your earlier beta records are preserved. These were entered locally
            and have not been confirmed by a specialist.
          </p>
          <ul className="mt-5 divide-y divide-white/10">
            {stamps.map((stamp) => (
              <li key={stamp.id} className="py-4">
                <p className="font-medium break-words">{stamp.work}</p>
                <p className="mt-1 text-sm text-white/65">
                  {stamp.specialistName} · {stamp.installedAt}
                </p>
                <p className="mt-2 text-xs text-amber-200">
                  Unverified local note
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
