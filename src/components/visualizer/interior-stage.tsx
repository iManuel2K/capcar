"use client";

import { Armchair, BadgeInfo } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { BuildVisual } from "@/features/visualizer/build-visual-schema";

type View = "cockpit" | "cabin";

const upholsteryColors = {
  black: "#252a2d",
  tan: "#9a7450",
  red: "#773a3e",
} as const;
const trimColors = {
  aluminum: "#aeb8be",
  wood: "#74513a",
  "piano-black": "#111719",
} as const;
const ambientColors = { off: "transparent", blue: "#438bff", purple: "#9b6cff" } as const;

export function InteriorStage({ visual, label }: { visual: BuildVisual; label: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [view, setView] = useState<View>("cockpit");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const render = () => drawInterior(canvas, visual, view);
    const observer = new ResizeObserver(render);
    observer.observe(canvas);
    render();
    return () => observer.disconnect();
  }, [view, visual]);

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#090c0d]">
      <canvas ref={canvasRef} className="block h-[430px] w-full sm:h-[560px]" aria-label={`${label}, generic interior concept`} />
      <div className="absolute top-4 left-4 flex flex-wrap gap-2">
        <span className="rounded-full border border-[#74a7ff]/25 bg-[#0b1219]/90 px-3 py-1.5 text-xs text-[#a9c7ff]">{label}</span>
        <span className="rounded-full border border-amber-300/20 bg-[#17140b]/90 px-3 py-1.5 text-xs text-amber-100/70">Generic cabin</span>
      </div>
      <div className="absolute right-4 bottom-4 inline-flex rounded-xl border border-white/10 bg-black/70 p-1">
        {(["cockpit", "cabin"] as const).map((candidate) => (
          <button key={candidate} type="button" onClick={() => setView(candidate)} aria-pressed={view === candidate}
            className={`rounded-lg px-3 py-2 text-xs capitalize ${view === candidate ? "bg-white text-black" : "text-white/55"}`}>
            {candidate}
          </button>
        ))}
      </div>
      <div className="absolute bottom-4 left-4 hidden items-center gap-2 text-xs text-white/35 sm:flex">
        <BadgeInfo className="size-3.5" /> Concept preview, not an exact BMW interior
      </div>
    </div>
  );
}

function drawInterior(canvas: HTMLCanvasElement, visual: BuildVisual, view: View) {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(ratio, ratio);
  const sx = width / 1000;
  const sy = height / 600;
  ctx.scale(sx, sy);
  const seat = upholsteryColors[visual.upholstery];
  const trim = trimColors[visual.cabinTrim];
  const ambient = ambientColors[visual.ambientLight];

  const gradient = ctx.createRadialGradient(500, 220, 40, 500, 280, 620);
  gradient.addColorStop(0, "#202a2f");
  gradient.addColorStop(0.55, "#101719");
  gradient.addColorStop(1, "#060809");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1000, 600);

  if (view === "cabin") {
    polygon(ctx, [[120,520],[190,100],[810,100],[880,520]], "#151b1d", "#394145");
    polygon(ctx, [[250,500],[300,265],[700,265],[750,500]], visual.floorMats === "light" ? "#6e6960" : "#171b1d");
    drawSeat(ctx, 280, 325, seat, visual.seatStyle === "sport");
    drawSeat(ctx, 720, 325, seat, visual.seatStyle === "sport");
    drawSeat(ctx, 350, 480, seat, false, 0.72);
    drawSeat(ctx, 650, 480, seat, false, 0.72);
  }

  polygon(ctx, [[90,310],[175,150],[825,150],[910,310],[805,410],[195,410]], "#202729", "#566066");
  polygon(ctx, [[170,165],[255,65],[745,65],[830,165]], "#173044", "#66859d");
  ctx.fillStyle = trim;
  ctx.fillRect(175, 285, 650, 18);
  if (ambient !== "transparent") {
    ctx.save(); ctx.shadowBlur = 18; ctx.shadowColor = ambient; ctx.fillStyle = ambient; ctx.fillRect(180, 310, 640, 5); ctx.restore();
  }

  const screenWidth = visual.cabinScreen === "wide" ? 255 : 150;
  ctx.fillStyle = "#050809"; roundRect(ctx, 500 - screenWidth / 2, 175, screenWidth, 92, 10); ctx.fill();
  ctx.fillStyle = "#74a7ff"; ctx.fillRect(500 - screenWidth / 2 + 14, 192, screenWidth - 28, 3);
  ctx.fillStyle = "#a5b5be"; ctx.font = "13px system-ui"; ctx.fillText("CAPCAR", 500 - screenWidth / 2 + 14, 225);

  const steeringX = visual.drivingSide === "left" ? 292 : 708;
  ctx.strokeStyle = "#a4adb2"; ctx.lineWidth = 18;
  ctx.beginPath(); ctx.ellipse(steeringX, 327, 82, visual.steeringWheel === "flat-bottom" ? 68 : 82, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = "#273034"; ctx.beginPath(); ctx.arc(steeringX, 327, 30, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#69757a"; ctx.lineWidth = 10;
  for (const angle of [-2.6, -.55, 1.57]) { ctx.beginPath(); ctx.moveTo(steeringX,327); ctx.lineTo(steeringX+Math.cos(angle)*70,327+Math.sin(angle)*65); ctx.stroke(); }

  ctx.fillStyle = visual.gearKnob === "sport" ? "#8ba9bf" : "#353f43"; roundRect(ctx, 475, 370, 50, 78, 18); ctx.fill();
  ctx.fillStyle = visual.pedals === "metal" ? "#b5bec2" : "#252b2d";
  ctx.fillRect(steeringX - 42, 448, 28, 52); ctx.fillRect(steeringX + 14, 448, 28, 52);
}

function drawSeat(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, sport: boolean, scale = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
  ctx.fillStyle = color; ctx.strokeStyle = "#758087"; ctx.lineWidth = 3;
  roundRect(ctx, -88, -95, 176, 205, sport ? 38 : 24); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#121719"; roundRect(ctx, -42, -70, 84, sport ? 100 : 72, 25); ctx.fill();
  ctx.restore();
}

function polygon(ctx: CanvasRenderingContext2D, points: number[][], fill: string, stroke?: string) {
  ctx.beginPath(); points.forEach(([x,y], index) => index ? ctx.lineTo(x,y) : ctx.moveTo(x,y)); ctx.closePath();
  ctx.fillStyle = fill; ctx.fill(); if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 3; ctx.stroke(); }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, radius: number) {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, radius);
}
