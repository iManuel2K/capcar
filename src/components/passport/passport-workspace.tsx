"use client";

import {
  BadgeCheck,
  Copy,
  Download,
  FileJson,
  Link2,
  Link2Off,
  LoaderCircle,
  Printer,
  Share2,
  Trash2,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

import { downloadTextFile } from "@/features/export/download";
import {
  buildVehiclePassport,
  passportToCsv,
} from "@/features/passport/vehicle-passport";
import { proFeatureLabels } from "@/features/pro/pro-features";
import { collectLocalSnapshot } from "@/features/sync/local-snapshot";
import { createClient } from "@/lib/supabase/client";

type PassportLink = {
  share_id: string;
  is_public: boolean;
  created_at: string;
};

export function PassportWorkspace({ vehicleId }: { vehicleId: string }) {
  const hydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [error, setError] = useState("");
  const [links, setLinks] = useState<PassportLink[]>([]);
  const [linksLoading, setLinksLoading] = useState(true);
  const passport = useMemo(
    () =>
      hydrated
        ? buildVehiclePassport(vehicleId, window.localStorage)
        : undefined,
    [hydrated, vehicleId],
  );

  const loadLinks = useCallback(async () => {
    const client = createClient();
    const { data: auth } = await client.auth.getUser();
    if (!auth.user) {
      setLinksLoading(false);
      return;
    }
    const { data, error: linksError } = await client
      .from("vehicle_passports")
      .select("share_id, is_public, created_at")
      .eq("user_id", auth.user.id)
      .contains("payload", { vehicle: { id: vehicleId } })
      .order("created_at", { ascending: false });
    if (linksError) setError(linksError.message);
    else setLinks((data ?? []) as PassportLink[]);
    setLinksLoading(false);
  }, [vehicleId]);

  useEffect(() => {
    if (!hydrated) return;
    const timer = window.setTimeout(() => void loadLinks(), 0);
    return () => window.clearTimeout(timer);
  }, [hydrated, loadLinks]);

  if (!hydrated)
    return (
      <div className="min-h-[650px] animate-pulse rounded-[2rem] bg-white/[0.04]" />
    );
  if (!passport)
    return (
      <div className="py-32 text-center text-white/45">Vehicle not found.</div>
    );
  const title = `${passport.vehicle.productionYear} ${passport.vehicle.make} ${passport.vehicle.model}`;

  async function publish() {
    setSharing(true);
    setError("");
    try {
      const client = createClient();
      const { data: auth, error: authError } = await client.auth.getUser();
      if (authError) throw authError;
      if (!auth.user)
        throw new Error("Sign in before creating a public passport link.");
      const shareId = crypto.randomUUID();
      const { error: saveError } = await client
        .from("vehicle_passports")
        .insert({
          share_id: shareId,
          user_id: auth.user.id,
          payload: passport,
          is_public: true,
        });
      if (saveError) throw saveError;
      setShareUrl(`${window.location.origin}/passport/${shareId}`);
      await loadLinks();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not publish this passport.",
      );
    } finally {
      setSharing(false);
    }
  }

  async function setLinkPublic(shareId: string, isPublic: boolean) {
    setError("");
    const { error: updateError } = await createClient()
      .from("vehicle_passports")
      .update({ is_public: isPublic, updated_at: new Date().toISOString() })
      .eq("share_id", shareId);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    if (!isPublic && shareUrl.endsWith(shareId)) setShareUrl("");
    await loadLinks();
  }

  async function deleteLink(shareId: string) {
    if (!window.confirm("Delete this shared passport link permanently?"))
      return;
    setError("");
    const { error: deleteError } = await createClient()
      .from("vehicle_passports")
      .delete()
      .eq("share_id", shareId);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    if (shareUrl.endsWith(shareId)) setShareUrl("");
    await loadLinks();
  }

  async function copyLink(shareId: string) {
    await navigator.clipboard.writeText(
      `${window.location.origin}/passport/${shareId}`,
    );
  }

  return (
    <div className="passport-print pb-24 sm:pb-0">
      <header className="print-surface rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_84%_8%,rgba(231,45,69,0.2),transparent_30%),#111111] p-6 sm:p-10">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.15em] text-[#ff667a] uppercase">
              Capcar Vehicle Passport
            </p>
            <h1 className="mt-4 text-4xl font-medium tracking-[-0.05em] sm:text-6xl">
              {title}
            </h1>
            <p className="mt-4 text-sm text-white/45">
              {passport.vehicle.platform} · {passport.vehicle.engineCode} ·{" "}
              {passport.vehicle.transmission} ·{" "}
              {passport.vehicle.mileage.toLocaleString("en-US")} km
            </p>
          </div>
          <div className="no-print flex flex-wrap gap-2">
            <Action onClick={() => window.print()} icon={Printer}>
              Print / PDF
            </Action>
            <Action
              onClick={() =>
                downloadTextFile(
                  `capcar-${passport.vehicle.id}.json`,
                  JSON.stringify(
                    {
                      passport,
                      garageSnapshot: collectLocalSnapshot(window.localStorage),
                    },
                    null,
                    2,
                  ),
                )
              }
              icon={FileJson}
            >
              JSON
            </Action>
            <Action
              onClick={() =>
                downloadTextFile(
                  `capcar-${passport.vehicle.id}.csv`,
                  passportToCsv(passport),
                  "text/csv",
                )
              }
              icon={Download}
            >
              CSV
            </Action>
            <button
              disabled={sharing}
              onClick={() => void publish()}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#e72d45] px-4 text-sm font-semibold text-white disabled:opacity-40"
            >
              {sharing ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Share2 className="size-4" />
              )}{" "}
              Share
            </button>
          </div>
        </div>
      </header>
      {shareUrl && (
        <div className="no-print mt-5 rounded-xl border border-emerald-300/15 bg-emerald-300/6 p-4">
          <p className="flex items-center gap-2 text-sm text-emerald-100/75">
            <Link2 className="size-4" /> Public passport ready
          </p>
          <a
            className="mt-2 block text-sm break-all text-white underline"
            href={shareUrl}
            target="_blank"
            rel="noreferrer"
          >
            {shareUrl}
          </a>
        </div>
      )}
      {error && (
        <p
          role="alert"
          className="no-print mt-5 rounded-xl border border-red-300/15 bg-red-300/6 p-4 text-sm text-red-100/75"
        >
          {error} Apply the included passport migration if the table is not
          ready.
        </p>
      )}
      <section className="no-print mt-5 rounded-[2rem] border border-white/10 bg-[#111111] p-5 sm:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs tracking-[0.14em] text-white/30 uppercase">
              Privacy controls
            </p>
            <h2 className="mt-2 text-2xl font-medium">Shared passport links</h2>
            <p className="mt-2 text-sm leading-6 text-white/40">
              Revoke access immediately or remove a link permanently. A revoked
              link shows no vehicle data.
            </p>
          </div>
          <button
            type="button"
            disabled={sharing}
            onClick={() => void publish()}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#e72d45] px-4 text-sm font-semibold text-white disabled:opacity-40"
          >
            <Share2 className="size-4" /> New public link
          </button>
        </div>
        {linksLoading ? (
          <div className="mt-6 flex items-center gap-2 text-sm text-white/35">
            <LoaderCircle className="size-4 animate-spin" /> Loading shared
            links…
          </div>
        ) : links.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-white/35">
            No passport links have been created.
          </p>
        ) : (
          <div className="mt-6 divide-y divide-white/8 border-t border-white/8">
            {links.map((link) => (
              <div
                key={link.share_id}
                className="flex flex-col justify-between gap-4 py-4 sm:flex-row sm:items-center"
              >
                <div className="min-w-0">
                  <p className="truncate font-mono text-xs text-white/55">
                    {link.share_id}
                  </p>
                  <p className="mt-1 text-xs text-white/30">
                    Created{" "}
                    {new Date(link.created_at).toLocaleDateString("en-GB")} ·{" "}
                    {link.is_public ? "Public" : "Revoked"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {link.is_public ? (
                    <>
                      <button
                        type="button"
                        onClick={() => void copyLink(link.share_id)}
                        aria-label="Copy passport link"
                        className="grid size-10 place-items-center rounded-xl border border-white/10 text-white/55"
                      >
                        <Copy className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void setLinkPublic(link.share_id, false)}
                        className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs text-white/55"
                      >
                        <Link2Off className="size-3.5" /> Revoke
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void setLinkPublic(link.share_id, true)}
                      className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs text-white/55"
                    >
                      <Link2 className="size-3.5" /> Restore
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => void deleteLink(link.share_id)}
                    aria-label="Delete passport link"
                    className="grid size-10 place-items-center rounded-xl border border-red-300/10 text-red-200/55"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      <section className="print-surface mt-5 grid gap-3 sm:grid-cols-4">
        <PassportMetric
          label="Maintenance records"
          value={passport.maintenance.length}
        />
        <PassportMetric
          label="Build items"
          value={passport.modifications.length}
        />
        <PassportMetric
          label="Diagnostic logs"
          value={passport.diagnostics.length}
        />
        <PassportMetric
          label="Install stamps"
          value={passport.installStamps.length}
        />
      </section>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <RecordSection
          title="Maintenance history"
          empty="No completed maintenance records."
          rows={passport.maintenance.map((item) => ({
            title: item.title,
            meta: `${item.completedDate} · ${item.mileage.toLocaleString("en-US")} km`,
          }))}
        />
        <RecordSection
          title="Build & fitment history"
          empty="No build items recorded."
          rows={passport.modifications.map((item) => ({
            title: item.title,
            meta: `${capitalize(item.status)} · ${formatEuro(item.cost)} · ${item.fitment} · ${item.verification}${item.selectedMerchant ? ` · ${item.selectedMerchant}` : ""}`,
          }))}
        />
        <RecordSection
          title="Diagnostic history"
          empty="No DTC records."
          rows={passport.diagnostics.map((item) => ({
            title: `${item.code} · ${item.title}`,
            meta: `${capitalize(item.status)} · ${item.mileage.toLocaleString("en-US")} km${item.resolution ? ` · ${item.resolution}` : ""}`,
          }))}
        />
        <RecordSection
          title="Specialist install stamps"
          empty="No shop install stamps."
          rows={passport.installStamps.map((item) => ({
            title: item.work,
            meta: `${item.specialist} · ${item.installedAt} · Beta stamp`,
          }))}
        />
      </div>
      <aside className="no-print mt-5 flex items-center justify-between gap-4 rounded-2xl border border-[#e72d45]/15 bg-[#e72d45]/6 p-5 text-sm text-white/45">
        <span>
          <strong className="text-white/75">Capcar Pro</strong> ·{" "}
          {proFeatureLabels.advancedPassportExports}
        </span>
        <span className="rounded-full border border-[#ff667a]/20 px-3 py-1 text-[10px] text-[#ff8796] uppercase">
          Coming later
        </span>
      </aside>
      <footer className="print-only mt-10 hidden border-t border-black/20 pt-4 text-xs text-black/60">
        Generated by Capcar on{" "}
        {new Date(passport.generatedAt).toLocaleDateString("en-GB")}.
        User-entered records should be verified against original invoices and
        workshop documents.
      </footer>
    </div>
  );
}

function Action({
  onClick,
  icon: Icon,
  children,
}: {
  onClick: () => void;
  icon: typeof Printer;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm text-white/60 hover:text-white"
    >
      <Icon className="size-4" />
      {children}
    </button>
  );
}
function PassportMetric({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#111111] p-5">
      <p className="text-2xl font-medium">{value}</p>
      <p className="mt-1 text-xs text-white/35">{label}</p>
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
  rows: Array<{ title: string; meta: string }>;
}) {
  return (
    <section className="print-surface rounded-[2rem] border border-white/10 bg-[#111111] p-5 sm:p-8">
      <h2 className="flex items-center gap-2 text-xl font-medium">
        <BadgeCheck className="size-4 text-[#ff667a]" /> {title}
      </h2>
      {rows.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-white/35">
          {empty}
        </p>
      ) : (
        <div className="mt-6 divide-y divide-white/8">
          {rows.map((row, index) => (
            <div key={`${row.title}-${index}`} className="py-4">
              <p className="font-medium text-white/80">{row.title}</p>
              <p className="mt-1 text-xs leading-5 text-white/35">{row.meta}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).replaceAll("_", " ");
}
function formatEuro(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}
