"use client";
import { deleteOwnListingPhotos } from "@/features/community/delete-listing-photos";
import { deleteOwnVehicleDocuments } from "@/features/passport/delete-vehicle-documents";

import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Cloud,
  CloudDownload,
  CloudUpload,
  KeyRound,
  LoaderCircle,
  LogOut,
  FileJson,
  Sheet,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { AuthStatus } from "@/features/auth/auth-config";
import {
  clearLocalSnapshot,
  applyLocalSnapshot,
  collectLocalSnapshot,
  localSnapshotSchema,
  type LocalSnapshot,
} from "@/features/sync/local-snapshot";
import { GARAGE_SYNC_META_KEY } from "@/features/sync/sync-metadata";
import { ACTIVE_GARAGE_USER_KEY } from "@/components/account/garage-account-boundary";
import { createClient } from "@/lib/supabase/client";
import { csvCell, downloadTextFile } from "@/features/export/download";

export function AccountWorkspace({ status }: { status: AuthStatus }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [userEmail, setUserEmail] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  useEffect(() => {
    if (!status.configured) return;
    void createClient()
      .auth.getUser()
      .then(({ data }) => setUserEmail(data.user?.email));
  }, [status.configured]);

  async function sendMagicLink() {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const requestedNext = new URLSearchParams(window.location.search).get(
        "next",
      );
      const next =
        requestedNext?.startsWith("/") && !requestedNext.startsWith("//")
          ? requestedNext
          : "/garage";
      const callback = new URL("/auth/callback", window.location.origin);
      callback.searchParams.set("next", next);
      const { error: authError } = await createClient().auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: callback.toString(),
          shouldCreateUser: true,
        },
      });
      if (authError) throw authError;
      setMessage("Check your email for the secure sign-in link.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Sign-in failed.");
    } finally {
      setLoading(false);
    }
  }

  async function uploadSnapshot() {
    setLoading(true);
    setError("");
    try {
      const client = createClient();
      const { data } = await client.auth.getUser();
      if (!data.user) throw new Error("Sign in before syncing.");
      const snapshot = collectLocalSnapshot(window.localStorage);
      const { error: syncError } = await client
        .from("garage_snapshots")
        .upsert({
          user_id: data.user.id,
          payload: snapshot,
          updated_at: new Date().toISOString(),
        });
      if (syncError) throw syncError;
      setMessage("Local CapCar data was backed up to your account.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Upload failed.");
    } finally {
      setLoading(false);
    }
  }

  async function restoreSnapshot() {
    if (
      !window.confirm(
        "Restore the cloud snapshot over matching local CapCar records?",
      )
    )
      return;
    setLoading(true);
    setError("");
    try {
      const client = createClient();
      const { data: auth } = await client.auth.getUser();
      if (!auth.user) throw new Error("Sign in before syncing.");
      const { data, error: syncError } = await client
        .from("garage_snapshots")
        .select("payload")
        .eq("user_id", auth.user.id)
        .maybeSingle();
      if (syncError) throw syncError;
      if (!data) throw new Error("No cloud snapshot exists yet.");
      const snapshot = localSnapshotSchema.parse(data.payload) as LocalSnapshot;
      clearLocalSnapshot(window.localStorage);
      applyLocalSnapshot(snapshot, window.localStorage);
      window.location.reload();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Restore failed.");
      setLoading(false);
    }
  }

  async function signOut() {
    setLoading(true);
    setError("");
    try {
      const client = createClient();
      const { data, error: userError } = await client.auth.getUser();
      if (userError) throw userError;
      if (data.user) {
        const snapshot = collectLocalSnapshot(window.localStorage);
        const { error: syncError } = await client
          .from("garage_snapshots")
          .upsert({
            user_id: data.user.id,
            payload: snapshot,
            updated_at: new Date().toISOString(),
          });
        if (syncError) {
          throw new Error(
            "CapCar could not save your latest changes. Your device data was kept and you remain signed in.",
          );
        }
      }
      const { error: signOutError } = await client.auth.signOut();
      if (signOutError) throw signOutError;
      clearDeviceAccountData();
      router.replace("/login");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Sign-out failed.");
      setLoading(false);
    }
  }

  function clearDeviceAccountData() {
    clearLocalSnapshot(window.localStorage);
    window.localStorage.removeItem(ACTIVE_GARAGE_USER_KEY);
    window.localStorage.removeItem(GARAGE_SYNC_META_KEY);
  }

  async function deleteCloudGarage() {
    if (
      !window.confirm(
        "Permanently delete the cloud garage, private documents, shared passports and account activity? Download your original documents first. Your account will stay active.",
      )
    )
      return;
    setLoading(true);
    setError("");
    try {
      const client = createClient();
      await deleteOwnListingPhotos(client);
      await deleteOwnVehicleDocuments(client);
      const { error: deleteError } = await client.rpc(
        "delete_current_user_data",
      );
      if (deleteError) throw deleteError;
      clearDeviceAccountData();
      setMessage("Cloud and device garage data deleted.");
      router.replace("/garage");
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Garage deletion failed.",
      );
      setLoading(false);
    }
  }

  async function deleteAccount() {
    if (deleteConfirmation !== "DELETE") return;
    setLoading(true);
    setError("");
    try {
      const client = createClient();
      await deleteOwnListingPhotos(client);
      await deleteOwnVehicleDocuments(client);
      const { error: deleteError } = await client.rpc("delete_current_user");
      if (deleteError) throw deleteError;
      clearDeviceAccountData();
      await client.auth.signOut({ scope: "local" });
      router.replace("/");
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Account deletion failed.",
      );
      setLoading(false);
    }
  }

  function exportGarageJson() {
    const snapshot = collectLocalSnapshot(window.localStorage);
    downloadTextFile(
      `capcar-garage-${snapshot.capturedAt.slice(0, 10)}.json`,
      JSON.stringify(snapshot, null, 2),
    );
    setMessage("Complete garage JSON downloaded to this device.");
  }

  function exportGarageCsv() {
    const snapshot = collectLocalSnapshot(window.localStorage);
    const rows = [
      ["storage_key", "json_value"],
      ...Object.entries(snapshot.data),
    ];
    downloadTextFile(
      `capcar-garage-${snapshot.capturedAt.slice(0, 10)}.csv`,
      rows.map((row) => row.map(csvCell).join(",")).join("\n"),
      "text/csv",
    );
    setMessage("Complete garage CSV downloaded to this device.");
  }

  return (
    <div className="mx-auto max-w-5xl py-10 sm:py-16">
      <header className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_84%_15%,rgba(231,45,69,0.2),transparent_30%),#111111] p-6 sm:p-10">
        <p className="text-xs font-semibold tracking-[0.15em] text-[#ff667a] uppercase">
          CapCar account
        </p>
        <h1 className="mt-4 text-4xl font-medium tracking-[-0.05em] sm:text-6xl">
          Your garage stays yours.
        </h1>
        <p className="mt-5 max-w-2xl leading-7 text-white/45">
          Create an account or sign in to keep vehicles, maintenance and build
          plans private and available across your devices.
        </p>
      </header>

      <section className="mt-5 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="rounded-[2rem] border border-white/10 bg-[#111111] p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <Cloud className="size-5 text-[#ff667a]" />
            <span
              className={`rounded-full border px-3 py-1.5 text-[10px] uppercase ${status.configured ? "border-emerald-300/20 bg-emerald-300/8 text-emerald-200" : "border-amber-300/20 bg-amber-300/8 text-amber-100/70"}`}
            >
              {status.mode}
            </span>
          </div>
          <h2 className="mt-7 text-2xl font-medium">
            {status.configured ? "Cloud mode ready" : "Local mode active"}
          </h2>
          <p className="mt-3 text-sm leading-6 text-white/40">
            {status.message}
          </p>
          {!status.configured && (
            <div className="mt-6 flex gap-3 rounded-2xl border border-amber-300/15 bg-amber-300/6 p-4 text-xs leading-5 text-white/45">
              <KeyRound className="mt-0.5 size-4 shrink-0 text-amber-200" />
              Add the two public Supabase variables and apply the included
              database migration when you are ready.
            </div>
          )}
        </aside>

        <article className="rounded-[2rem] border border-white/10 bg-[#111111] p-6 sm:p-8">
          {!status.configured ? (
            <div className="flex min-h-72 flex-col items-center justify-center text-center">
              <Cloud className="size-10 text-white/20" />
              <h2 className="mt-5 text-2xl font-medium">
                Nothing to configure today
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-white/40">
                Your current vehicles, builds, guides, visual concepts and
                tuning plans remain stored in this browser.
              </p>
            </div>
          ) : userEmail ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-white/30">Signed in as</p>
                  <p className="mt-1 font-medium">{userEmail}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-white/50"
                >
                  <LogOut className="size-4" /> Sign out
                </button>
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => void uploadSnapshot()}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#e72d45] px-4 text-sm font-semibold text-[#07101d] disabled:opacity-40"
                >
                  <CloudUpload className="size-4" /> Back up local data
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => void restoreSnapshot()}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 text-sm text-white/60 disabled:opacity-40"
                >
                  <CloudDownload className="size-4" /> Restore cloud data
                </button>
              </div>
              <Link
                href="/account/connections"
                className="mt-3 flex min-h-12 items-center justify-between gap-3 rounded-xl border border-white/10 px-4 text-sm text-white/60 hover:text-white"
              >
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="size-4" /> Calendar &amp; mail
                  connections
                </span>
                <span aria-hidden="true">→</span>
              </Link>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-medium">
                Create account or sign in
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/40">
                Enter your email and CapCar will send a secure one-time link. A
                new account is created automatically when needed—no password to
                remember.
              </p>
              <label className="mt-7 block text-xs text-white/35">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2 min-h-12 w-full rounded-xl border border-white/10 bg-[#0d0d0d] px-4 text-sm text-white outline-none"
                />
              </label>
              <button
                type="button"
                disabled={loading || !email.includes("@")}
                onClick={() => void sendMagicLink()}
                className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#e72d45] px-4 text-sm font-semibold text-[#07101d] disabled:opacity-40"
              >
                {loading ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <KeyRound className="size-4" />
                )}{" "}
                Continue with email
              </button>
            </>
          )}
          {message && (
            <p className="mt-5 flex gap-2 rounded-xl border border-emerald-300/15 bg-emerald-300/6 p-4 text-sm text-emerald-100/70">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
              {message}
            </p>
          )}
          {error && (
            <p className="mt-5 flex gap-2 rounded-xl border border-red-300/15 bg-red-300/6 p-4 text-sm text-red-100/70">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              {error}
            </p>
          )}
        </article>
      </section>

      <section className="mt-5 rounded-[2rem] border border-white/10 bg-[#111111] p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs tracking-[0.14em] text-white/30 uppercase">
              Data ownership
            </p>
            <h2 className="mt-2 text-2xl font-medium">
              Take the complete garage with you.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/40">
              Export every local CapCar record—including the wishlist,
              diagnostics, costs and install stamps—without closing your
              account.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={exportGarageJson}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm text-white/60 hover:text-white"
            >
              <FileJson className="size-4" /> Export JSON
            </button>
            <button
              type="button"
              onClick={exportGarageCsv}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm text-white/60 hover:text-white"
            >
              <Sheet className="size-4" /> Export CSV
            </button>
          </div>
        </div>
      </section>

      {status.configured && userEmail && (
        <section className="mt-5 rounded-[2rem] border border-red-300/12 bg-[#140e0e] p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-1 size-5 shrink-0 text-red-200/70" />
            <div className="min-w-0 flex-1">
              <p className="text-xs tracking-[0.14em] text-red-100/45 uppercase">
                Account controls
              </p>
              <h2 className="mt-2 text-2xl font-medium">
                Delete what CapCar stores.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/40">
                Download an export first if you need a copy. Private document
                files are not included in JSON/CSV exports; download them from
                each Vehicle Passport before deleting. Cloud-garage deletion
                keeps the login; account deletion removes the login and all
                account-owned records.
              </p>
              <div className="mt-6 grid gap-5 lg:grid-cols-2">
                <div className="rounded-2xl border border-white/8 p-4">
                  <h3 className="font-medium text-white/75">
                    Garage data only
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-white/35">
                    Deletes the cloud snapshot, shared passports, rate-limit
                    history and recorded affiliate clicks.
                  </p>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => void deleteCloudGarage()}
                    className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-red-200/15 px-4 text-sm text-red-100/65 disabled:opacity-40"
                  >
                    <Trash2 className="size-4" /> Delete garage data
                  </button>
                </div>
                <div className="rounded-2xl border border-red-300/12 p-4">
                  <h3 className="font-medium text-white/75">Entire account</h3>
                  <p className="mt-2 text-xs leading-5 text-white/35">
                    Type DELETE to confirm. This cannot be undone.
                  </p>
                  <input
                    aria-label="Type DELETE to confirm account deletion"
                    value={deleteConfirmation}
                    onChange={(event) =>
                      setDeleteConfirmation(event.target.value)
                    }
                    placeholder="DELETE"
                    className="mt-4 min-h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm outline-none focus:border-red-200/30"
                  />
                  <button
                    type="button"
                    disabled={loading || deleteConfirmation !== "DELETE"}
                    onClick={() => void deleteAccount()}
                    className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl bg-red-800/60 px-4 text-sm font-semibold text-red-50 disabled:opacity-35"
                  >
                    <Trash2 className="size-4" /> Delete account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
