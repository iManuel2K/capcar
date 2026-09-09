import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { paints, type Concept } from "@/features/visualizer/concept-studio";

export function createConceptRenderer(host: HTMLElement, onError: () => void) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  host.appendChild(renderer.domElement);
  renderer.domElement.setAttribute(
    "aria-label",
    "Stylized concept car. Use the camera buttons to change the view.",
  );
  renderer.domElement.setAttribute("role", "img");
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(4, 2.5, 4);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0.5, 0);
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.minPolarAngle = 0.2;
  controls.maxPolarAngle = Math.PI / 2;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x88988d, 3));
  const light = new THREE.DirectionalLight(0xffffff, 3);
  light.position.set(3, 5, 2);
  scene.add(light);
  let disposed = false;
  let model: THREE.Group | undefined;
  let request: AbortController | undefined;
  let revision = 0;
  const paint = { value: new THREE.Color(paints.petrol) };
  const render = () => {
    if (!disposed) renderer.render(scene, camera);
  };
  controls.addEventListener("change", render);
  const resize = new ResizeObserver(() => {
    const { width, height } = host.getBoundingClientRect();
    renderer.setSize(Math.max(width, 1), Math.max(height, 1));
    camera.aspect = width / Math.max(height, 1);
    camera.updateProjectionMatrix();
    render();
  });
  resize.observe(host);
  const lost = (event: Event) => {
    event.preventDefault();
    onError();
  };
  renderer.domElement.addEventListener("webglcontextlost", lost);
  function release(group: THREE.Group) {
    const textures = new Set<THREE.Texture>();
    group.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.geometry.dispose();
      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];
      for (const material of materials) {
        if (material instanceof THREE.MeshStandardMaterial && material.map)
          textures.add(material.map);
        material.dispose();
      }
    });
    textures.forEach((texture) => texture.dispose());
  }
  function update(value: Concept) {
    paint.value.set(paints[value.paint]);
    if (model) {
      const body = model.getObjectByName("body");
      if (body) body.position.y = 0.15 - (value.stance === "sport" ? 0.08 : 0);
      const spoiler = model.getObjectByName("spoiler");
      if (spoiler) spoiler.visible = value.spoiler;
    }
    render();
  }
  return {
    update,
    async load(value: Concept) {
      const token = ++revision;
      request?.abort();
      const controller = new AbortController();
      request = controller;
      const timer = window.setTimeout(() => controller.abort(), 20000);
      try {
        const response = await fetch(`/models/concepts/${value.model}.glb`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Model unavailable");
        const gltf = await new GLTFLoader().parseAsync(
          await response.arrayBuffer(),
          "/models/concepts/",
        );
        if (disposed || token !== revision) {
          release(gltf.scene);
          return;
        }
        if (model) {
          scene.remove(model);
          release(model);
        }
        model = gltf.scene;
        const originals = new Set<THREE.Material>();
        model.traverse((object) => {
          if (!(object instanceof THREE.Mesh)) return;
          // Replace only this model's paint swatch; preserve glass, tires and lamps.
          const original = object.material as THREE.MeshStandardMaterial;
          originals.add(original);
          const material = original.clone();
          material.onBeforeCompile = (shader) => {
            shader.uniforms.conceptPaint = paint;
            shader.uniforms.greenBody = {
              value: value.model === "hatchback-sports",
            };
            shader.fragmentShader =
              "uniform vec3 conceptPaint;\nuniform bool greenBody;\n" +
              shader.fragmentShader;
            shader.fragmentShader = shader.fragmentShader.replace(
              "#include <map_fragment>",
              `#include <map_fragment>
              bool orangePaint = diffuseColor.r > 0.5 && diffuseColor.g > 0.07 && diffuseColor.g < 0.4 && diffuseColor.b < 0.12;
              bool greenPaint = diffuseColor.g > 0.3 && diffuseColor.r < 0.2 && diffuseColor.b < 0.35;
              if (greenBody ? greenPaint : orangePaint) {
                diffuseColor.rgb = conceptPaint;
              }`,
            );
          };
          object.material = material;
        });
        originals.forEach((material) => material.dispose());
        scene.add(model);
        update(value);
      } finally {
        window.clearTimeout(timer);
      }
    },
    camera(view: "front" | "side" | "rear") {
      camera.position.set(
        view === "side" ? 5 : 0,
        2,
        view === "front" ? 5 : view === "rear" ? -5 : 0,
      );
      controls.update();
      render();
    },
    zoom(direction: "in" | "out") {
      const offset = camera.position.clone().sub(controls.target);
      offset.setLength(
        THREE.MathUtils.clamp(
          offset.length() * (direction === "in" ? 0.85 : 1.15),
          3.5,
          8,
        ),
      );
      camera.position.copy(controls.target).add(offset);
      controls.update();
      render();
    },
    dispose() {
      disposed = true;
      revision++;
      request?.abort();
      resize.disconnect();
      controls.dispose();
      renderer.domElement.removeEventListener("webglcontextlost", lost);
      if (model) release(model);
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
