"use client";
import { useEffect, useRef, useState } from "react";
import { FileDropzone } from "@/components/ui/file-dropzone";
import { AudioComparison } from "./audio-comparison";
import type { Vehicle } from "@/features/vehicles/vehicle-schema";
import {
  recordingsForVehicle,
  soundScenarios,
} from "@/features/visualizer/exhaust-audio";

export function ExhaustSoundStudio({ vehicle }: { vehicle: Vehicle }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [scenario, setScenario] =
    useState<(typeof soundScenarios)[number]>("idle");
  const [configuration, setConfiguration] = useState<"stock" | "modified">(
    "stock",
  );
  const [selectedId, setSelectedId] = useState("");
  const [local, setLocal] = useState<{ url: string; name: string }>();
  const [error, setError] = useState("");
  const matches = recordingsForVehicle(vehicle).filter(
    (record) =>
      record.scenario === scenario && record.configuration === configuration,
  );
  const recording =
    matches.find((record) => record.id === selectedId) ?? matches[0];
  const src = local?.url ?? recording?.audioPath;
  useEffect(
    () => () => {
      if (local) URL.revokeObjectURL(local.url);
    },
    [local],
  );
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = 0.25;
  }, [src]);
  function stop() {
    audioRef.current?.pause();
    setLocal(undefined);
    setError("");
  }
  return (
    <section
      aria-labelledby="exhaust-sound-heading"
      className="mt-5 rounded-[2rem] border border-white/10 bg-[#111111] p-6 sm:p-8"
    >
      <h2 id="exhaust-sound-heading" className="text-2xl font-medium">
        Exhaust sound studio
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-white/60">
        {vehicle.productionYear} {vehicle.make} {vehicle.model} ·{" "}
        {vehicle.engineCode}. Sound belongs to a complete recorded setup, not
        the shape or number of exhaust tips. Start at low volume; recordings
        cannot predict real volume or cabin drone.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <label className="text-sm">
          Compare
          <select
            value={configuration}
            onChange={(event) => {
              stop();
              setConfiguration(event.target.value as typeof configuration);
            }}
            className="mt-2 w-full rounded-xl border border-white/20 bg-[#151916] p-3"
          >
            <option value="stock">Stock setup</option>
            <option value="modified">Modified setup</option>
          </select>
        </label>
        <label className="text-sm">
          Recording scenario
          <select
            value={scenario}
            onChange={(event) => {
              stop();
              setScenario(event.target.value as typeof scenario);
            }}
            className="mt-2 w-full rounded-xl border border-white/20 bg-[#151916] p-3"
          >
            {soundScenarios.map((value) => (
              <option key={value} value={value}>
                {value.replaceAll("-", " ")}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Matching recording
          <select
            disabled={!matches.length}
            value={recording?.id ?? ""}
            onChange={(event) => {
              stop();
              setSelectedId(event.target.value);
            }}
            className="mt-2 w-full rounded-xl border border-white/20 bg-[#151916] p-3 disabled:opacity-50"
          >
            {matches.length ? (
              matches.map((record) => (
                <option key={record.id} value={record.id}>
                  {record.label}
                </option>
              ))
            ) : (
              <option value="">Sound preview unavailable</option>
            )}
          </select>
        </label>
      </div>
      {!local && !recording && (
        <p className="mt-5 rounded-xl border border-amber-300/20 p-4 text-sm text-amber-100/80">
          Sound preview unavailable. No permission-cleared recording matches
          this vehicle, configuration and scenario. No simulated audio is
          substituted.
        </p>
      )}
      {local ? (
        <p className="mt-5 text-sm text-amber-100">
          Personal audition: {local.name}. Unverified; not linked to a product.
          Kept in this tab only.
        </p>
      ) : (
        recording && (
          <div className="mt-5 text-sm text-white/65">
            <p>
              {recording.exhaustSystem} · Other modifications:{" "}
              {recording.otherModifications}
            </p>
            <p>{recording.recordingNotes}</p>
            <p>Rights: {recording.rights}</p>
            <p>
              Rights holder: {recording.permission.rightsHolder} · Distribution
              permission reviewed {recording.permission.reviewedAt.slice(0, 10)}
            </p>
            <a
              className="underline"
              href={recording.source}
              target="_blank"
              rel="noreferrer"
            >
              Recording source
            </a>
          </div>
        )
      )}
      {src && (
        <audio
          key={src}
          ref={audioRef}
          aria-label="Exhaust recording preview"
          controls
          preload="none"
          src={src}
          onError={() =>
            setError(
              "Recording could not be played. Check the file format or source.",
            )
          }
          className="mt-5 w-full"
        />
      )}
      <div className="mt-6 rounded-xl border border-white/10 p-4">
        <p className="text-sm font-medium">
          Audition your own recording locally
        </p>
        <div className="mt-3">
          <FileDropzone
            compact
            accept="audio/mpeg,audio/wav,audio/ogg,audio/mp4,.mp3,.wav,.ogg,.m4a"
            label="Load personal sound clip"
            inputLabel="Audition your own recording locally"
            description="Drag and drop or choose audio · stays in this tab"
            onFile={(file) => {
              if (
                !file.type.startsWith("audio/") ||
                file.size > 30 * 1024 * 1024
              ) {
                setError("Choose an audio file no larger than 30 MB.");
                return;
              }
              audioRef.current?.pause();
              setError("");
              setLocal({ url: URL.createObjectURL(file), name: file.name });
            }}
          />
        </div>
        <p className="mt-3 text-sm text-white/50">
          Nothing is uploaded or saved. Choose recordings you have permission to
          use.
        </p>
        {local && (
          <button
            type="button"
            onClick={stop}
            className="mt-3 rounded-lg border border-white/20 px-4 py-2 text-sm"
          >
            Clear personal recording
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-4 text-sm text-red-200">
          {error}
        </p>
      )}
      <div className="mt-6">
        <AudioComparison />
      </div>
    </section>
  );
}
