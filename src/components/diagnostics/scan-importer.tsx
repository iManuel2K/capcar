"use client";
import { useState } from "react";
import {
  importScan,
  parseScan,
  type ScanImport,
} from "@/features/diagnostics/scan-import";
import { announceDiagnosticChange } from "@/features/diagnostics/diagnostic-storage";

export function ScanImporter({
  vehicleId,
  mileage,
}: {
  vehicleId: string;
  mileage: number;
}) {
  const [scan, setScan] = useState<ScanImport>();
  const [message, setMessage] = useState("");
  return (
    <section className="mt-5 rounded-2xl border border-white/15 p-5">
      <h2 className="text-xl font-medium">Import an OBD-II scan</h2>
      <p className="mt-2 text-sm leading-6 text-white/70">
        Import Capcar JSON format into this vehicle. Review before saving;
        existing open codes are skipped. This does not connect to a scanner or
        clear faults.
      </p>
      <a
        href="/examples/obd-scan.json"
        download
        className="my-3 inline-flex min-h-11 items-center underline"
      >
        Download format example
      </a>
      <label className="block text-sm">
        Scan JSON (up to 64 KB)
        <input
          type="file"
          accept=".json,application/json"
          className="mt-3 block w-full"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            setScan(undefined);
            setMessage("");
            if (!file) return;
            try {
              if (file.size > 65536) throw new Error();
              setScan(parseScan(await file.text()));
            } catch {
              setMessage(
                "Invalid scan. Use the example format, valid DTCs and a non-future ISO timestamp.",
              );
            }
          }}
        />
      </label>
      {scan && (
        <div className="mt-4">
          <p>
            {scan.codes.length} unique codes · {scan.scannedAt}
          </p>
          <p className="mt-2 break-words">
            {scan.codes.join(", ") || "No fault codes in this scan."}
          </p>
          <button
            disabled={!scan.codes.length}
            className="mt-4 min-h-11 rounded-xl bg-[#0e2d30] px-5 disabled:opacity-50"
            onClick={() => {
              try {
                const count = importScan(
                  scan,
                  vehicleId,
                  mileage,
                  localStorage,
                );
                announceDiagnosticChange();
                setScan(undefined);
                setMessage(
                  `${count} fault records added to this vehicle. Other open codes were skipped.`,
                );
              } catch {
                setMessage(
                  "Could not save. Existing records have not been replaced; check browser storage and try again.",
                );
              }
            }}
          >
            Import into this vehicle
          </button>
        </div>
      )}
      <p role="status" className="mt-3 text-sm">
        {message}
      </p>
    </section>
  );
}
