import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { carCameraDistance } from "@/features/visualizer/car-model-framing";
import type { CarModel } from "@/features/visualizer/car-model-catalog";

export type CarCamera = "perspective" | "front" | "side" | "rear";

/** One on-demand canvas. Animation runs only while explicitly rotating. */
export function createCarModelRenderer(
  host: HTMLElement,
  onError: () => void,
  options: { transparent?: boolean } = {},
) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: !!options.transparent,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.setClearColor(0xe2e4da, options.transparent ? 0 : 1);
  renderer.domElement.setAttribute("role", "img");
  renderer.domElement.setAttribute(
    "aria-label",
    "Interactive car model. Camera buttons offer an alternative to dragging.",
  );
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.05, 100);
  const controls = new OrbitControls(camera, renderer.domElement);
  renderer.domElement.style.touchAction = "pan-y";
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.minPolarAngle = 0.15;
  controls.maxPolarAngle = Math.PI / 2 - 0.015;
  controls.target.set(0, 0.75, 0);
  camera.position.set(6.6, 3.2, 6.6);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.04);
  room.dispose();
  pmrem.dispose();
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.8;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x777f76, 2));
  const key = new THREE.DirectionalLight(0xffffff, 3);
  key.position.set(4, 7, 3);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xd5e9ed, 2);
  fill.position.set(-5, 3, -4);
  scene.add(fill);
  const shadowCanvas = document.createElement("canvas");
  shadowCanvas.width = shadowCanvas.height = 128;
  const shadowContext = shadowCanvas.getContext("2d");
  if (shadowContext) {
    const gradient = shadowContext.createRadialGradient(64, 64, 5, 64, 64, 64);
    gradient.addColorStop(0, "rgba(14,45,48,0.23)");
    gradient.addColorStop(1, "rgba(14,45,48,0)");
    shadowContext.fillStyle = gradient;
    shadowContext.fillRect(0, 0, 128, 128);
  }
  const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(3.8, 6),
    new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      depthWrite: false,
    }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -0.005;
  scene.add(shadow);
  let disposed = false;
  let request: AbortController | undefined;
  let model: THREE.Group | undefined;
  let loadedCar: CarModel | undefined;
  const painted = new Map<THREE.MeshStandardMaterial, THREE.Color>();
  function render() {
    if (disposed) return;
    if (options.transparent) {
      // Keep the whole car inside the floating stage even after a high-angle drag.
      const offset = camera.position.clone().sub(controls.target);
      const minimum = fitDistance(Math.PI / 2 - controls.getPolarAngle());
      if (offset.length() < minimum) {
        offset.setLength(minimum);
        camera.position.copy(controls.target).add(offset);
      }
    }
    renderer.render(scene, camera);
  }
  controls.addEventListener("change", render);
  let rotationRequested = false;
  let rotationFrame = 0;
  let lastRotationTime = 0;
  let dragging = false;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  function stopRotationFrame() {
    cancelAnimationFrame(rotationFrame);
    rotationFrame = 0;
    lastRotationTime = 0;
  }
  function animateRotation(time: number) {
    rotationFrame = 0;
    if (
      disposed ||
      !rotationRequested ||
      document.hidden ||
      reducedMotion.matches
    )
      return;
    const delta = lastRotationTime
      ? Math.min((time - lastRotationTime) / 1000, 0.05)
      : 0;
    if (!lastRotationTime || time - lastRotationTime >= 1000 / 30) {
      if (!dragging) controls.update(delta);
      lastRotationTime = time;
    }
    rotationFrame = requestAnimationFrame(animateRotation);
  }
  function syncRotation() {
    stopRotationFrame();
    controls.autoRotate = rotationRequested && !reducedMotion.matches;
    controls.autoRotateSpeed = 0.8;
    if (controls.autoRotate && !document.hidden && !disposed)
      rotationFrame = requestAnimationFrame(animateRotation);
  }
  const beginDrag = () => {
    dragging = true;
  };
  const endDrag = () => {
    dragging = false;
    lastRotationTime = 0;
  };
  controls.addEventListener("start", beginDrag);
  controls.addEventListener("end", endDrag);
  document.addEventListener("visibilitychange", syncRotation);
  reducedMotion.addEventListener("change", syncRotation);

  let framingRadius = 2.6;
  let framingHalfHeight = 0.9;
  const resize = () => {
    const { width, height } = host.getBoundingClientRect();
    renderer.setSize(Math.max(width, 1), Math.max(height, 1));
    camera.aspect = Math.max(width, 1) / Math.max(height, 1);
    camera.updateProjectionMatrix();
    const offset = camera.position.clone().sub(controls.target);
    const minimum = fitDistance(Math.PI / 2 - controls.getPolarAngle());
    if (offset.length() < minimum) {
      offset.setLength(minimum);
      camera.position.copy(controls.target).add(offset);
      controls.update();
    }
    render();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();
  const lost = (event: Event) => {
    event.preventDefault();
    onError();
  };
  renderer.domElement.addEventListener("webglcontextlost", lost);
  function release(root: THREE.Object3D) {
    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();
    const textures = new Set<THREE.Texture>();
    root.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      geometries.add(object.geometry);
      for (const material of Array.isArray(object.material)
        ? object.material
        : [object.material]) {
        materials.add(material);
        for (const value of Object.values(material))
          if (value instanceof THREE.Texture) textures.add(value);
      }
    });
    geometries.forEach((geometry) => geometry.dispose());
    textures.forEach((texture) => {
      texture.dispose();
      if (
        typeof ImageBitmap !== "undefined" &&
        texture.image instanceof ImageBitmap
      )
        texture.image.close();
    });
    materials.forEach((material) => material.dispose());
  }
  function fitDistance(elevation = 0.33) {
    return carCameraDistance({
      aspect: camera.aspect,
      fov: camera.fov,
      radius: framingRadius,
      halfHeight: framingHalfHeight,
      elevation,
    });
  }
  function setCamera(view: CarCamera) {
    const elevation = view === "perspective" ? 0.33 : 0.12;
    const distance = fitDistance(elevation);
    const direction =
      view === "front"
        ? new THREE.Vector3(0, Math.sin(elevation), Math.cos(elevation))
        : view === "rear"
          ? new THREE.Vector3(0, Math.sin(elevation), -Math.cos(elevation))
          : view === "side"
            ? new THREE.Vector3(Math.cos(elevation), Math.sin(elevation), 0)
            : new THREE.Vector3(
                Math.cos(elevation) / Math.SQRT2,
                Math.sin(elevation),
                Math.cos(elevation) / Math.SQRT2,
              );
    camera.position
      .copy(controls.target)
      .add(direction.multiplyScalar(distance));
    controls.update();
    render();
  }
  return {
    async load(car: CarModel) {
      request?.abort();
      const controller = new AbortController();
      request = controller;
      const timeout = window.setTimeout(() => controller.abort(), 45000);
      try {
        const response = await fetch(car.assetPath, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("The model could not be downloaded.");
        let textureFailed = false;
        const loadingManager = new THREE.LoadingManager();
        loadingManager.onError = () => {
          textureFailed = true;
        };
        const gltf = await new GLTFLoader(loadingManager).parseAsync(
          await response.arrayBuffer(),
          "/models/cars/",
        );
        if (textureFailed) {
          release(gltf.scene);
          throw new Error("Model textures could not be loaded.");
        }
        if (disposed) {
          release(gltf.scene);
          return;
        }
        if (controller.signal.aborted) {
          release(gltf.scene);
          throw new Error("Model loading timed out.");
        }
        const wrapper = new THREE.Group();
        wrapper.add(gltf.scene);
        const presentationMeshes: THREE.Mesh[] = [];
        wrapper.traverse((object) => {
          if (!(object instanceof THREE.Mesh)) return;
          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material];
          if (
            materials.every((material) =>
              car.excludedMaterialNames?.includes(material.name),
            )
          )
            presentationMeshes.push(object);
        });
        for (const mesh of presentationMeshes) {
          mesh.removeFromParent();
          release(mesh);
        }
        const originalSize = new THREE.Box3()
          .setFromObject(wrapper, true)
          .getSize(new THREE.Vector3());
        const longest = Math.max(
          originalSize.x,
          originalSize.y,
          originalSize.z,
        );
        if (!Number.isFinite(longest) || longest <= 0) {
          release(wrapper);
          throw new Error("The model has no visible geometry.");
        }
        wrapper.rotation.y =
          car.rotationY ?? (originalSize.x > originalSize.z ? Math.PI / 2 : 0);
        wrapper.scale.setScalar(4.8 / longest);
        wrapper.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(wrapper, true);
        const center = box.getCenter(new THREE.Vector3());
        wrapper.position.set(-center.x, -box.min.y, -center.z);
        const fittedSize = box.getSize(new THREE.Vector3());
        framingRadius = Math.hypot(fittedSize.x, fittedSize.z) / 2;
        framingHalfHeight = fittedSize.y / 2;
        controls.target.set(0, framingHalfHeight, 0);
        if (model) {
          scene.remove(model);
          release(model);
        }
        model = wrapper;
        painted.clear();
        wrapper.traverse((object) => {
          if (!(object instanceof THREE.Mesh)) return;
          for (const material of Array.isArray(object.material)
            ? object.material
            : [object.material]) {
            if (
              material instanceof THREE.MeshStandardMaterial &&
              car.paintMaterials.includes(material.name)
            )
              painted.set(material, material.color.clone());
          }
        });
        scene.add(wrapper);
        loadedCar = car;
        renderer.domElement.setAttribute(
          "aria-label",
          `${car.name}. Drag to rotate, or use the camera buttons.`,
        );
        setCamera("perspective");
      } finally {
        window.clearTimeout(timeout);
      }
    },
    paint(color?: string | null) {
      for (const [material, original] of painted) {
        if (color && /^#[\da-f]{6}$/i.test(color)) material.color.set(color);
        else material.color.copy(original);
      }
      render();
    },
    camera: setCamera,
    rotation(enabled: boolean) {
      rotationRequested = enabled;
      syncRotation();
    },
    zoom(direction: "in" | "out") {
      const offset = camera.position.clone().sub(controls.target);
      offset.setLength(
        THREE.MathUtils.clamp(
          offset.length() * (direction === "in" ? 0.85 : 1.18),
          4,
          14,
        ),
      );
      camera.position.copy(controls.target).add(offset);
      controls.update();
      render();
    },
    snapshot() {
      render();
      const image = document.createElement("canvas");
      image.width = renderer.domElement.width;
      const creditHeight = 110;
      image.height = renderer.domElement.height + creditHeight;
      const context = image.getContext("2d");
      if (!context || !loadedCar) throw new Error("Image export unavailable");
      context.drawImage(renderer.domElement, 0, 0);
      context.fillStyle = "#0e2d30";
      context.fillRect(
        0,
        renderer.domElement.height,
        image.width,
        creditHeight,
      );
      context.fillStyle = "#e8e6d7";
      context.font = "14px sans-serif";
      const top = renderer.domElement.height;
      context.fillText(
        `${loadedCar.name} · ${loadedCar.author} · ${loadedCar.license}`,
        20,
        top + 28,
        image.width - 40,
      );
      context.font = "11px sans-serif";
      context.fillText(loadedCar.sourceUrl, 20, top + 51, image.width - 40);
      context.fillText(
        `${loadedCar.licenseUrl} · Adapted: optimized model / color preview`,
        20,
        top + 72,
        image.width - 40,
      );
      context.fillText(
        "CAPCAR · capcar.dev/studio · Visual reference, not fitment guidance",
        20,
        top + 94,
        image.width - 40,
      );
      return image.toDataURL("image/png");
    },
    dispose() {
      disposed = true;
      stopRotationFrame();
      document.removeEventListener("visibilitychange", syncRotation);
      reducedMotion.removeEventListener("change", syncRotation);
      controls.removeEventListener("start", beginDrag);
      controls.removeEventListener("end", endDrag);
      request?.abort();
      observer.disconnect();
      controls.dispose();
      renderer.domElement.removeEventListener("webglcontextlost", lost);
      if (model) release(model);
      painted.clear();
      shadow.geometry.dispose();
      shadow.material.dispose();
      shadowTexture.dispose();
      environment.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}
