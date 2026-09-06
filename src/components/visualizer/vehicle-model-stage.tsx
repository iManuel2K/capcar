"use client";

import {
  Box,
  CheckCircle2,
  LoaderCircle,
  Minus,
  Orbit,
  Plus,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { accessoryGeometry, type Surface } from "@/features/visualizer/accessory-geometry";
import type { BuildVisual } from "@/features/visualizer/build-visual-schema";
import {
  projectVector,
  rotateVector,
  type OrbitCamera,
} from "@/features/visualizer/model-projection";
import {
  vehicleModelSchema,
  type Vector3,
  type VehicleModel,
} from "@/features/visualizer/vehicle-model-schema";
import type { Vehicle } from "@/features/vehicles/vehicle-schema";

const paints: Record<BuildVisual["paint"], string> = {
  "factory-black": "#242a2d",
  "alpine-white": "#dddcd4",
  "estoril-blue": "#2870c6",
  "deep-green": "#31594c",
};

const initialCamera: OrbitCamera = {
  yaw: -0.68,
  pitch: 0.16,
  zoom: 1,
};

export function VehicleModelStage({
  vehicle,
  visual,
  label,
}: {
  vehicle: Vehicle;
  visual: BuildVisual;
  label: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<
    | {
        x: number;
        y: number;
        yaw: number;
        pitch: number;
      }
    | undefined
  >(undefined);
  const [model, setModel] = useState<VehicleModel>();
  const [camera, setCamera] = useState(initialCamera);
  const [viewport, setViewport] = useState({ width: 900, height: 520 });
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function loadModel() {
      try {
        const response = await fetch("/api/visualizer/model", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            vehicle: {
              vin: vehicle.vin,
              make: vehicle.make,
              model: vehicle.model,
              productionYear: vehicle.productionYear,
              platform: vehicle.platform,
              bodyStyle: vehicle.bodyStyle,
              engineCode: vehicle.engineCode,
              transmission: vehicle.transmission,
            },
          }),
          signal: controller.signal,
        });
        const payload = (await response.json()) as unknown;
        if (!response.ok) {
          const message =
            typeof payload === "object" && payload && "error" in payload
              ? String(payload.error)
              : "Vehicle model could not be loaded.";
          throw new Error(message);
        }
        setModel(vehicleModelSchema.parse(payload));
      } catch (caught) {
        if (!controller.signal.aborted)
          setError(
            caught instanceof Error
              ? caught.message
              : "Vehicle model could not be loaded.",
          );
      }
    }
    void loadModel();
    return () => controller.abort();
  }, [
    vehicle.bodyStyle,
    vehicle.engineCode,
    vehicle.make,
    vehicle.model,
    vehicle.platform,
    vehicle.productionYear,
    vehicle.transmission,
    vehicle.vin,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      setViewport({
        width: Math.max(320, Math.round(entry.contentRect.width)),
        height: Math.max(360, Math.round(entry.contentRect.height)),
      });
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !model) return;
    drawVehicle(canvas, model, visual, camera, viewport);
  }, [camera, model, viewport, visual]);

  function setPreset(yaw: number, pitch = 0.08) {
    setCamera((current) => ({ ...current, yaw, pitch }));
  }

  return (
    <article className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a0d0c]">
      <div className="relative h-[520px] min-h-[420px] touch-none sm:h-[620px]">
        <canvas
          ref={canvasRef}
          className="size-full cursor-grab active:cursor-grabbing"
          aria-label={`${label} interactive three-dimensional vehicle model`}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            dragRef.current = {
              x: event.clientX,
              y: event.clientY,
              yaw: camera.yaw,
              pitch: camera.pitch,
            };
          }}
          onPointerMove={(event) => {
            const drag = dragRef.current;
            if (!drag) return;
            setCamera((current) => ({
              ...current,
              yaw: drag.yaw + (event.clientX - drag.x) * 0.009,
              pitch: Math.max(
                -0.18,
                Math.min(0.42, drag.pitch + (event.clientY - drag.y) * 0.004),
              ),
            }));
          }}
          onPointerUp={() => {
            dragRef.current = undefined;
          }}
          onPointerCancel={() => {
            dragRef.current = undefined;
          }}
          onWheel={(event) => {
            event.preventDefault();
            setCamera((current) => ({
              ...current,
              zoom: Math.max(
                0.72,
                Math.min(1.38, current.zoom - event.deltaY * 0.0008),
              ),
            }));
          }}
        />

        <div className="pointer-events-none absolute inset-x-5 top-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-[10px] tracking-[0.12em] text-white/55 uppercase backdrop-blur-md">
              {label}
            </span>
            <p className="mt-3 text-xs text-white/30">
              Drag to orbit · scroll to zoom
            </p>
          </div>
          {model && (
            <span
              className={`rounded-full border px-3 py-1.5 text-[10px] uppercase backdrop-blur-md ${model.accuracy === "dimensionally-verified" ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-100" : "border-amber-300/20 bg-black/35 text-amber-100/70"}`}
            >
              {model.accuracy.replace("-", " ")}
            </span>
          )}
        </div>

        {!model && !error && (
          <div className="absolute inset-0 grid place-items-center text-sm text-white/35">
            <span className="flex items-center gap-2">
              <LoaderCircle className="size-4 animate-spin" /> Loading model…
            </span>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 grid place-items-center px-6 text-center text-sm text-red-100/70">
            <span className="max-w-md">
              <ShieldAlert className="mx-auto mb-3 size-6" /> {error}
            </span>
          </div>
        )}

        <div className="absolute right-5 bottom-5 flex items-center gap-2 rounded-2xl border border-white/10 bg-black/40 p-2 backdrop-blur-md">
          <Control label="Front" onClick={() => setPreset(0)} />
          <Control label="Side" onClick={() => setPreset(Math.PI / 2)} />
          <Control label="Rear" onClick={() => setPreset(Math.PI)} />
          <button
            type="button"
            title="Reset camera"
            onClick={() => setCamera(initialCamera)}
            className="grid size-9 place-items-center rounded-lg text-white/45 hover:bg-white/8 hover:text-white"
          >
            <RotateCcw className="size-4" />
          </button>
          <button
            type="button"
            title="Zoom out"
            onClick={() =>
              setCamera((current) => ({
                ...current,
                zoom: Math.max(0.72, current.zoom - 0.1),
              }))
            }
            className="grid size-9 place-items-center rounded-lg text-white/45 hover:bg-white/8 hover:text-white"
          >
            <Minus className="size-4" />
          </button>
          <button
            type="button"
            title="Zoom in"
            onClick={() =>
              setCamera((current) => ({
                ...current,
                zoom: Math.min(1.38, current.zoom + 0.1),
              }))
            }
            className="grid size-9 place-items-center rounded-lg text-white/45 hover:bg-white/8 hover:text-white"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      {model && (
        <footer className="grid gap-3 border-t border-white/8 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="flex items-start gap-3">
            {model.accuracy === "dimensionally-verified" ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-200" />
            ) : (
              <Box className="mt-0.5 size-4 shrink-0 text-[#8ab7ff]" />
            )}
            <div>
              <p className="text-sm text-white/65">{model.provider}</p>
              <p className="mt-1 text-xs text-white/30">
                {model.dimensions.length} × {model.dimensions.width} ×{" "}
                {model.dimensions.height} mm · revision {model.revision}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 text-xs text-white/30">
            <Orbit className="size-4" /> {model.vertices.length} vertices ·{" "}
            {model.faces.length} surfaces
          </span>
        </footer>
      )}
    </article>
  );
}

