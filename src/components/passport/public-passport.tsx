import Link from "next/link";
import { BadgeCheck, ShieldCheck } from "lucide-react";

import { CapcarWordmark } from "@/components/brand/capcar-wordmark";
import { PassportIdentityDocument } from "@/components/passport/passport-identity-document";
import type { VehiclePassportPayload } from "@/features/passport/vehicle-passport";

export function PublicPassport({
  passport,
  publishedAt,
  liveUrl,
}: {
  passport: VehiclePassportPayload;
  publishedAt: string;
  liveUrl: string;
}) {
  const title = `${passport.vehicle.productionYear} ${passport.vehicle.make} ${passport.vehicle.model}`;

  return (
    <main className="min-h-dvh bg-[#0b0e0c] px-4 py-5 text-[#f4f5f2] sm:px-7 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between gap-5">
          <Link href="/" aria-label="Capcar home">
            <CapcarWordmark />
          </Link>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/6 px-3 py-2 text-xs text-emerald-100/65">
            <ShieldCheck className="size-3.5" /> Owner-shared record
          </span>
        </header>

        <h1 className="sr-only">{title} Vehicle Passport</h1>
        <PassportIdentityDocument passport={passport} liveUrl={liveUrl} />
        <p className="mt-3 text-right text-xs text-white/32">
          Published {new Date(publishedAt).toLocaleDateString("en-GB")}
        </p>

        <section className="mt-5 grid gap-3 sm:grid-cols-4">
          <Metric label="Maintenance" value={passport.maintenance.length} />
          <Metric label="Build items" value={passport.modifications.length} />
          <Metric label="Diagnostics" value={passport.diagnostics.length} />
          <Metric
            label="Local work notes"
            value={passport.installStamps.length}
          />
        </section>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <RecordSection
            title="Maintenance history"
            empty="No completed maintenance records shared."
            rows={passport.maintenance.map((item) => ({
              title: item.title,
              detail: `${item.completedDate} · ${item.mileage.toLocaleString("en-US")} km`,
            }))}
          />
          <RecordSection
            title="Build history"
            empty="No build items shared."
            rows={passport.modifications.map((item) => ({
              title: item.title,
              detail: `${formatLabel(item.status)} · ${formatEuro(item.cost)} · ${item.verification}`,
            }))}
          />
          <RecordSection
            title="Diagnostic history"
            empty="No diagnostic records shared."
            rows={passport.diagnostics.map((item) => ({
              title: `${item.code} · ${item.title}`,
              detail: `${formatLabel(item.status)} · ${item.mileage.toLocaleString("en-US")} km${item.resolution ? ` · ${item.resolution}` : ""}`,
            }))}
          />
          <RecordSection
            title="Local work notes · unverified"
            empty="No local work notes shared."
            rows={passport.installStamps.map((item) => ({
              title: item.work,
              detail: `${item.specialist} · ${item.installedAt} · Unverified local entry`,
            }))}
          />
        </div>

        <aside className="mt-5 rounded-2xl border border-amber-300/12 bg-amber-300/5 p-5 text-xs leading-6 text-white/45">
          This record was entered and shared by the vehicle owner. Verify parts,
          invoices, safety-critical work and legal approval against original
          documents before relying on it.
        </aside>

        <footer className="flex flex-col justify-between gap-5 py-10 text-xs text-white/35 sm:flex-row sm:items-center">
          <CapcarWordmark />
          <Link href="/" className="font-medium text-white/60">
            Build your own garage →
          </Link>
        </footer>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#111111] p-5">
      <p className="text-3xl font-medium">{value}</p>
      <p className="mt-2 text-xs text-white/35">{label}</p>
    </article>
  );
}

function RecordSection({
  title,
  empty,
  rows,
}: {
  title: string;
  empty: string;
  rows: Array<{ title: string; detail: string }>;
}) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-[#111111] p-5 sm:p-8">
      <h2 className="flex items-center gap-2 text-xl font-medium">
        <BadgeCheck className="size-4 text-[#ff667a]" /> {title}
      </h2>
      {rows.length === 0 ? (
        <p className="mt-7 rounded-xl border border-dashed border-white/10 p-7 text-center text-sm text-white/35">
          {empty}
        </p>
      ) : (
        <div className="mt-5 divide-y divide-white/8">
          {rows.map((row, index) => (
            <div key={`${row.title}-${index}`} className="py-4">
              <p className="font-medium text-white/78">{row.title}</p>
              <p className="mt-1 text-xs leading-5 text-white/35">
                {row.detail}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function formatLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).replaceAll("_", " ");
}

function formatEuro(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}
