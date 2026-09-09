"use client";

import { useEffect, useRef, useState } from "react";
import { FileDropzone } from "@/components/ui/file-dropzone";
import {
  recordingStore,
  type Recording,
} from "@/features/visualizer/recording-library";

const field =
  "min-h-11 w-full rounded-xl border border-white/25 bg-[#152421] px-3 text-white";
export function RecordingLibrary() {
  const [records, setRecords] = useState<Recording[]>([]);
  const [vehicle, setVehicle] = useState("");
  const [category, setCategory] = useState<Recording["category"]>("exhaust");
  const [setup, setSetup] = useState<Recording["setup"]>("stock");
  const [rights, setRights] = useState<Recording["rights"]>("owned");
  const [confirmed, setConfirmed] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all");
  const lock = useRef(false);
  useEffect(() => {
    let alive = true;
    recordingStore<Recording[]>((store) => store.getAll())
      .then((items) => {
        if (alive) {
          setRecords(items);
          setReady(true);
        }
      })
      .catch(() => {
        if (alive)
          setMessage(
            "Recording storage is unavailable. You can still use the temporary A/B comparison below.",
          );
      });
    return () => {
      alive = false;
    };
  }, []);
  async function receive(file: File) {
    if (lock.current || !confirmed || !vehicle.trim()) return;
    lock.current = true;
    setBusy(true);
    setMessage("");
    try {
      if (
        !/\.(mp3|wav|ogg|m4a)$/i.test(file.name) ||
        file.size === 0 ||
        file.size > 30 * 1024 * 1024
      )
        throw new Error(
          "Choose MP3, WAV, Ogg or M4A between 1 byte and 30 MB.",
        );
      if (records.length >= 20)
        throw new Error(
          "The local library holds up to 20 recordings. Remove a recording first.",
        );
      const record: Recording = {
        id: crypto.randomUUID(),
        name: file.name,
        vehicle: vehicle.trim(),
        category,
        setup,
        rights,
        createdAt: new Date().toISOString(),
        file,
      };
      await recordingStore((store) => store.put(record), true);
      setRecords((items) => [...items, record]);
      setMessage(
        "Recording saved on this device. Not uploaded or publicly licensed.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not save recording.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function remove(id: string) {
    try {
      await recordingStore((store) => store.delete(id), true);
      setRecords((items) => items.filter((item) => item.id !== id));
      setMessage("Local copy removed. Your original file is unchanged.");
    } catch {
      setMessage("Could not remove this recording. Try again.");
    }
  }
  return (
    <section
      className="mb-10 rounded-3xl bg-[#0e2d30] p-5 text-[#e8e6d7] sm:p-8"
      aria-labelledby="recording-library-title"
    >
      <p className="text-xs tracking-widest uppercase">
        Your sound archive / Local only
      </p>
      <h2 id="recording-library-title" className="mt-3 text-3xl font-medium">
        Keep the character.
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6">
        Save your own recordings with vehicle, setup and source permission.
        Files stay in this browser, survive reloads, and are not included in
        Garage sync or account exports. Clearing browser data removes them; keep
        your originals.
      </p>
      <div className="my-6 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm">
          Vehicle and recording context
          <input
            className={field}
            maxLength={160}
            value={vehicle}
            onChange={(event) => setVehicle(event.target.value)}
            placeholder="e.g. 318i · warm idle · 1 m behind car"
          />
        </label>
        <label className="grid gap-2 text-sm">
          Category
          <select
            className={field}
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as Recording["category"])
            }
          >
            {["engine", "exhaust", "intake", "cold-start"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm">
          Setup
          <select
            className={field}
            value={setup}
            onChange={(event) =>
              setSetup(event.target.value as Recording["setup"])
            }
          >
            <option>stock</option>
            <option>modified</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm">
          Source permission
          <select
            className={field}
            value={rights}
            onChange={(event) =>
              setRights(event.target.value as Recording["rights"])
            }
          >
            <option value="owned">I recorded this audio</option>
            <option value="permission">
              I have permission for personal use
            </option>
          </select>
        </label>
      </div>
      <label className="mb-5 flex min-h-11 items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(event) => setConfirmed(event.target.checked)}
          className="size-5"
        />
        I confirm the source permission above. This does not grant public
        distribution rights.
      </label>
      <FileDropzone
        accept=".mp3,.wav,.ogg,.m4a"
        label="Add to sound library"
        description="Up to 30 MB per file · 20 recordings per browser"
        disabled={!ready || busy || !confirmed || !vehicle.trim()}
        onFile={receive}
      />
      <p role="status" className="my-4 text-sm">
        {busy ? "Saving recording…" : message}
      </p>
      <label className="flex flex-wrap items-center gap-3 text-sm">
        Filter recordings
        <select
          className={field + " max-w-48"}
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        >
          {["all", "engine", "exhaust", "intake", "cold-start"].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>
      {ready &&
        !records.some(
          (item) => filter === "all" || item.category === filter,
        ) && (
          <p className="mt-5 text-sm">
            No recordings here yet. Add one above to start your archive.
          </p>
        )}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {records
          .filter((item) => filter === "all" || item.category === filter)
          .map((item) => (
            <RecordingCard
              key={item.id}
              item={item}
              onRemove={() => void remove(item.id)}
            />
          ))}
      </div>
    </section>
  );
}
function RecordingCard({
  item,
  onRemove,
}: {
  item: Recording;
  onRemove: () => void;
}) {
  const player = useRef<HTMLAudioElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const objectUrl = URL.createObjectURL(item.file);
    if (player.current) {
      player.current.src = objectUrl;
      player.current.volume = 0.25;
    }
    return () => URL.revokeObjectURL(objectUrl);
  }, [item.file]);
  return (
    <article className="min-w-0 rounded-2xl border border-white/20 p-4">
      <h3 className="truncate font-medium">{item.name}</h3>
      <p className="mt-2 text-sm">{item.vehicle}</p>
      <p className="my-3 text-xs">
        {item.category} / {item.setup} /{" "}
        {item.rights === "owned"
          ? "Owner-declared recording"
          : "Permission declared"}{" "}
        · unverified
      </p>
      <audio
        ref={player}
        controls
        preload="none"
        aria-label={item.name}
        className="w-full"
        onError={() => setFailed(true)}
        onPlay={() => {
          document.querySelectorAll("audio").forEach((audio) => {
            if (audio !== player.current) audio.pause();
          });
        }}
      />
      {failed && (
        <p role="alert" className="mt-3 text-sm">
          This browser cannot play the file. Keep the original and try another
          format.
        </p>
      )}
      <button
        type="button"
        className="mt-3 min-h-11 underline"
        onClick={onRemove}
      >
        Remove local copy
      </button>
    </article>
  );
}
