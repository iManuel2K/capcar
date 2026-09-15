"use client";

import { AlertTriangle, LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import type { BuildVisual } from "@/features/visualizer/build-visual-schema";
import type { VehicleModel } from "@/features/visualizer/vehicle-model-schema";

const colors: Record<BuildVisual["paint"], number> = {
  "factory-black": 0x242a2d,
  "alpine-white": 0xdddcd4,
  "estoril-blue": 0x2870c6,
  "deep-green": 0x31594c,
};

export function LicensedVehicleAsset({
  model,
  visual,
  label,
}: {
  model: VehicleModel;
  visual: BuildVisual;
  label: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const visualRef = useRef(visual);
  const sceneModelRef = useRef<THREE.Group | undefined>(undefined);
  const baseYRef = useRef(0);
  const renderRef = useRef<() => void>(() => undefined);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    if (!host.current || !model.delivery) return;
    const element = host.current;
    const controller = new AbortController();
    let disposed = false;
    let renderer: THREE.WebGLRenderer | undefined;
    let controls: OrbitControls | undefined;
    let resize: ResizeObserver | undefined;
    let sceneModel: THREE.Group | undefined;

    async function load() {
      try {
        const response = await fetch(model.delivery!.url, {
          cache: "force-cache",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Asset unavailable");
        const bytes = await response.arrayBuffer();
        if (bytes.byteLength !== model.delivery!.byteLength)
          throw new Error("Asset size mismatch");
        const digest = [
          ...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
        ]
          .map((value) => value.toString(16).padStart(2, "0"))
          .join("");
        if (digest !== model.delivery!.sha256)
          throw new Error("Asset integrity check failed");
        const resourcePath = model.delivery!.url.startsWith("https://")
          ? new URL(".", model.delivery!.url).href
          : model.delivery!.url.slice(
              0,
              model.delivery!.url.lastIndexOf("/") + 1,
            );
        const gltf = await new GLTFLoader().parseAsync(bytes, resourcePath);
        if (disposed) return;
        sceneModel = gltf.scene;
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.1;
        renderer.domElement.setAttribute("role", "img");
        renderer.domElement.setAttribute(
          "aria-label",
          `${label} licensed interactive 3D vehicle`,
        );
        element.appendChild(renderer.domElement);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(34, 1, 0.01, 100);
        camera.position.set(4.8, 2.1, 5.2);
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enablePan = false;
        controls.enableDamping = false;
        controls.minDistance = 3;
        controls.maxDistance = 9;
        controls.maxPolarAngle = Math.PI / 2.02;
        scene.add(new THREE.HemisphereLight(0xf3eee4, 0x14201d, 2.5));
        const key = new THREE.DirectionalLight(0xffffff, 4);
        key.position.set(4, 6, 4);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0xbf8269, 2.4);
        rim.position.set(-4, 3, -5);
        scene.add(rim);
        const box = new THREE.Box3().setFromObject(sceneModel);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const scale = 4.8 / Math.max(size.x, size.y, size.z);
        sceneModel.scale.setScalar(scale);
        sceneModel.position.set(
          -center.x * scale,
          -box.min.y * scale - 0.8,
          -center.z * scale,
        );
        sceneModelRef.current = sceneModel;
        baseYRef.current = sceneModel.position.y;
        scene.add(sceneModel);
        controls.target.set(0, 0.45, 0);
        applyVisual(
          sceneModel,
          visualRef.current,
          model.mappedSlots,
          baseYRef.current,
        );
        const ground = new THREE.Mesh(
          new THREE.CircleGeometry(4.5, 96),
          new THREE.MeshStandardMaterial({ color: 0x101715, roughness: 0.82 }),
        );
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.82;
        scene.add(ground);
        const render = () => {
          if (disposed || !renderer) return;
          controls?.update();
          renderer.render(scene, camera);
        };
        renderRef.current = render;
        controls.addEventListener("change", render);
        resize = new ResizeObserver(() => {
          const { width, height } = element.getBoundingClientRect();
          renderer!.setSize(Math.max(1, width), Math.max(1, height));
          camera.aspect = width / Math.max(1, height);
          camera.updateProjectionMatrix();
          render();
        });
        resize.observe(element);
        render();
        setState("ready");
      } catch {
        if (!controller.signal.aborted) setState("error");
      }
    }
    void load();
    return () => {
      disposed = true;
      controller.abort();
      resize?.disconnect();
      controls?.dispose();
      if (sceneModel) release(sceneModel);
      sceneModelRef.current = undefined;
      renderRef.current = () => undefined;
      renderer?.dispose();
      renderer?.domElement.remove();
    };
  }, [label, model]);

  useEffect(() => {
    visualRef.current = visual;
    if (sceneModelRef.current)
      applyVisual(
        sceneModelRef.current,
        visual,
        model.mappedSlots,
        baseYRef.current,
      );
    renderRef.current();
  }, [model.mappedSlots, visual]);

  return (
    <div
      ref={host}
      className="absolute inset-0 bg-cover bg-center"
      style={
        model.delivery?.posterUrl
          ? { backgroundImage: `url("${model.delivery.posterUrl}")` }
          : undefined
      }
    >
      {state === "loading" && (
        <div className="absolute inset-0 grid place-items-center text-sm text-white/45">
          <span className="flex items-center gap-2">
            <LoaderCircle className="size-4 animate-spin" /> Verifying licensed
            model…
          </span>
        </div>
      )}
      {state === "error" && (
        <div className="absolute inset-0 grid place-items-center px-6 text-center text-sm text-amber-100/75">
          <span className="max-w-md">
            <AlertTriangle className="mx-auto mb-3 size-5" /> The licensed model
            could not be verified or rendered. The vehicle record remains
            available.
          </span>
        </div>
      )}
    </div>
  );
}

function applyVisual(
  group: THREE.Group,
  visual: BuildVisual,
  slots: VehicleModel["mappedSlots"],
  baseY: number,
) {
  group.position.y =
    baseY -
    (slots.includes("stance")
      ? visual.stance === "sport"
        ? 0.08
        : visual.stance === "low"
          ? 0.14
          : 0
      : 0);
  group.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    const name = object.name.toLowerCase();
    if (slots.includes("paint") && /(body|paint|exterior)/.test(name)) {
      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];
      materials.forEach((material) => {
        if (material instanceof THREE.MeshStandardMaterial)
          material.color.setHex(colors[visual.paint]);
      });
    }
  });
}

function release(group: THREE.Group) {
  group.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    object.geometry.dispose();
    const materials = Array.isArray(object.material)
      ? object.material
      : [object.material];
    materials.forEach((material) => material.dispose());
  });
}
