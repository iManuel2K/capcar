"use client";
import { useEffect, useRef, useState } from "react";
import { Cable, Gauge } from "lucide-react";
import {
  Elm327,
  decodePid,
  decodeStoredCodes,
  type SerialPortLike,
} from "@/features/diagnostics/elm327";
import { importScan, parseScan } from "@/features/diagnostics/scan-import";
import { announceDiagnosticChange } from "@/features/diagnostics/diagnostic-storage";
import { diagnosticInsightFor } from "@/features/diagnostics/diagnostic-inspector";
import {
  actionClass,
  fieldClass,
} from "@/components/community/community-shell";
export function ObdConnection({
  vehicleId,
  mileage,
}: {
  vehicleId: string;
  mileage: number;
}) {
  const connection = useRef<Elm327 | null>(null);
  const mounted = useRef(true);
  const lock = useRef(false);
  const [connected, setConnected] = useState(false);
  const [busy, setBusy] = useState(false);
  const [baudRate, setBaudRate] = useState(38400);
  const [codes, setCodes] = useState<string[] | null>(null);
  const [live, setLive] = useState<{
    rpm: number | null;
    speed: number | null;
    coolant: number | null;
    time: string;
  }>();
  const [message, setMessage] = useState("");
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      void connection.current?.close();
    };
  }, []);
  async function run(work: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setMessage("");
    try {
      await work();
    } catch (error) {
      await connection.current?.close();
      connection.current = null;
      if (mounted.current) {
        setConnected(false);
        setMessage(
          error instanceof Error ? error.message : "Connection failed.",
        );
      }
    } finally {
      lock.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  return (
    <section className="mb-6 space-y-4 rounded-2xl border border-current/20 p-5">
      <h2 className="flex items-center gap-2 text-xl font-semibold">
        <Cable aria-hidden size={22} /> Connect your OBD adapter
      </h2>
      <p className="max-w-3xl text-sm leading-6">
        Read stored emissions codes and live values from an ELM327 serial
        adapter. Use desktop Chrome or Edge with USB or a paired Bluetooth
        serial port. Wi-Fi, BLE-only adapters and iPhone browsers are not
        supported here. Park safely before connecting.
      </p>
      <div className="flex flex-wrap items-end gap-3">
        {!connected && (
          <label className="text-sm">
            Adapter baud rate
            <select
              className={fieldClass}
              value={baudRate}
              disabled={busy}
              onChange={(e) => setBaudRate(Number(e.target.value))}
            >
              {[9600, 38400, 115200].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
        )}
        <button
          className={actionClass}
          disabled={busy}
          onClick={() =>
            void run(async () => {
              if (connected) {
                await connection.current?.close();
                connection.current = null;
                setConnected(false);
                setCodes(null);
                setLive(undefined);
                return;
              }
              const serial = (
                navigator as Navigator & {
                  serial?: { requestPort(): Promise<SerialPortLike> };
                }
              ).serial;
              if (!serial)
                throw new Error(
                  "This browser cannot connect to serial adapters. Use desktop Chrome/Edge or import a scan below.",
                );
              const port = await serial.requestPort();
              if (!mounted.current) return;
              await port.open({ baudRate });
              const elm = new Elm327(port);
              connection.current = elm;
              if (!mounted.current) {
                await elm.close();
                return;
              }
              await elm.initialize();
              if (mounted.current) {
                setConnected(true);
                setCodes(null);
                setLive(undefined);
              }
            })
          }
        >
          {busy
            ? "Working…"
            : connected
              ? "Disconnect adapter"
              : "Choose adapter"}
        </button>
        <button
          className={actionClass}
          disabled={!connected || busy}
          onClick={() =>
            void run(async () => {
              if (!connection.current) return;
              const values = decodeStoredCodes(
                await connection.current.command("03"),
              );
              if (mounted.current) {
                setCodes(values);
                setMessage(
                  values.length
                    ? `${values.length} stored code(s) received.`
                    : "No stored emissions codes reported. Other modules were not scanned.",
                );
              }
            })
          }
        >
          Read fault codes
        </button>
        <button
          className={actionClass}
          disabled={!connected || busy}
          onClick={() =>
            void run(async () => {
              const elm = connection.current;
              if (!elm) return;
              const rpm = decodePid(await elm.command("010C"), "0C");
              const speed = decodePid(await elm.command("010D"), "0D");
              const coolant = decodePid(await elm.command("0105"), "05");
              if (mounted.current)
                setLive({
                  rpm,
                  speed,
                  coolant,
                  time: new Date().toLocaleTimeString(),
                });
            })
          }
        >
          Read live values
        </button>
      </div>
      {live && (
        <div className="rounded-xl bg-current/5 p-4">
          <p className="flex items-center gap-2">
            <Gauge aria-hidden size={18} />
            {live.time}
          </p>
          <dl className="mt-3 grid grid-cols-3 gap-3">
            {[
              ["RPM", live.rpm],
              ["km/h", live.speed],
              ["Coolant °C", live.coolant],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs">{label}</dt>
                <dd className="text-2xl tabular-nums">{value ?? "—"}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-2 text-xs">
            Manual snapshot · — means not supported or not reported.
          </p>
        </div>
      )}
      {!!codes?.length && (
        <>
          <ul className="space-y-2">
            {codes.map((code) => (
              <li key={code}>
                <strong>{code}</strong> · {diagnosticInsightFor(code).title}
              </li>
            ))}
          </ul>
          <button
            disabled={busy}
            className={actionClass}
            onClick={() => {
              try {
                importScan(
                  parseScan(codes.join("\n")),
                  vehicleId,
                  mileage,
                  localStorage,
                );
                announceDiagnosticChange();
                setMessage("Saved to this vehicle’s diagnostic log.");
                setCodes(null);
              } catch {
                setMessage(
                  "Could not save this scan. Check browser storage and try again.",
                );
              }
            }}
          >
            Save to diagnostic log
          </button>
        </>
      )}
      {message && (
        <p role="status" className="text-sm">
          {message}
        </p>
      )}
      <p className="text-xs opacity-75">
        Read-only connection. Clearing codes and manufacturer-specific modules
        require a supported diagnostic tool.
      </p>
    </section>
  );
}