function Control({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-9 rounded-lg px-3 text-xs text-white/45 hover:bg-white/8 hover:text-white sm:block"
    >
      {label}
    </button>
  );
}

function drawVehicle(
  canvas: HTMLCanvasElement,
  model: VehicleModel,
  visual: BuildVisual,
  camera: OrbitCamera,
  viewport: { width: number; height: number },
) {
  const context = canvas.getContext("2d");
  if (!context) return;
  const ratio = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(viewport.width * ratio);
  canvas.height = Math.round(viewport.height * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, viewport.width, viewport.height);

  const background = context.createRadialGradient(
    viewport.width * 0.5,
    viewport.height * 0.66,
    20,
    viewport.width * 0.5,
    viewport.height * 0.66,
    viewport.width * 0.62,
  );
  background.addColorStop(0, "#17221f");
  background.addColorStop(0.45, "#101614");
  background.addColorStop(1, "#080b0a");
  context.fillStyle = background;
  context.fillRect(0, 0, viewport.width, viewport.height);

  context.save();
  context.translate(0, viewport.height * 0.055);
  context.fillStyle = "rgba(0,0,0,.42)";
  context.beginPath();
  context.ellipse(
    viewport.width / 2,
    viewport.height * 0.72,
    viewport.width * 0.31 * camera.zoom,
    viewport.height * 0.055,
    0,
    0,
    Math.PI * 2,
  );
  context.fill();

  const drop =
    visual.stance === "low"
      ? model.dimensions.height * 0.07
      : visual.stance === "sport"
        ? model.dimensions.height * 0.04
        : 0;
  const centeredVertices = model.vertices.map(
    ([x, y, z]) => [x, y - model.dimensions.height / 2 - drop, z] as Vector3,
  );
  const surfaces: Surface[] = [
    ...model.faces.map(face => ({ points: face.indices.map(index => centeredVertices[index]), color: materialColor(face.material, visual), group: "body" })),
    ...accessoryGeometry(model, visual),
  ];
  const sorted = surfaces.map(surface => ({
    ...surface,
    depth: surface.points.reduce((total, point) => total + rotateVector(point, camera)[2], 0) / surface.points.length,
  })).sort((a,b) => a.depth - b.depth);
  for (const surface of sorted) {
    const points = surface.points.map(point => projectVector(point, camera, viewport, model.dimensions.length));
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    for (const point of points.slice(1)) context.lineTo(point.x, point.y);
    context.closePath();
    context.fillStyle = surface.color;
    context.fill();
    context.strokeStyle = "rgba(255,255,255,.07)";
    context.lineWidth = .7;
    context.stroke();
  }
  context.restore();
}

function materialColor(
  material: VehicleModel["faces"][number]["material"],
  visual: BuildVisual,
) {
  if (material === "body") return paints[visual.paint];
  if (material === "glass") return "rgba(25,38,46,.92)";
  if (material === "trim") return "#090c0c";
  if (material === "light-front") return "rgba(219,238,255,.92)";
  return visual.lighting === "dark" ? "#3c151b" : "#b9313d";
}
