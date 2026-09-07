"use client";

import {
  Armchair,
  BadgeInfo,
  Camera,
  Rotate3D,
  Save,
  Undo2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  interiorCameraNames,
  loadInteriorCameraPresets,
  saveInteriorCameraPreset,
  type InteriorCamera,
  type InteriorCameraName,
  type InteriorCameraPresets,
} from "@/features/visualizer/interior-camera-storage";
import type { VehicleReference } from "@/features/visualizer/vehicle-reference-catalog";

type ViewerApi = {
  start: () => void;
  addEventListener: (event: "viewerready", listener: () => void) => void;
  getCameraLookAt: (
    callback: (error: unknown, camera: InteriorCamera) => void,
  ) => void;
  setCameraLookAt: (
    position: number[],
    target: number[],
    duration?: number,
  ) => void;
  setNavigationMode?: (
    mode: "orbit" | "fps",
    callback?: (error?: unknown) => void,
  ) => void;
};

type SketchfabClient = {
  init: (uid: string, options: Record<string, unknown>) => void;
};

declare global {
  interface Window {
    Sketchfab?: new (
      version: string,
      iframe: HTMLIFrameElement,
    ) => SketchfabClient;
  }
}

const labels: Record<InteriorCameraName, string> = {
  driver: "Driver",
  dashboard: "Dashboard",
  passenger: "Passenger",
  rear: "Rear seats",
};

let viewerScriptPromise: Promise<void> | undefined;

function loadViewerScript() {
  if (window.Sketchfab) return Promise.resolve();
  if (viewerScriptPromise) return viewerScriptPromise;
  viewerScriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Sketchfab Viewer API could not load."));
    document.head.appendChild(script);
  });
  return viewerScriptPromise;
}

export function SketchfabInteriorStage({
  reference,
}: {
  reference: VehicleReference;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const apiRef = useRef<ViewerApi | null>(null);
  const defaultCameraRef = useRef<InteriorCamera | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [activePreset, setActivePreset] =
    useState<InteriorCameraName>("driver");
  const [presets, setPresets] = useState<InteriorCameraPresets>({});
  const [message, setMessage] = useState("Loading the E90 cabin…");

  useEffect(() => {
    let cancelled = false;

    void loadViewerScript()
      .then(() => {
        if (cancelled || !iframeRef.current || !window.Sketchfab) return;
        const client = new window.Sketchfab("1.12.1", iframeRef.current);
        client.init(reference.modelUid, {
          autostart: 1,
          preload: 1,
          ui_theme: "dark",
          ui_color: "E72D45",
          ui_infos: 0,
          transparent: 0,
          success(api: ViewerApi) {
            apiRef.current = api;
            api.start();
            api.addEventListener("viewerready", () => {
              if (cancelled) return;
              api.getCameraLookAt((error, camera) => {
                if (!error) defaultCameraRef.current = camera;
              });
              api.setNavigationMode?.("fps");
              const saved = loadInteriorCameraPresets(
                reference.modelUid,
                window.localStorage,
              );
              setPresets(saved);
              setStatus("ready");
              if (saved.driver) {
                api.setCameraLookAt(
                  saved.driver.position,
                  saved.driver.target,
                  0,
                );
                setMessage(
                  "Driver view restored. Drag to look around the cabin.",
                );
              } else {
                setMessage(
                  "Move into the cabin, choose a view name, then save it once.",
                );
              }
            });
          },
          error() {
            if (!cancelled) {
              setStatus("error");
              setMessage("The interactive cabin could not load.");
            }
          },
        });
      })
      .catch(() => {
        if (!cancelled) {
          setStatus("error");
          setMessage("The interactive cabin could not load.");
        }
      });

    return () => {
      cancelled = true;
      apiRef.current = null;
    };
  }, [reference.modelUid]);

  function recallPreset(name: InteriorCameraName) {
    setActivePreset(name);
    const camera = presets[name];
    if (!camera || !apiRef.current) {
      setMessage(
        `${labels[name]} is not saved yet. Position the camera, then save it.`,
      );
      return;
    }
    apiRef.current.setCameraLookAt(camera.position, camera.target, 1);
    setMessage(`${labels[name]} view restored.`);
  }

  function saveCurrentCamera() {
    const api = apiRef.current;
    if (!api) return;
    api.getCameraLookAt((error, camera) => {
      if (error) {
        setMessage("Camera position could not be saved. Try again.");
        return;
      }
      setPresets(
        saveInteriorCameraPreset(
          reference.modelUid,
          activePreset,
          camera,
          window.localStorage,
        ),
      );
      setMessage(`${labels[activePreset]} view saved on this device.`);
    });
  }

  function resetCamera() {
    const camera = defaultCameraRef.current;
    if (!camera || !apiRef.current) return;
    apiRef.current.setCameraLookAt(camera.position, camera.target, 1);
    setMessage(
      "Exterior camera restored. Move into the cabin to set another view.",
    );
  }

  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#090909] shadow-[0_24px_80px_rgba(0,0,0,0.34)]">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 bg-[#090909] px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2 text-sm text-white/65">
          <Armchair className="size-4 text-[#ff667a]" />
          <span>{reference.title} · interactive cabin</span>
        </div>
        <span className="rounded-full border border-[#e72d45]/20 bg-[#e72d45]/10 px-3 py-1 text-xs text-[#ff8a9a]">
          Real model interior
        </span>
      </header>

      <div className="relative aspect-[16/10] min-h-[430px] w-full bg-[#1c1f20] sm:min-h-[560px]">
        <iframe
          ref={iframeRef}
          title={`${reference.title} interactive interior`}
          allow="autoplay; fullscreen; xr-spatial-tracking"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
        {status !== "ready" && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center bg-[#090909]/85 text-sm text-white/45">
            {status === "loading"
              ? "Loading interactive cabin…"
              : "Cabin unavailable"}
          </div>
        )}
      </div>

      <div className="border-t border-white/8 bg-[#090909] p-4 sm:p-5">
        <div className="flex flex-wrap gap-2">
          {interiorCameraNames.map((name) => (
            <button
              key={name}
              type="button"
              disabled={status !== "ready"}
              onClick={() => recallPreset(name)}
              className={`inline-flex min-h-10 items-center gap-2 rounded-xl border px-3.5 text-sm disabled:opacity-40 ${activePreset === name ? "border-[#e72d45]/45 bg-[#e72d45]/12 text-[#bad1ff]" : "border-white/10 text-white/55"}`}
            >
              <Camera className="size-3.5" />
              {labels[name]}
              {presets[name] && (
                <span
                  className="size-1.5 rounded-full bg-emerald-300"
                  aria-label="Saved"
                />
              )}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={status !== "ready"}
            onClick={saveCurrentCamera}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#e72d45] px-4 text-sm font-semibold text-[#07101d] disabled:opacity-40"
          >
            <Save className="size-4" /> Save as {labels[activePreset]}
          </button>
          <button
            type="button"
            disabled={status !== "ready"}
            onClick={resetCamera}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm text-white/55 disabled:opacity-40"
          >
            <Undo2 className="size-4" /> Reset camera
          </button>
          <span className="inline-flex items-center gap-2 text-xs text-white/35">
            <Rotate3D className="size-3.5" /> Drag, zoom and move through the
            cabin
          </span>
        </div>
        <p
          aria-live="polite"
          className="mt-3 flex items-start gap-2 text-xs leading-5 text-white/40"
        >
          <BadgeInfo className="mt-0.5 size-3.5 shrink-0 text-[#ff667a]" />{" "}
          {message}
        </p>
      </div>
    </section>
  );
}
