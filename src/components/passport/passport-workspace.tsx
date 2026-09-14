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
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { downloadTextFile } from "@/features/export/download";
import { PassportIdentityDocument } from "@/components/passport/passport-identity-document";
import { PassportPhotoUpload } from "@/components/passport/passport-photo-upload";
import {
  buildVehiclePassport,
  passportToCsv,
  readPassportProfile,
  savePassportProfile,
  type PassportProfile,
} from "@/features/passport/vehicle-passport";
import { proFeatureLabels } from "@/features/pro/pro-features";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useBuildState } from "@/features/builds/use-builds";
import { VehicleDocuments } from "./vehicle-documents";

type PassportLink = {
  share_id: string;
  is_public: boolean;
  created_at: string;
};

export function PassportWorkspace({ vehicleId }: { vehicleId: string }) {
  return <VehiclePassportWorkspace key={vehicleId} vehicleId={vehicleId} />;
}

function VehiclePassportWorkspace({ vehicleId }: { vehicleId: string }) {
  useBuildState(); // Rebuild the Passport when installed work changes in this or another tab.
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
  const [, setProfileRevision] = useState(0);
  const [profileMessage, setProfileMessage] = useState("");
  const [linkMessage, setLinkMessage] = useState("");
  const requestGeneration = useRef(0);
  const invalidateRequests = useCallback(() => {
    requestGeneration.current++;
  }, []);
  const mutationLock = useRef(false);
  const profile = hydrated
    ? readPassportProfile(vehicleId, window.localStorage)
    : undefined;
  const passport = hydrated
    ? buildVehiclePassport(vehicleId, window.localStorage)
    : undefined;

  const loadLinks = useCallback(async () => {
    const request = ++requestGeneration.current;
    setLinksLoading(true);
    try {
      const client = createClient();
      const { data: auth, error: authError } = await client.auth.getUser();
      if (authError || !auth.user)
        throw new Error(
          "Sign in to manage shared passport links. Your local passport is still available.",
        );
      const { data, error: linksError } = await client
        .from("vehicle_passports")
        .select("share_id, is_public, created_at")
        .eq("user_id", auth.user.id)
        .contains("payload", { vehicle: { id: vehicleId } })
        .order("created_at", { ascending: false });
      if (request !== requestGeneration.current) return;
      if (linksError)
        throw new Error(
          "Shared links could not be loaded. Check your connection and try again.",
        );
      setLinks((data ?? []) as PassportLink[]);
      setError("");
    } catch (caught) {
      if (request === requestGeneration.current) {
        setLinks([]);
        setError(
          caught instanceof Error
            ? caught.message
            : "Shared links could not be loaded. Try again.",
        );
      }
    } finally {
      if (request === requestGeneration.current) setLinksLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    if (!hydrated) return;
    const timer = window.setTimeout(() => void loadLinks(), 0);
    return () => {
      invalidateRequests();
      window.clearTimeout(timer);
    };
  }, [hydrated, loadLinks, invalidateRequests]);

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
    if (mutationLock.current) return;
    mutationLock.current = true;
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
      mutationLock.current = false;
      setSharing(false);
    }
  }

  async function setLinkPublic(shareId: string, isPublic: boolean) {
    if (mutationLock.current) return;
    mutationLock.current = true;
    setSharing(true);
    setError("");
    try {
      const { data, error: updateError } = await createClient()
        .from("vehicle_passports")
        .update({ is_public: isPublic, updated_at: new Date().toISOString() })
        .eq("share_id", shareId)
        .select("share_id")
        .maybeSingle();
      if (updateError || !data)
        throw new Error(
          "Could not change this link. Check your connection and sign-in, then try again.",
        );
      if (!isPublic && shareUrl.endsWith(shareId)) setShareUrl("");
      await loadLinks();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not change this link. Try again.",
      );
    } finally {
      mutationLock.current = false;
      setSharing(false);
    }
  }

  async function deleteLink(shareId: string) {
    if (mutationLock.current) return;
    if (!window.confirm("Delete this shared passport link permanently?"))
      return;
    mutationLock.current = true;
    setSharing(true);
    setError("");
    try {
      const { data, error: deleteError } = await createClient()
        .from("vehicle_passports")
        .delete()
        .eq("share_id", shareId)
        .select("share_id")
        .maybeSingle();
      if (deleteError || !data)
        throw new Error(
          "Could not delete this link. Check your connection and sign-in, then try again.",
        );
      if (shareUrl.endsWith(shareId)) setShareUrl("");
      await loadLinks();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not delete this link. Try again.",
      );
    } finally {
      mutationLock.current = false;
      setSharing(false);
    }
  }

  async function copyLink(shareId: string) {
    const url = `${window.location.origin}/passport/${shareId}`;
    try {
      await navigator.clipboard.writeText(url);
      setLinkMessage("Passport link copied.");
    } catch {
      setLinkMessage(
        `Automatic copying is unavailable. Select and copy this link: ${url}`,
      );
    }
  }

  return (
    <div className="passport-print pb-24 sm:pb-0">
      <header className="no-print rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_84%_8%,rgba(231,45,69,0.2),transparent_30%),#111111] p-6 sm:p-10">
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
          {error}
        </p>
      )}
      {linkMessage && (
        <p
          role="status"
          className="no-print mt-4 rounded-xl border border-white/15 p-4 text-sm break-all text-white/80"
        >
          {linkMessage}
        </p>
      )}
      <PassportProfileEditor
        vehicleId={vehicleId}
        initial={profile}
        message={profileMessage}
        onMessage={setProfileMessage}
        onSaved={() => setProfileRevision((value) => value + 1)}
      />
      <PassportPhotoUpload
        vehicleId={vehicleId}
        photo={profile?.photoDataUrl}
        onSaved={() => setProfileRevision((value) => value + 1)}
      />
      <PassportIdentityDocument
        passport={passport}
        liveUrl={
          shareUrl ||
          (links.find((link) => link.is_public)
            ? `${window.location.origin}/passport/${links.find((link) => link.is_public)?.share_id}`
            : undefined)
        }
      />
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
            <p className="mt-2 text-sm leading-6 text-white/60">
              Each link is a snapshot. Create a new link after updating records
              or privacy choices, and revoke older versions you no longer want
              public.
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
        <button
          type="button"
          disabled={linksLoading || sharing}
          onClick={() => void loadLinks()}
          className="mt-4 min-h-11 rounded-xl border border-white/20 px-4 text-sm disabled:opacity-40"
        >
          Refresh shared links
        </button>
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
                        disabled={sharing}
                        onClick={() => void setLinkPublic(link.share_id, false)}
                        className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs text-white/55"
                      >
                        <Link2Off className="size-3.5" /> Revoke
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      disabled={sharing}
                      onClick={() => void setLinkPublic(link.share_id, true)}
                      className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs text-white/55"
                    >
                      <Link2 className="size-3.5" /> Restore
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={sharing}
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
      <VehicleDocuments key={vehicleId} vehicleId={vehicleId} />
      <section className="print-surface mt-5 grid gap-3 sm:grid-cols-4">
        <PassportMetric
          label="Maintenance records"
          value={passport.maintenance.length}
        />
        <PassportMetric
          label="Installed modifications"
          value={
            passport.modifications.filter((item) => item.status === "installed")
              .length
          }
        />
        <PassportMetric
          label="Diagnostic logs"
          value={passport.diagnostics.length}
        />
        <PassportMetric
          label="Local work notes"
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
          title="Installed modifications · owner recorded"
          empty="No installations recorded. Planned items are listed separately below."
          rows={passport.modifications
            .filter((item) => item.status === "installed")
            .map((item) => ({
              title: item.title,
              meta: `Installed${item.installedAt ? ` ${item.installedAt}` : " · date unconfirmed"}${item.installationMileage !== undefined ? ` · ${item.installationMileage} km` : ""} · ${item.costBasis === "paid-net-of-refunds" ? "paid, net of refunds" : "estimated"} ${formatEuro(item.cost)} · ${item.fitment} · ${item.verification}${item.selectedMerchant ? ` · ${item.selectedMerchant}` : ""}`,
            }))}
        />
        <RecordSection
          title="Planned & ordered · not installed"
          empty="No pending modifications."
          rows={passport.modifications
            .filter((item) => item.status !== "installed")
            .map((item) => ({
              title: item.title,
              meta: `${capitalize(item.status)}${item.orderedAt ? ` ${item.orderedAt}` : ""}${item.deliveredAt ? ` · delivered ${item.deliveredAt}` : ""} · ${item.costBasis === "paid-net-of-refunds" ? "paid, net of refunds" : "estimated"} ${formatEuro(item.cost)} · not installation evidence`,
            }))}
        />
        <aside className="no-print rounded-2xl border border-white/15 p-6">
          <h2 className="text-xl font-medium">
            Keep the build and its record connected.
          </h2>
          <p className="mt-3 text-sm leading-6 text-white/70">
            Mark completed work in the build plan to include it here. Estimates
            are not receipts, and owner-entered installation records are not
            specialist verification.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              className="inline-flex min-h-11 items-center rounded-xl border border-white/25 px-4"
              href={`/garage/${vehicleId}/builds`}
            >
              Manage builds
            </Link>
            <Link
              className="inline-flex min-h-11 items-center rounded-xl border border-white/25 px-4"
              href={`/garage/${vehicleId}/costs`}
            >
              Record actual expenses
            </Link>
            <Link
              className="inline-flex min-h-11 items-center rounded-xl border border-white/25 px-4"
              href={`/garage/${vehicleId}/timeline`}
            >
              Vehicle timeline
            </Link>
          </div>
        </aside>
        <RecordSection
          title="Diagnostic history"
          empty="No DTC records."
          rows={passport.diagnostics.map((item) => ({
            title: `${item.code} · ${item.title}`,
            meta: `${capitalize(item.status)} · ${item.mileage.toLocaleString("en-US")} km${item.resolution ? ` · ${item.resolution}` : ""}`,
          }))}
        />
        <RecordSection
          title="Local work notes · unverified"
          empty="No local work notes."
          rows={passport.installStamps.map((item) => ({
            title: item.work,
            meta: `${item.specialist} · ${item.installedAt} · Unverified local entry`,
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

function PassportProfileEditor({
  vehicleId,
  initial,
  message,
  onMessage,
  onSaved,
}: {
  vehicleId: string;
  initial?: PassportProfile;
  message: string;
  onMessage: (value: string) => void;
  onSaved: () => void;
}) {
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const publishOwnerDetails = form.get("publishOwnerDetails") === "on";
    const value = (name: string) =>
      String(form.get(name) ?? "").trim() || undefined;
    const ownerName = value("ownerName");
    const ownerAddress = value("ownerAddress");
    const ownerPhone = value("ownerPhone");
    if (publishOwnerDetails && (!ownerName || !ownerAddress || !ownerPhone)) {
      onMessage(
        "Name, address and phone are required before owner details can be published.",
      );
      return;
    }
    try {
      savePassportProfile(
        {
          ...readPassportProfile(vehicleId, window.localStorage),
          vehicleId,
          ownerName,
          ownerAddress,
          ownerPhone,
          nextInspectionDate: value("nextInspectionDate"),
          insuranceCompany: value("insuranceCompany"),
          insurancePolicyNumber: value("insurancePolicyNumber"),
          publishOwnerDetails,
          includeFullVin: form.get("includeFullVin") === "on",
          publishPhoto: form.get("publishPhoto") === "on",
          publishInsuranceDetails: form.get("publishInsuranceDetails") === "on",
        },
        window.localStorage,
      );
      onMessage(
        "Passport details saved locally. New public links will use this preview.",
      );
      onSaved();
    } catch (caught) {
      onMessage(
        caught instanceof Error
          ? caught.message
          : "Passport details could not be saved.",
      );
    }
  }

  return (
    <section className="no-print mt-5 rounded-[2rem] border border-white/10 bg-[#111111] p-5 sm:p-8">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs tracking-[0.14em] text-white/30 uppercase">
            Document identity
          </p>
          <h2 className="mt-2 text-2xl font-medium">
            Officer check or show-card detail
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/42">
            These details stay in your garage until you create a public
            Passport. Owner identity appears only when the explicit publish
            switch is enabled.
          </p>
        </div>
        <span className="rounded-full border border-amber-300/15 bg-amber-300/6 px-3 py-1.5 text-[10px] text-amber-100/65 uppercase">
          Preview before sharing
        </span>
      </div>
      <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
        <PassportField
          name="ownerName"
          label="Owner name"
          defaultValue={initial?.ownerName}
          placeholder="Full legal or display name"
        />
        <PassportField
          name="ownerPhone"
          label="Owner phone"
          defaultValue={initial?.ownerPhone}
          placeholder="+49 …"
          type="tel"
        />
        <label className="text-xs text-white/45 sm:col-span-2">
          Owner address
          <textarea
            name="ownerAddress"
            defaultValue={initial?.ownerAddress}
            placeholder="Street, postcode and city"
            className="mt-2 min-h-24 w-full rounded-xl border border-white/12 bg-[#0b0b0b] p-4 text-sm text-white placeholder:text-white/20 focus:border-[#e72d45] focus:outline-none"
          />
        </label>
        <PassportField
          name="nextInspectionDate"
          label="Next TÜV / inspection"
          defaultValue={initial?.nextInspectionDate}
          placeholder=""
          type="date"
        />
        <PassportField
          name="insuranceCompany"
          label="Insurance company"
          defaultValue={initial?.insuranceCompany}
          placeholder="Provider name"
        />
        <PassportField
          name="insurancePolicyNumber"
          label="Policy number"
          defaultValue={initial?.insurancePolicyNumber}
          placeholder="Policy reference"
        />
        <div className="grid gap-3 rounded-2xl border border-white/8 p-4 text-sm text-white/58 sm:col-span-2 sm:grid-cols-2">
          <label className="flex min-h-11 items-center gap-3">
            <input
              key={initial?.photoDataUrl ?? "no-photo"}
              name="publishPhoto"
              type="checkbox"
              disabled={!initial?.photoDataUrl}
              defaultChecked={initial?.publishPhoto ?? false}
              className="size-5"
            />
            Include my uploaded photo in exports and new public links
          </label>
          <label className="flex min-h-11 items-center gap-3">
            <input
              name="publishInsuranceDetails"
              type="checkbox"
              defaultChecked={initial?.publishInsuranceDetails ?? false}
              className="size-5"
            />
            Include insurance company and policy number in exports and new
            public links
          </label>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              name="publishOwnerDetails"
              defaultChecked={initial?.publishOwnerDetails}
              className="mt-1 size-4 accent-[#e72d45]"
            />
            <span>
              <strong className="block text-white/80">
                Publish owner details
              </strong>
              <small className="mt-1 block leading-5 text-white/38">
                Name, address and phone will be visible to anyone with a live
                Passport link.
              </small>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              name="includeFullVin"
              defaultChecked={initial?.includeFullVin}
              className="mt-1 size-4 accent-[#e72d45]"
            />
            <span>
              <strong className="block text-white/80">Include full VIN</strong>
              <small className="mt-1 block leading-5 text-white/38">
                Otherwise only the final five characters are displayed.
              </small>
            </span>
          </label>
        </div>
        <div className="flex flex-col-reverse gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
          <p role="status" className="text-xs text-white/50">
            {message}
          </p>
          <button
            type="submit"
            className="min-h-11 rounded-xl bg-[#e72d45] px-5 text-sm font-semibold text-white"
          >
            Save & refresh preview
          </button>
        </div>
      </form>
    </section>
  );
}

function PassportField({
  name,
  label,
  defaultValue,
  placeholder,
  type = "text",
}: {
  name: string;
  label: string;
  defaultValue?: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="text-xs text-white/45">
      {label}
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="mt-2 min-h-12 w-full rounded-xl border border-white/12 bg-[#0b0b0b] px-4 text-sm text-white placeholder:text-white/20 focus:border-[#e72d45] focus:outline-none"
      />
    </label>
  );
}
