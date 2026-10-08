"use client";
import Image from "next/image";
import { configuratorEnglish } from "@/features/visualizer/configurator-english";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useSketchfabViewer } from "@/features/visualizer/use-sketchfab-viewer";
import { moveReferenceCamera } from "@/features/visualizer/reference-camera";
import {
  referenceConfigurationSchema as savedSchema,
  type ReferenceConfiguration,
} from "@/features/visualizer/build-visual-schema";
import {
  type Camera,
  type Material,
} from "@/features/visualizer/sketchfab-api";
export function ReferenceConfigurator({
  id,
  image,
  name,
  storageKey = id,
  english = false,
  savedConfiguration,
  onSaveConfiguration,
  openLabel,
}: {
  id: string;
  image: string;
  name: string;
  storageKey?: string;
  english?: boolean;
  savedConfiguration?: ReferenceConfiguration;
  onSaveConfiguration?: (configuration: ReferenceConfiguration) => void;
  openLabel?: string;
}) {
  const translated = useTranslations("Expansion");
  const studio = useTranslations("StudioPolish");
  const ui = useTranslations("StudioUi");
  const unavailableMessage = studio("materialsUnavailable");
  const t = (key: keyof typeof configuratorEnglish) =>
    english ? configuratorEnglish[key] : translated(key);
  const viewer = useSketchfabViewer(id);
  const { iframe, api, active } = viewer;
  const originals = useRef<Material[]>([]);
  const home = useRef<Camera | undefined>(undefined);
  const ready = viewer.status === "ready";
  const failed = viewer.status === "error";
  const [materials, setMaterials] = useState<Material[]>([]);
  const [material, setMaterial] = useState("");
  const [paints, setPaints] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const key = `capcar.reference.v1.${storageKey}`;
  useEffect(() => {
    if (!ready || !api.current) return;
    let cancelled = false;
    api.current.getCameraLookAt((error, camera) => {
      if (!error && !cancelled) home.current = camera;
    });
    api.current.getMaterialList((error, list) => {
      if (cancelled) return;
      if (error || !Array.isArray(list)) {
        setMessage(unavailableMessage);
        return;
      }
      const editable = list.filter(
        (item) => item.channels?.AlbedoPBR || item.channels?.DiffuseColor,
      );
      originals.current = structuredClone(editable);
      setMaterials(editable);
      setMaterial(String(editable[0]?.id ?? ""));
    });
    return () => {
      cancelled = true;
    };
  }, [ready, api, unavailableMessage]);
  function paint(id: string, color: string) {
    const source = originals.current.find((item) => String(item.id) === id);
    if (!source || !api.current || !/^#[0-9a-f]{6}$/i.test(color)) return;
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
  const transitionTime = () =>
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? 0 : 0.6;
  function reset() {
    originals.current.forEach((item) =>
      api.current?.setMaterial(structuredClone(item), (error) => {
        if (error) setMessage(t("error"));
      }),
    );
    if (home.current)
      api.current?.setCameraLookAt(
        home.current.position,
        home.current.target,
        transitionTime(),
        () => {},
      );
    setPaints({});
    setMessage("");
  }
  function move(action: "left" | "right" | "in" | "out") {
    const current = api.current;
    current?.getCameraLookAt((error, camera) => {
      if (api.current !== current) return;
      if (error || !camera) {
        setMessage(t("error"));
        return;
      }
      const next = moveReferenceCamera(camera, action);
      if (!next) return;
      current.setCameraLookAt(
        next.position,
        next.target,
        transitionTime(),
        (error) => {
          if (error && api.current === current) setMessage(t("error"));
        },
      );
    });
  }
  return (
    <div className="overflow-hidden bg-[#101615] text-[#e8e6d7]">
      <div className="relative h-[340px] sm:h-[540px]">
        {active ? (
          <iframe
            key={viewer.attempt}
            ref={iframe}
            title={name}
            allow="fullscreen; xr-spatial-tracking"
            allowFullScreen
            onError={viewer.fail}
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
                originals.current = [];
                home.current = undefined;
                setMaterials([]);
                setMaterial("");
                viewer.open();
                setMessage("");
                setPaints({});
              }}
            >
              {openLabel ?? t("open3d")}
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
      <div className="space-y-3 border-t border-white/10 bg-[#0e2d30] p-5 sm:p-8">
        {failed && (
          <div
            role="alert"
            className="rounded-xl border border-[#cfaa96]/25 bg-[#cfaa96]/10 p-4 text-sm leading-6"
          >
            <p>{t("viewerError")}</p>
            <a
              href={`https://sketchfab.com/3d-models/${id}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center underline"
            >
              {studio("openSource")} ↗
            </a>
          </div>
        )}
        <p className="max-w-3xl text-sm leading-6 text-[#e8e6d7]/70">
          {ui("controls")}
        </p>
        <p className="max-w-3xl text-xs leading-6 text-[#e8e6d7]/60">
          {t("configNote")}
        </p>
        {ready && (
          <div
            className="flex flex-wrap gap-2"
            aria-label={studio("cameraControls")}
          >
            {(["left", "right", "in", "out"] as const).map((direction) => (
              <button
                type="button"
                key={direction}
                className="min-h-11 rounded-xl border border-white/20 px-4 text-sm transition hover:bg-white/5"
                onClick={() => move(direction)}
              >
                {studio(`camera_${direction}`)}
              </button>
            ))}
          </div>
        )}
        {ready && (
          <div className="flex flex-wrap items-end gap-3">
            <label className="min-w-0 flex-1 text-sm">
              {t("surface")}
              <select
                disabled={!materials.length}
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="mt-1 block min-h-11 w-full max-w-full rounded-xl border border-white/30 bg-[#101615] p-2"
              >
                {!materials.length && (
                  <option value="">{studio("noMaterials")}</option>
                )}
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
              type="button"
              className="min-h-11 rounded-xl border border-white/30 px-3 text-sm"
              onClick={reset}
            >
              {t("reset")}
            </button>
            <button
              type="button"
              className="min-h-11 rounded-xl border border-white/30 px-3 text-sm"
              onClick={() => {
                const current = api.current;
                current?.getCameraLookAt((error, camera) => {
                  if (api.current !== current) return;
                  try {
                    if (error) throw error;
                    const configuration = savedSchema.parse({ paints, camera });
                    if (onSaveConfiguration) onSaveConfiguration(configuration);
                    else
                      localStorage.setItem(key, JSON.stringify(configuration));
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
              type="button"
              className="min-h-11 rounded-xl border border-white/30 px-3 text-sm"
              onClick={() => {
                try {
                  const saved = savedSchema.parse(
                    savedConfiguration ??
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
                      transitionTime(),
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
            type="button"
            onClick={viewer.close}
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
