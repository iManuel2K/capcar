"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { FileText, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  DOCUMENT_BUCKET,
  DOCUMENT_LIMIT,
  documentExtension,
  documentName,
  documentPrefix,
} from "@/features/passport/vehicle-documents";

type Entry = {
  name: string;
};
const button =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/25 px-4 text-sm focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-50";
export function VehicleDocuments({ vehicleId }: { vehicleId: string }) {
  const [open, setOpen] = useState(false);
  if (open) return <DocumentLibrary vehicleId={vehicleId} />;
  return (
    <section className="no-print mt-5 rounded-2xl border border-white/15 p-5 sm:p-7">
      <h2 className="text-xl font-medium">Receipts, photos & documents</h2>
      <p className="mt-3 text-sm leading-6 text-white/70">
        Private evidence for this car. Files stay out of public Passport links.
        Sign in to access your document storage.
      </p>
      <button className={`${button} mt-4`} onClick={() => setOpen(true)}>
        Manage private documents
      </button>
    </section>
  );
}

function DocumentLibrary({ vehicleId }: { vehicleId: string }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [signedOut, setSignedOut] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const lock = useRef(false);
  const request = useRef(0);
  const invalidate = useCallback(() => {
    request.current++;
  }, []);
  const mounted = useRef(true);
  async function context() {
    const client = createClient();
    const { data, error } = await client.auth.getUser();
    if (error || !data.user)
      throw new Error("Sign in to use private document storage.");
    return {
      bucket: client.storage.from(DOCUMENT_BUCKET),
      prefix: documentPrefix(data.user.id, vehicleId),
    };
  }
  const load = useCallback(async () => {
    const current = ++request.current;
    setLoading(true);
    try {
      const client = createClient();
      const { data: auth, error: authError } = await client.auth.getUser();
      if (current !== request.current) return;
      if (authError || !auth.user) {
        setSignedOut(true);
        setEntries([]);
        return;
      }
      setSignedOut(false);
      const { data, error } = await client.storage
        .from(DOCUMENT_BUCKET)
        .list(documentPrefix(auth.user.id, vehicleId), {
          limit: 100,
          sortBy: { column: "created_at", order: "desc" },
        });
      if (current !== request.current) return;
      if (error) throw error;
      setEntries((data ?? []).filter((entry) => entry.id));
      setError("");
    } catch {
      if (current === request.current)
        setError(
          "Documents could not be loaded. Check your connection; the private document storage migration must also be installed.",
        );
    } finally {
      if (current === request.current) setLoading(false);
    }
  }, [vehicleId]);
  useEffect(() => {
    mounted.current = true;
    const timer = setTimeout(() => void load(), 0);
    return () => {
      mounted.current = false;
      invalidate();
      clearTimeout(timer);
    };
  }, [load, invalidate]);
  async function upload(file: File) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (!file.size || file.size > DOCUMENT_LIMIT)
        throw new Error("Files must be between 1 byte and 10 MB.");
      const extension = documentExtension(
        file.type,
        new Uint8Array(await file.slice(0, 12).arrayBuffer()),
      );
      const { bucket, prefix } = await context();
      const { error } = await bucket.upload(
        `${prefix}/${documentName(file.name, extension)}`,
        file,
        { contentType: file.type, upsert: false },
      );
      if (error)
        throw new Error(
          "Upload failed. Check your connection and private storage setup, then try again.",
        );
      if (mounted.current) {
        setMessage(
          "Document saved privately. It is not included in public Passport links.",
        );
        await load();
      }
    } catch (caught) {
      if (mounted.current)
        setError(
          caught instanceof Error
            ? caught.message
            : "Upload failed. Try again.",
        );
    } finally {
      lock.current = false;
      if (mounted.current) setBusy(false);
      if (input.current) input.current.value = "";
    }
  }
  async function download(entry: Entry) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const { bucket, prefix } = await context();
      const { data, error } = await bucket.download(`${prefix}/${entry.name}`);
      if (error || !data)
        throw new Error("Download failed. Sign in again or retry.");
      if (!mounted.current) return;
      const url = URL.createObjectURL(data);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download =
        entry.name.split("--").slice(1).join("--") || entry.name;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
    } catch (caught) {
      if (mounted.current)
        setError(caught instanceof Error ? caught.message : "Download failed.");
    } finally {
      lock.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  async function remove(entry: Entry) {
    if (
      lock.current ||
      !window.confirm(
        "Delete this private document permanently? Keep an original copy before deleting.",
      )
    )
      return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const { bucket, prefix } = await context();
      const { error } = await bucket.remove([`${prefix}/${entry.name}`]);
      if (error) throw error;
      if (mounted.current) {
        setMessage(
          "Document deleted permanently from CapCar storage. Your original file is unchanged.",
        );
        await load();
      }
    } catch {
      if (mounted.current)
        setError("Document could not be deleted. Try again.");
    } finally {
      lock.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  return (
    <section
      aria-label="Private vehicle documents"
      className="no-print mt-5 rounded-2xl border border-white/15 p-5 sm:p-7"
    >
      <h2 className="flex items-center gap-2 text-xl font-medium">
        <FileText aria-hidden="true" className="size-5 text-[#c98f72]" />
        Receipts, photos & documents
      </h2>
      <p className="mt-3 text-sm leading-6 text-white/70">
        Private, account-owned evidence for this car. PDF, JPG, PNG or WebP · up
        to 10 MB per file. These files are not published or printed with your
        Passport. Keep your original copies.
      </p>
      {signedOut ? (
        <p className="mt-4">Sign in to upload or download private documents.</p>
      ) : (
        <div
          className="mt-4 rounded-xl border border-dashed border-white/30 p-4"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            const file = event.dataTransfer.files[0];
            if (file) void upload(file);
          }}
        >
          <input
            ref={input}
            type="file"
            accept="application/pdf,image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
            }}
          />
          <button
            className={button}
            disabled={busy || loading}
            onClick={() => input.current?.click()}
          >
            <Upload aria-hidden="true" className="size-4" />
            {busy ? "Working…" : "Upload document"}
          </button>
          <span className="ml-3 text-sm text-white/65">
            or drop one file here
          </span>
        </div>
      )}
      {loading && (
        <p role="status" className="mt-4">
          Loading private documents…
        </p>
      )}
      {error && (
        <p role="alert" className="mt-4 text-red-200">
          {error}{" "}
          <button
            className={button}
            disabled={busy}
            onClick={() => void load()}
          >
            Retry
          </button>
        </p>
      )}
      <p role="status" className="mt-3 text-sm text-[#a5d8bf]">
        {message}
      </p>
      {!loading && !signedOut && !entries.length && !error && (
        <p className="mt-4 text-white/65">
          Start with the receipt or installation photo for your first
          modification.
        </p>
      )}
      <ul className="mt-4 divide-y divide-white/10">
        {entries.map((entry) => (
          <li
            key={entry.name}
            className="flex flex-wrap items-center justify-between gap-3 py-3"
          >
            <span className="min-w-0 text-sm break-all">
              {entry.name.split("--").slice(1).join("--") || entry.name}
            </span>
            <div className="flex gap-2">
              <button
                className={button}
                disabled={busy}
                onClick={() => void download(entry)}
              >
                Download
              </button>
              <button
                className={button}
                disabled={busy}
                onClick={() => void remove(entry)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      {entries.length === 100 && (
        <p className="mt-3 text-sm">
          Showing the 100 most recent documents. Older files remain in private
          storage.
        </p>
      )}
    </section>
  );
}
