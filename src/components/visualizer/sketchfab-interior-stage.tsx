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
import { SketchfabFallback } from "@/components/visualizer/sketchfab-fallback";

import {
  interiorCameraNames,
  loadInteriorCameraPresets,
  saveInteriorCameraPreset,
  type InteriorCamera,
  type InteriorCameraName,
  type InteriorCameraPresets,
} from "@/features/visualizer/interior-camera-storage";
import type { VehicleReference } from "@/features/visualizer/vehicle-reference-catalog";

import {
  loadSketchfab,
  type ViewerApi,
} from "@/features/visualizer/sketchfab-api";

const labels: Record<InteriorCameraName, string> = {
  driver: "Driver",
  dashboard: "Dashboard",
  passenger: "Passenger",
  rear: "Rear seats",
};

const loadViewerScript = loadSketchfab;

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
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const detectBlock = (event: ErrorEvent | PromiseRejectionEvent) => {
      const value = "reason" in event ? event.reason : event.message;
      const errorMessage =
        value instanceof Error ? value.message : String(value ?? "");
      if (
        /ERR_BLOCKED_BY_CLIENT|extension (?:context )?disconnected|Sketchfab/i.test(
          errorMessage,
        )
      ) {
        setStatus("error");
        setMessage("A browser privacy extension blocked the 3D viewer.");
      }
    };
    window.addEventListener("error", detectBlock);
    window.addEventListener("unhandledrejection", detectBlock);
    const timeout = window.setTimeout(() => {
      if (!cancelled) {
        setStatus("error");
        setMessage(
          "Sketchfab did not respond. Retry here or open the model directly.",
        );
      }
    }, 15_000);

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
              window.clearTimeout(timeout);
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
              window.clearTimeout(timeout);
              setStatus("error");
              setMessage(
                "Sketchfab could not initialize. Retry here or open the model directly.",
              );
            }
          },
        });
      })
      .catch(() => {
        if (!cancelled) {
          window.clearTimeout(timeout);
          setStatus("error");
          setMessage(
            "The Sketchfab viewer script was blocked. Check content blockers and retry.",
          );
        }
      });

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      window.removeEventListener("error", detectBlock);
      window.removeEventListener("unhandledrejection", detectBlock);
      apiRef.current = null;
    };
  }, [reference.modelUid, retryKey]);

  function retryViewer() {
    setStatus("loading");
    setMessage("Loading the E90 cabin…");
    setRetryKey((current) => current + 1);
  }

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
    <section className="bg-background overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.34)]">
      <header className="bg-background flex flex-wrap items-center justify-between gap-3 border-b border-white/8 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2 text-sm text-white/65">
          <Armchair className="text-primary size-4" />
          <span>{reference.title} · interactive cabin</span>
        </div>
        <span className="border-primary/20 bg-primary/10 text-primary rounded-full border px-3 py-1 text-xs">
          Real model interior
        </span>
      </header>

      <div className="bg-card relative aspect-[16/10] min-h-[430px] w-full sm:min-h-[560px]">
        <iframe
          key={retryKey}
          ref={iframeRef}
          title={`${reference.title} interactive interior`}
          allow="autoplay; fullscreen; xr-spatial-tracking"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
        {status === "loading" && (
          <div className="bg-background/90 text-muted-foreground absolute inset-0 grid place-items-center p-6 text-center text-sm">
            Loading interactive cabin…
          </div>
        )}
        {status === "error" && (
          <SketchfabFallback reference={reference} onRetry={retryViewer} />
        )}
      </div>

      <div className="bg-background border-t border-white/8 p-4 sm:p-5">
        <div className="flex flex-wrap gap-2">
          {interiorCameraNames.map((name) => (
            <button
              key={name}
              type="button"
              disabled={status !== "ready"}
              onClick={() => recallPreset(name)}
              className={`inline-flex min-h-10 items-center gap-2 rounded-xl border px-3.5 text-sm disabled:opacity-40 ${activePreset === name ? "border-primary/45 bg-primary/12 text-primary" : "text-muted-foreground border-white/10"}`}
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
            className="bg-primary text-primary-foreground inline-flex min-h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold disabled:opacity-40"
          >
            <Save className="size-4" /> Save as {labels[activePreset]}
          </button>
          <button
            type="button"
            disabled={status !== "ready"}
            onClick={resetCamera}
            className="text-muted-foreground inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm disabled:opacity-40"
          >
            <Undo2 className="size-4" /> Reset camera
          </button>
          <span className="text-muted-foreground inline-flex items-center gap-2 text-xs">
            <Rotate3D className="size-3.5" /> Drag, zoom and move through the
            cabin
          </span>
        </div>
        <p
          aria-live="polite"
          className="text-muted-foreground mt-3 flex items-start gap-2 text-xs leading-5"
        >
          <BadgeInfo className="text-primary mt-0.5 size-3.5 shrink-0" />{" "}
          {message}
        </p>
      </div>
    </section>
  );
}
