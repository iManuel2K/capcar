import Link from "next/link";
import { BadgeCheck, Clock3, Fingerprint, ShieldCheck } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";

import { CapcarWordmark } from "@/components/brand/capcar-wordmark";
import { PassportIdentityDocument } from "@/components/passport/passport-identity-document";
import type { VehiclePassportPayload } from "@/features/passport/vehicle-passport";
import type { PassportIntegrity } from "@/features/passport/passport-integrity";

export async function PublicPassport({
  passport,
  publishedAt,
  updatedAt,
  expiresAt,
  recordHash,
  integrity,
  liveUrl,
}: {
  passport: VehiclePassportPayload;
  publishedAt: string;
  updatedAt: string;
  expiresAt: string | null;
  recordHash: string | null;
  integrity: PassportIntegrity;
  liveUrl: string;
}) {
  const [t, locale] = await Promise.all([
    getTranslations("PublicPassport"),
    getLocale(),
  ]);
  const title = `${passport.vehicle.productionYear} ${passport.vehicle.make} ${passport.vehicle.model}`;

  return (
    <main className="min-h-dvh bg-[#0b0e0c] px-4 py-5 text-[#f4f5f2] sm:px-7 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between gap-5">
          <Link href="/" aria-label={t("home")}>
            <CapcarWordmark />
          </Link>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/6 px-3 py-2 text-xs text-emerald-100/65">
            <ShieldCheck className="size-3.5" /> {t("shared")}
          </span>
        </header>

        <h1 className="sr-only">
          {title} {t("document")}
        </h1>
        <PassportIdentityDocument passport={passport} liveUrl={liveUrl} />
        <p className="mt-3 text-right text-xs text-white/32">
          {t("published", {
            date: new Date(publishedAt).toLocaleDateString(locale),
          })}
        </p>

        <section
          aria-labelledby="passport-verification-title"
          className="mt-5 grid gap-4 rounded-2xl border border-emerald-300/15 bg-emerald-300/6 p-5 sm:grid-cols-[1fr_auto] sm:items-center"
        >
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-emerald-100/65 uppercase">
              <ShieldCheck className="size-4" /> {t("verificationTitle")}
            </p>
            <h2
              id="passport-verification-title"
              className="mt-2 text-xl font-medium text-white/85"
            >
              {integrity === "verified"
                ? t("integrityVerified")
                : t("legacyRecord")}
            </h2>
            <p className="mt-2 max-w-3xl text-xs leading-5 text-white/45">
              {t("integrityNotice")}
            </p>
          </div>
          <dl className="grid gap-2 text-xs text-white/55 sm:min-w-64">
            <div className="flex items-center justify-between gap-5">
              <dt className="flex items-center gap-2">
                <Fingerprint className="size-3.5" /> {t("recordHash")}
              </dt>
              <dd className="font-mono text-white/75">
                {recordHash ? `${recordHash.slice(0, 12)}…` : t("legacy")}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-5">
              <dt className="flex items-center gap-2">
                <Clock3 className="size-3.5" /> {t("updated")}
              </dt>
              <dd>{new Date(updatedAt).toLocaleDateString(locale)}</dd>
            </div>
            <div className="flex items-center justify-between gap-5">
              <dt>{t("expires")}</dt>
              <dd>
                {expiresAt
                  ? new Date(expiresAt).toLocaleDateString(locale)
                  : t("noExpiry")}
              </dd>
            </div>
          </dl>
        </section>

        <section className="mt-5 grid gap-3 sm:grid-cols-5">
          <Metric
            label={t("maintenance")}
            value={passport.maintenance.length}
          />
          <Metric
            label={t("buildItems")}
            value={passport.modifications.length}
          />
          <Metric
            label={t("diagnostics")}
            value={passport.diagnostics.length}
          />
          <Metric label={t("notes")} value={passport.installStamps.length} />
          <Metric
            label={t("roadbookVisits")}
            value={passport.roadbookVisits.length}
          />
        </section>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <RecordSection
            title={t("maintenanceHistory")}
            empty={t("noMaintenance")}
            rows={passport.maintenance.map((item) => ({
              title: item.title,
              detail: `${item.completedDate} · ${item.mileage.toLocaleString(locale)} km`,
            }))}
          />
          <RecordSection
            title={t("buildHistory")}
            empty={t("noBuild")}
            rows={passport.modifications.map((item) => ({
              title: item.title,
              detail: `${formatLabel(item.status)}${item.installedAt ? ` ${item.installedAt}` : ""} · ${item.costBasis === "paid-net-of-refunds" ? "paid, net of refunds" : "estimated"} ${formatEuro(item.cost)} · ${item.verification}`,
            }))}
          />
          <RecordSection
            title={t("diagnosticHistory")}
            empty={t("noDiagnostics")}
            rows={passport.diagnostics.map((item) => ({
              title: `${item.code} · ${item.title}`,
              detail: `${formatLabel(item.status)} · ${item.mileage.toLocaleString(locale)} km${item.resolution ? ` · ${item.resolution}` : ""}`,
            }))}
          />
          <RecordSection
            title={t("workHistory")}
            empty={t("noWork")}
            rows={passport.installStamps.map((item) => ({
              title: item.work,
              detail: `${item.specialist} · ${item.installedAt} · ${t("unverified")}`,
            }))}
          />
          <RecordSection
            title={t("roadbookHistory")}
            empty={t("noRoadbookVisits")}
            rows={passport.roadbookVisits.map((item) => ({
              title: item.venueName,
              detail: `${item.visitedAt} · ${t("ownerRecorded")}${item.bestLapSeconds ? ` · ${item.bestLapSeconds}s` : ""}`,
            }))}
          />
        </div>

        <aside className="mt-5 rounded-2xl border border-amber-300/12 bg-amber-300/5 p-5 text-xs leading-6 text-white/45">
          {t("notice")}
        </aside>

        <footer className="flex flex-col justify-between gap-5 py-10 text-xs text-white/35 sm:flex-row sm:items-center">
          <CapcarWordmark />
          <Link href="/" className="font-medium text-white/60">
            {t("buildGarage")}
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
