"use client";

import { ArrowRight, ScanLine, ShieldAlert, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { FileDropzone } from "@/components/ui/file-dropzone";
import { diagnosticInsightFor } from "@/features/diagnostics/diagnostic-inspector";
import {
  importScan,
  parseScan,
  type ScanImport,
} from "@/features/diagnostics/scan-import";
import { announceDiagnosticChange } from "@/features/diagnostics/diagnostic-storage";
import { ObdConnection } from "./obd-connection";

export function ScanImporter({
  vehicleId,
  mileage,
}: {
  vehicleId: string;
  mileage: number;
}) {
  return (
    <>
      <ObdConnection
        key={`adapter-${vehicleId}`}
        vehicleId={vehicleId}
        mileage={mileage}
      />
      <VehicleScanImporter
        key={vehicleId}
        vehicleId={vehicleId}
        mileage={mileage}
      />
    </>
  );
}

function VehicleScanImporter({
  vehicleId,
  mileage,
}: {
  vehicleId: string;
  mileage: number;
}) {
  const [scan, setScan] = useState<ScanImport>();
  const [message, setMessage] = useState("");
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [pasted, setPasted] = useState("");
  const [reading, setReading] = useState(false);
  const generation = useRef(0);
  useEffect(
    () => () => {
      generation.current++;
    },
    [vehicleId],
  );

  function inspectText(text: string) {
    const result = parseScan(text);
    setScan(result);
    setInspectorOpen(true);
  }

  async function inspectFile(file: File) {
    const request = ++generation.current;
    setScan(undefined);
    setMessage("");
    setReading(true);
    try {
      if (file.size > 1024 * 1024)
        throw new Error("Scan must be smaller than 1 MB.");
      const text = await file.text();
      if (request !== generation.current) return;
      inspectText(text);
    } catch (caught) {
      if (request !== generation.current) return;
      setMessage(
        caught instanceof Error
          ? caught.message
          : "CapCar could not read this scan.",
      );
    } finally {
      if (request === generation.current) setReading(false);
    }
  }

  function save() {
    if (!scan) return;
    try {
      const count = importScan(scan, vehicleId, mileage, localStorage);
      announceDiagnosticChange();
      setMessage(
        `${count} fault record${count === 1 ? "" : "s"} added. Existing open codes were skipped.`,
      );
      setInspectorOpen(false);
      setScan(undefined);
    } catch {
      setMessage(
        "Could not save. Existing records were not replaced; check browser storage and try again.",
      );
    }
  }

  return (
    <section className="mt-5 rounded-2xl border border-white/15 bg-[#111111] p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#e72d45]/12 text-[#ff667a]">
          <ScanLine className="size-4" />
        </span>
        <div>
          <h2 className="text-xl font-medium">Smart OBD-II import</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">
            Drop plain text, ELM327 logs, CSV, JSON or BimmerLink exports.
            CapCar cleans the file, extracts valid DTCs and opens the native
            Inspector before anything is saved.
          </p>
        </div>
      </div>
      <details className="mt-4 rounded-xl border border-white/15 p-4">
        <summary className="cursor-pointer py-2 text-sm text-white/80">
          Or paste a scan report
        </summary>
        <form
          className="mt-3 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            generation.current++;
            setReading(false);
            setScan(undefined);
            setMessage("");
            try {
              inspectText(pasted);
            } catch (caught) {
              setMessage(
                caught instanceof Error
                  ? caught.message
                  : "Could not read this scan.",
              );
            }
          }}
        >
          <label className="block text-sm text-white/65">
            Scan text
            <textarea
              value={pasted}
              onChange={(event) => setPasted(event.target.value)}
              maxLength={1048576}
              required
              rows={5}
              spellCheck={false}
              placeholder="Paste fault codes or the complete report from your scanner"
              className="mt-2 w-full rounded-xl border border-white/20 bg-black/20 p-3 font-mono text-sm text-white focus-visible:outline-2 focus-visible:outline-[#8fbcb0]"
            />
          </label>
          <button
            type="submit"
            disabled={!pasted.trim()}
            className="min-h-11 rounded-xl bg-[#0e2d30] px-5 text-sm font-medium text-[#f6eadb] disabled:opacity-40"
          >
            Inspect scan
          </button>
        </form>
      </details>
      <div className="mt-5">
        <FileDropzone
          accept=".txt,.log,.csv,.json,text/plain,text/csv,application/json"
          label="Upload diagnostic scan"
          description="Drag and drop or choose a file · processed locally · up to 1 MB"
          onFile={inspectFile}
        />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-white/35">
        <span>Read-only import · CapCar never clears vehicle faults</span>
        <a href="/examples/obd-scan.json" download className="underline">
          Download sample
        </a>
      </div>
      <p role="status" className="mt-3 text-sm text-white/65">
        {reading ? "Reading scan…" : message}
      </p>
      {scan && !inspectorOpen && (
        <button
          type="button"
          onClick={() => setInspectorOpen(true)}
          className="min-h-11 rounded-xl border border-white/20 px-4 text-sm"
        >
          Review {scan.codes.length} detected codes
        </button>
      )}
      {scan && inspectorOpen && (
        <DiagnosticInspectorDrawer
          scan={scan}
          onClose={() => setInspectorOpen(false)}
          onImport={save}
        />
      )}
    </section>
  );
}

