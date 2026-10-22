import { brandPalette } from "@/features/ui/brand-palette";
import type { GarageCopy } from "@/features/onboarding/copy";
import type { shareCardData } from "./build-story";

/** Aggregate-only PNG. No owner text or photos enter the canvas. */
export async function createBuildProgressCard(
  data: ReturnType<typeof shareCardData>,
  copy: GarageCopy,
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("canvas");
  const ctx: CanvasRenderingContext2D = context;
  ctx.fillStyle = brandPalette.background;
  ctx.fillRect(0, 0, 1080, 1350);
  ctx.strokeStyle = brandPalette.secondary;
  for (let x = 0; x < 1080; x += 90) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1350);
    ctx.stroke();
  }
  for (let y = 0; y < 1350; y += 90) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1080, y);
    ctx.stroke();
  }
  ctx.fillStyle = brandPalette.primary;
  ctx.font = "500 30px sans-serif";
  ctx.fillText("CAPCAR", 80, 130);
  function wrap(text: string, y: number, size: number, color: string) {
    ctx.font = `500 ${size}px sans-serif`;
    ctx.fillStyle = color;
    let line = "";
    for (const character of text) {
      if (ctx.measureText(line + character).width > 900) {
        ctx.fillText(line, 80, y);
        y += size * 1.3;
        line = "";
      }
      line += character;
    }
    ctx.fillText(line, 80, y);
  }
  wrap(copy.cardTitle, 270, 62, brandPalette.foreground);
  ctx.fillStyle = brandPalette.foreground;
  ctx.font = "500 184px sans-serif";
  ctx.fillText(`${data.progress}%`, 80, 670);
  ctx.fillStyle = brandPalette.secondary;
  ctx.fillRect(80, 740, 920, 12);
  ctx.fillStyle = brandPalette.primary;
  ctx.fillRect(80, 740, (920 * data.progress) / 100, 12);
  wrap(
    `${data.completed} / ${data.total} · ${copy.cardTasks}`,
    850,
    32,
    brandPalette.foreground,
  );
  wrap(copy.cardFooter, 1200, 24, brandPalette.muted);
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("png"))),
      "image/png",
    ),
  );
}
