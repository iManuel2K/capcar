"use client";
import Image from "next/image";
import { configuratorEnglish } from "@/features/visualizer/configurator-english";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { z } from "zod";
import {
  loadSketchfab,
  type Camera,
  type Material,
  type ViewerApi,
} from "@/features/visualizer/sketchfab-api";
const savedSchema = z.object({
  paints: z.record(z.string(), z.string().regex(/^#[0-9a-f]{6}$/i)),
  camera: z
    .object({
      position: z.array(z.number().finite()).length(3),
      target: z.array(z.number().finite()).length(3),
    })
    .optional(),
});
export function ReferenceConfigurator({
  id,
  image,
  name,
  storageKey = id,
  english = false,
}: {
  id: string;
  image: string;
  name: string;
  storageKey?: string;
  english?: boolean;
}) {
  const translated = useTranslations("Expansion");
  const t = (key: keyof typeof configuratorEnglish) =>
    english ? configuratorEnglish[key] : translated(key);
  const iframe = useRef<HTMLIFrameElement>(null);
  const api = useRef<ViewerApi | null>(null);
  const originals = useRef<Material[]>([]);
  const home = useRef<Camera | undefined>(undefined);
  const [active, setActive] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [material, setMaterial] = useState("");
  const [paints, setPaints] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const key = `capcar.reference.v1.${storageKey}`;
  useEffect(() => {
    if (!active || !iframe.current) return;
    let cancelled = false;
    const fail = () => {
      if (!cancelled) {
        setFailed(true);
        setActive(false);
        setReady(false);
      }
    };
    const timeout = window.setTimeout(fail, 20000);
    void loadSketchfab()
      .then((Constructor) => {
        if (cancelled || !iframe.current) return;
        new Constructor("1.12.1", iframe.current).init(id, {
          autostart: 1,
          ui_theme: "dark",
          error: fail,
          success: (viewer) => {
            if (cancelled) {
              viewer.stop();
              return;
            }
            api.current = viewer;
            viewer.addEventListener("viewerready", () => {
              if (cancelled) return;
              clearTimeout(timeout);
              setReady(true);
              viewer.getCameraLookAt((error, camera) => {
                if (!error && !cancelled) home.current = camera;
              });
              viewer.getMaterialList((error, list) => {
                if (error || cancelled) return;
                const editable = list.filter(
                  (item) =>
                    item.channels.AlbedoPBR || item.channels.DiffuseColor,
                );
                originals.current = structuredClone(editable);
                setMaterials(editable);
                setMaterial(String(editable[0]?.id ?? ""));
              });
            });
            viewer.start();
          },
        });
      })
      .catch(fail);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
      api.current?.stop();
      api.current = null;
    };
  }, [active, id]);
  function paint(id: string, color: string) {
    const source = originals.current.find((item) => String(item.id) === id);
    if (!source || !api.current) return;
    const next = structuredClone(source);
    const channel = next.channels.AlbedoPBR ?? next.channels.DiffuseColor;
    // Apply a tint to the source texture; retain liveries, lights and trim.
    channel.color = [1, 3, 5].map((start) => {
      const s = parseInt(color.slice(start, start + 2), 16) / 255;
      return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
    channel.enable = true;
    api.current.setMaterial(next, (error) => {
      if (error) setMessage(t("error"));
    });
  }
  return (
    <div className="overflow-hidden rounded-3xl bg-[#101615] text-[#e8e6d7]">
      <div className="relative h-[360px] sm:h-[540px]">
        {active ? (
          <iframe
            ref={iframe}
            title={name}
            allow="fullscreen; xr-spatial-tracking"
            allowFullScreen
            className="h-full w-full border-0"
          />
        ) : (
          <>
            <Image
              src={image}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, 1100px"
              className="object-contain"
            />
            <button
              type="button"
              className="absolute bottom-5 left-1/2 min-h-12 -translate-x-1/2 rounded-xl bg-[#e8e6d7] px-5 font-medium whitespace-nowrap text-[#0e2d30]"
              onClick={() => {
                setFailed(false);
                setActive(true);
                setMessage("");
                setPaints({});
              }}
            >
              {t("open3d")}
            </button>
          </>
        )}
        {active && !ready && (
          <p
            role="status"
            className="absolute top-4 left-4 rounded-xl bg-black/80 p-3"
          >
            {t("loading")}
          </p>
        )}
      </div>
      <div className="space-y-3 border-t border-white/20 p-4">
        {failed && <p role="alert">{t("viewerError")}</p>}
        <p className="max-w-3xl text-sm leading-6">{t("configNote")}</p>
        {ready && (
          <div className="flex flex-wrap items-end gap-3">
            <label className="min-w-0 flex-1 text-sm">
              {t("surface")}
              <select
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="mt-1 block min-h-11 w-full max-w-full rounded-xl border border-white/30 bg-[#101615] p-2"
              >
                {materials.map((item) => (
                  <option key={item.id} value={String(item.id)}>
                    {item.name || String(item.id)}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              {t("tint")}
              <input
                type="color"
                disabled={!material}
                value={paints[material] ?? "#ffffff"}
                onChange={(e) => {
                  const value = e.target.value;
                  setPaints((previous) => ({ ...previous, [material]: value }));
                  paint(material, value);
                }}
                className="mt-1 block h-11 w-16 cursor-pointer rounded-lg"
              />
            </label>
            <button
              className="min-h-11 rounded-xl border border-white/30 px-3 text-sm"
              onClick={() => {
                originals.current.forEach((item) =>
                  api.current?.setMaterial(structuredClone(item), () => {}),
                );
                if (home.current)
                  api.current?.setCameraLookAt(
                    home.current.position,
                    home.current.target,
                    0.6,
                    () => {},
                  );
                setPaints({});
                setMessage("");
              }}
            >
              {t("reset")}
            </button>
            <button
              className="min-h-11 rounded-xl border border-white/30 px-3 text-sm"
              onClick={() => {
                api.current?.getCameraLookAt((error, camera) => {
                  try {
                    if (error) throw error;
                    localStorage.setItem(
                      key,
                      JSON.stringify(savedSchema.parse({ paints, camera })),
                    );
                    setMessage(t("savedLocal"));
                  } catch {
                    setMessage(t("error"));
                  }
                });
              }}
            >
              {t("saveView")}
            </button>
            <button
              className="min-h-11 rounded-xl border border-white/30 px-3 text-sm"
              onClick={() => {
                try {
                  const saved = savedSchema.parse(
                    JSON.parse(localStorage.getItem(key) ?? "null"),
                  );
                  originals.current.forEach((item) =>
                    api.current?.setMaterial(structuredClone(item), () => {}),
                  );
                  Object.entries(saved.paints).forEach(([id, color]) =>
                    paint(id, color),
                  );
                  setPaints(saved.paints);
                  if (saved.camera)
                    api.current?.setCameraLookAt(
                      saved.camera.position,
                      saved.camera.target,
                      0.6,
                      () => {},
                    );
                  setMessage("");
                } catch {
                  setMessage(t("noSaved"));
                }
              }}
            >
              {t("restore")}
            </button>
          </div>
        )}
        {active && (
          <button
            className="min-h-11 text-sm underline"
            onClick={() => {
              setActive(false);
              setReady(false);
            }}
          >
            {t("close3d")}
          </button>
        )}
        <p role="status" className="text-sm">
          {message}
        </p>
      </div>
    </div>
  );
}
