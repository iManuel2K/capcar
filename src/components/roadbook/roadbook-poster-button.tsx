"use client";

import { Download } from "lucide-react";
import { useState } from "react";

import type { RoadbookVisitRecord } from "@/features/roadbook/roadbook-schema";
import type { Vehicle } from "@/features/vehicles/vehicle-schema";

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = source;
  });
}

function drawTrackedRoutes(
  context: CanvasRenderingContext2D,
  visits: RoadbookVisitRecord[],
) {
  const coordinateGroups = visits.map((visit) =>
    visit.routeGeoJson?.coordinates?.length
      ? visit.routeGeoJson.coordinates
      : [[visit.longitude, visit.latitude] as [number, number]],
  );
  const points = coordinateGroups.flat();
  if (!points.length) return;
  const lngs = points.map(([lng]) => lng);
  const lats = points.map(([, lat]) => lat);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const width = Math.max(maxLng - minLng, 0.05);
  const height = Math.max(maxLat - minLat, 0.05);
  const position = ([lng, lat]: [number, number]) => ({
    x: 110 + ((lng - minLng) / width) * 860,
    y: 980 - ((lat - minLat) / height) * 430,
  });

  context.save();
  context.lineCap = "round";
  context.lineJoin = "round";
  coordinateGroups.forEach((coordinates, index) => {
    context.beginPath();
    coordinates.forEach((coordinate, pointIndex) => {
      const point = position(coordinate);
      if (pointIndex === 0) context.moveTo(point.x, point.y);
      else context.lineTo(point.x, point.y);
    });
    context.strokeStyle = index === 0 ? "#e72d45" : "rgba(244,245,242,.48)";
    context.lineWidth = index === 0 ? 7 : 4;
    context.stroke();
    const lastCoord = coordinates[coordinates.length - 1];
    if (lastCoord) {
      const last = position(lastCoord);
      context.beginPath();
      context.arc(last.x, last.y, 8, 0, Math.PI * 2);
      context.fillStyle = "#f4f5f2";
      context.fill();
    }
  });
  context.restore();
}

export async function renderRoadbookPoster(
  vehicle: Vehicle,
  visits: RoadbookVisitRecord[],
) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Poster rendering is unavailable.");

  context.fillStyle = "#09100d";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = "rgba(244,245,242,.06)";
  context.lineWidth = 1;
  for (let x = 60; x < 1080; x += 60) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, 1350);
    context.stroke();
  }
  for (let y = 60; y < 1350; y += 60) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(1080, y);
    context.stroke();
  }

  context.fillStyle = "#e72d45";
  context.font = "700 24px Arial";
  context.fillText("CAPCAR ROADBOOK", 72, 92);
  context.fillStyle = "#f4f5f2";
  context.font = "500 76px Arial";
  context.fillText("Roads that shaped", 72, 190);
  context.fillText("this build.", 72, 278);
  context.fillStyle = "rgba(244,245,242,.55)";
  context.font = "400 27px Arial";
  context.fillText(
    `${vehicle.productionYear} ${vehicle.make} ${vehicle.model} · ${vehicle.platform}`,
    76,
    334,
  );

  if (vehicle.imageUrl) {
    try {
      const image = await loadImage(vehicle.imageUrl);
      const ratio = Math.max(
        900 / image.naturalWidth,
        360 / image.naturalHeight,
      );
      const width = image.naturalWidth * ratio;
      const height = image.naturalHeight * ratio;
      context.save();
      context.beginPath();
      if (typeof context.roundRect === "function") {
        context.roundRect(72, 385, 936, 360, 34);
      } else {
        context.rect(72, 385, 936, 360);
      }
      context.clip();
      context.drawImage(
        image,
        72 + (936 - width) / 2,
        385 + (360 - height) / 2,
        width,
        height,
      );
      context.restore();
      context.fillStyle = "rgba(9,16,13,.22)";
      context.fillRect(72, 385, 936, 360);
    } catch {
      context.fillStyle = "#111a16";
      context.fillRect(72, 385, 936, 360);
    }
  }

  drawTrackedRoutes(context, visits);
  context.fillStyle = "#f4f5f2";
  context.font = "600 30px Arial";
  context.fillText(
    `${visits.length} recorded ${visits.length === 1 ? "drive" : "drives"}`,
    72,
    1085,
  );
  context.fillStyle = "rgba(244,245,242,.5)";
  context.font = "400 23px Arial";
  visits.slice(0, 4).forEach((visit, index) => {
    context.fillText(
      `${visit.visitedAt}  ·  ${visit.venueName}`,
      72,
      1140 + index * 38,
    );
  });
  context.fillStyle = "#f4f5f2";
  context.font = "700 24px Arial";
  context.fillText("FROM PLAN TO ROAD. NO GUESSWORK.", 72, 1300);

  const link = document.createElement("a");
  link.download = `capcar-roadbook-${vehicle.make}-${vehicle.model}.png`
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-");
  link.href = canvas.toDataURL("image/png");
  link.click();
}

export function RoadbookPosterButton({
  vehicle,
  visits,
  label,
  emptyLabel,
}: {
  vehicle?: Vehicle;
  visits: RoadbookVisitRecord[];
  label: string;
  emptyLabel: string;
}) {
  const [busy, setBusy] = useState(false);
  const eligibleVisits = vehicle
    ? visits.filter((visit) => visit.vehicleId === vehicle.id)
    : [];
  return (
    <button
      type="button"
      disabled={!vehicle || !eligibleVisits.length || busy}
      title={!eligibleVisits.length ? emptyLabel : undefined}
      onClick={async () => {
        if (!vehicle || !eligibleVisits.length) return;
        setBusy(true);
        try {
          await renderRoadbookPoster(vehicle, eligibleVisits);
        } finally {
          setBusy(false);
        }
      }}
      className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/12 bg-[#09100d]/88 px-4 text-xs font-semibold text-white/72 shadow-xl backdrop-blur-xl transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
    >
      <Download aria-hidden="true" className="size-4" />
      {label}
    </button>
  );
}