function DiagnosticInspectorDrawer({
  scan,
  onClose,
  onImport,
}: {
  scan: ScanImport;
  onClose: () => void;
  onImport: () => void;
}) {
  const [selectedCode, setSelectedCode] = useState(scan.codes[0]);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const insight = diagnosticInsightFor(selectedCode);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const trigger = document.activeElement;
    document.body.style.overflow = "hidden";
    const dialog = dialogRef.current;
    dialog?.showModal();
    closeRef.current?.focus();
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      if (trigger instanceof HTMLElement && trigger.isConnected)
        trigger.focus();
    };
  }, []);

  const severityClasses = {
    info: "border-sky-300/20 bg-sky-300/8 text-sky-100",
    warning: "border-amber-300/20 bg-amber-300/8 text-amber-100",
    critical: "border-red-300/20 bg-red-300/8 text-red-100",
  }[insight.severity];

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="diagnostic-inspector-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none bg-transparent text-white backdrop:bg-black/70"
    >
      <aside className="absolute top-0 right-0 flex h-full w-full max-w-2xl flex-col border-l border-white/10 bg-[#0b0e0c] shadow-xl">
        <header className="flex items-start justify-between gap-5 border-b border-white/8 p-5 sm:p-7">
          <div>
            <p className="text-xs font-semibold tracking-[0.15em] text-[#ff667a] uppercase">
              CapCar Diagnostic Inspector
            </p>
            <h2
              id="diagnostic-inspector-title"
              className="mt-2 text-2xl font-medium"
            >
              {scan.codes.length} code{scan.codes.length === 1 ? "" : "s"} found
            </h2>
            <p className="mt-2 text-xs text-white/38">
              {formatSource(scan.sourceFormat)} ·{" "}
              {new Date(scan.scannedAt).toLocaleString("en-GB")}
              {scan.duplicateCount
                ? ` · ${scan.duplicateCount} duplicate${scan.duplicateCount === 1 ? "" : "s"} removed`
                : ""}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="grid size-11 shrink-0 place-items-center rounded-xl border border-white/10 text-white/55 hover:bg-white/5 hover:text-white"
            aria-label="Close Inspector"
          >
            <X className="size-4" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5 sm:p-7">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {scan.codes.map((code) => (
              <button
                key={code}
                type="button"
                aria-pressed={selectedCode === code}
                onClick={() => setSelectedCode(code)}
                className={`min-h-10 shrink-0 rounded-xl border px-3 font-mono text-sm ${selectedCode === code ? "border-[#e72d45]/50 bg-[#e72d45]/14 text-white" : "border-white/10 text-white/45"}`}
              >
                {code}
              </button>
            ))}
          </div>
          <article className="mt-5 rounded-[1.75rem] border border-white/10 bg-[#111111] p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-xl font-semibold text-[#ff667a]">
                  {insight.code}
                </p>
                <h3 className="mt-2 text-xl font-medium">{insight.title}</h3>
              </div>
              <span
                className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold tracking-[0.12em] uppercase ${severityClasses}`}
              >
                {insight.severity}
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-white/58">
              {insight.summary}
            </p>
            <InspectorList title="Common symptoms" items={insight.symptoms} />
            <InspectorList
              title="Possible root causes"
              items={insight.causes}
            />
            <div className="mt-6">
              <p className="text-xs font-semibold tracking-[0.12em] text-white/40 uppercase">
                Safe next checks
              </p>
              <ol className="mt-3 grid gap-2">
                {insight.steps.map((step, index) => (
                  <li
                    key={step}
                    className="flex gap-3 rounded-xl border border-white/8 bg-black/10 p-3 text-sm leading-6 text-white/55"
                  >
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white/7 text-[11px] text-white/70">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
            <div className="mt-6">
              <p className="text-xs font-semibold tracking-[0.12em] text-white/40 uppercase">
                Matching parts research
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {insight.partQueries.map((item) => (
                  <Link
                    key={item.query}
                    href={`/parts-search?q=${encodeURIComponent(item.query)}`}
                    className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-sm text-white/65 hover:border-[#e72d45]/35 hover:text-white"
                  >
                    {item.label} <ArrowRight className="size-3.5" />
                  </Link>
                ))}
              </div>
            </div>
          </article>
          <aside className="mt-5 flex gap-3 rounded-2xl border border-amber-300/15 bg-amber-300/6 p-4 text-xs leading-5 text-amber-100/65">
            <ShieldAlert className="mt-0.5 size-4 shrink-0" /> Guidance is a
            reviewed starting point, not a confirmed diagnosis. A flashing
            engine light, overheating, oil-pressure, brake or steering warning
            needs immediate qualified inspection.
          </aside>
        </div>
        <footer className="flex flex-col-reverse gap-2 border-t border-white/8 bg-[#0e1211] p-4 sm:flex-row sm:justify-end sm:p-5">
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 rounded-xl border border-white/10 px-4 text-sm text-white/60"
          >
            Review later
          </button>
          <button
            type="button"
            onClick={onImport}
            className="min-h-11 rounded-xl bg-[#e72d45] px-5 text-sm font-semibold text-white"
          >
            Import {scan.codes.length} code{scan.codes.length === 1 ? "" : "s"}
          </button>
        </footer>
      </aside>
    </dialog>
  );
}

function InspectorList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-6">
      <p className="text-xs font-semibold tracking-[0.12em] text-white/40 uppercase">
        {title}
      </p>
      <ul className="mt-3 grid gap-2 text-sm leading-6 text-white/55 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item} className="rounded-xl border border-white/8 p-3">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function formatSource(source: ScanImport["sourceFormat"]) {
  return {
    "capcar-json": "CapCar JSON",
    json: "JSON export",
    csv: "CSV export",
    elm327: "ELM327 log",
    bimmerlink: "BimmerLink export",
    text: "Plain-text scan",
  }[source];
}
