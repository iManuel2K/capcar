export type Material = {
  id: number;
  name: string;
  channels: Record<
    string,
    { enable?: boolean; color?: number[]; factor?: number; texture?: unknown }
  >;
};
export type Camera = {
  position: [number, number, number];
  target: [number, number, number];
};
export type ViewerApi = {
  setNavigationMode?: (
    mode: "orbit" | "fps",
    callback?: (error?: unknown) => void,
  ) => void;
  start: () => void;
  stop: () => void;
  addEventListener: (name: string, callback: () => void) => void;
  getMaterialList: (
    callback: (error: unknown, materials: Material[]) => void,
  ) => void;
  setMaterial: (material: Material, callback: (error: unknown) => void) => void;
  getCameraLookAt: (callback: (error: unknown, camera: Camera) => void) => void;
  setCameraLookAt: (
    position: number[],
    target: number[],
    duration?: number,
    callback?: (error: unknown) => void,
  ) => void;
};
type Constructor = new (
  version: string,
  iframe: HTMLIFrameElement,
) => {
  init: (
    id: string,
    options: {
      [key: string]: unknown;
      success: (api: ViewerApi) => void;
      error: () => void;
      autostart: number;
      ui_theme: string;
    },
  ) => void;
};
declare global {
  interface Window {
    Sketchfab?: Constructor;
  }
}
let pending: Promise<Constructor> | undefined;
export function loadSketchfab(): Promise<Constructor> {
  if (window.Sketchfab) return Promise.resolve(window.Sketchfab);
  if (pending) return pending;
  pending = new Promise<Constructor>((resolve, reject) => {
    const script = document.createElement("script");
    const fail = () => {
      clearTimeout(timer);
      script.remove();
      pending = undefined;
      reject(new Error("Viewer unavailable"));
    };
    const timer = window.setTimeout(fail, 12000);
    script.src = "https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js";
    script.async = true;
    script.onload = () => {
      clearTimeout(timer);
      if (window.Sketchfab) resolve(window.Sketchfab);
      else fail();
    };
    script.onerror = fail;
    document.head.append(script);
  });
  return pending;
}
