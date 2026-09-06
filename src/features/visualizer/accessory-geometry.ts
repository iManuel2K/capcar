import type { BuildVisual } from "./build-visual-schema";
import type { Vector3, VehicleModel } from "./vehicle-model-schema";

export type Surface = { points: Vector3[]; color: string; group: string };
// Generic concept geometry in the existing scene coordinates, not fitment data.
export function accessoryGeometry(model: VehicleModel, visual: BuildVisual): Surface[] {
  const { width: w, height: h, length: l, wheelbase, referenceWheelDiameter } = model.dimensions;
  const drop = visual.stance === "low" ? h * .07 : visual.stance === "sport" ? h * .04 : 0;
  const surfaces: Surface[] = [];
  function box(group: string, center: Vector3, size: Vector3, color: string) {
    const v: Vector3[] = Array.from({ length: 8 }, (_, i) => center.map((c, axis) => c + ((i >> axis) & 1 ? .5 : -.5) * size[axis]) as Vector3);
    for (const indices of [[0,1,3,2],[4,6,7,5],[0,4,5,1],[2,3,7,6],[0,2,6,4],[1,5,7,3]]) surfaces.push({ group, color, points: indices.map(i => v[i]) });
  }
  function circle(group: string, center: Vector3, radius: number, axis: "x" | "z", color: string) {
    const points: Vector3[] = Array.from({ length: 24 }, (_, i) => {
      const a = i * Math.PI / 12;
      return axis === "x" ? [center[0], center[1] + Math.sin(a) * radius, center[2] + Math.cos(a) * radius] : [center[0] + Math.cos(a) * radius, center[1] + Math.sin(a) * radius, center[2]];
    });
    surfaces.push({ group, points, color });
  }
  const radius = referenceWheelDiameter / 2;
  for (const side of [-1, 1]) for (const z of [-wheelbase / 2, wheelbase / 2]) {
    // Mounted outboard of the coarse body shell so brakes are visible in concept view.
    const x = side * w * .50;
    const cy = -h / 2 + radius;
    circle("tyre", [x,cy,z], radius, "x", "#111414");
    const rim = visual.wheels === "silver-mesh" ? "#b8c1c4" : visual.wheels === "graphite" ? "#48545c" : "#75828a";
    circle("rim", [x + side * 4,cy,z], radius * .78, "x", rim);
    circle("rim-inner", [x + side * 6,cy,z], radius * .69, "x", "#172026");
    const dr = radius * (visual.discs === "standard" ? .48 : .62);
    circle("disc", [x + side * 8,cy,z], dr, "x", "#8d959a");
    if (visual.discs === "slotted") for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      const points: Vector3[] = [[x + side * 9,cy + Math.sin(a) * dr * .5,z + Math.cos(a) * dr * .5],[x + side * 9,cy + Math.sin(a+.12) * dr * .92,z + Math.cos(a+.12) * dr * .92],[x + side * 9,cy + Math.sin(a+.18) * dr * .92,z + Math.cos(a+.18) * dr * .92]];
      surfaces.push({ group: "disc-slots", points, color: "#353e42" });
    }
    box("caliper", [x + side * 13,cy,z + dr * .7], [24,dr * 1.05,dr * .45], { silver: "#c5cbce", red: "#ed454b", blue: "#378bf6", yellow: "#eabe32" }[visual.calipers]);
    for (let i = 0; i < 5; i++) {
      const a = i * Math.PI * 2 / 5;
      const points: Vector3[] = [[x + side * 35,cy,z],[x + side * 35,cy + Math.sin(a) * radius * .77,z + Math.cos(a) * radius * .77],[x + side * 35,cy + Math.sin(a+.12) * radius * .77,z + Math.cos(a+.12) * radius * .77]];
      surfaces.push({ group: "spoke", points, color: rim });
    }
    circle("hub", [x + side * 37,cy,z], radius * .12, "x", "#d4dde1");
  }
  const tipXs = visual.exhaust === "quad" ? [-.33,-.23,.23,.33] : visual.exhaust === "dual" ? [-.30,.30] : [-.30];
  const finish = { chrome: "#d9e2e6", black: "#42494d", titanium: "#8179ce" }[visual.tipFinish];
  for (const x of tipXs) {
    box("exhaust-pipe", [x*w,-h*.15-drop,l*.5], [95,95,180], finish);
    circle("exhaust-tip", [x*w,-h*.15-drop,l*.525], 49, "z", finish);
    circle("exhaust-bore", [x*w,-h*.15-drop,l*.526], 35, "z", "#060808");
  }
  if (visual.rearAero !== "none") {
    const wing = visual.rearAero === "wing";
    const y = h * (wing ? .43 : visual.rearAero === "ducktail" ? .21 : .14) - drop;
    box("rear-aero", [0,y,l*.46], [w*.80,wing ? 45 : visual.rearAero === "ducktail" ? 145 : 40,wing ? 260 : 100], "#333e45");
    if (wing) for (const side of [-1,1]) box("wing-mount", [side*w*.25,h*.28-drop,l*.45], [45,h*.3,65], "#505e66");
  }
  if (visual.aero === "sport") box("splitter", [0,-h*.23-drop,-l*.48], [w*.95,35,190], "#424e54");
  if (visual.skirts === "sport") for (const side of [-1,1]) box("skirt", [side*w*.49,-h*.24-drop,0], [95,55,wheelbase*.76], "#424e54");
  if (visual.diffuser === "sport") {
    box("diffuser", [0,-h*.24-drop,l*.485], [w*.85,75,170], "#343d43");
    for (const x of [-.18,0,.18]) box("diffuser-fin", [x*w,-h*.25-drop,l*.50], [25,100,220], "#69777d");
  }
  for (const side of [-1,1]) box("mirror", [side*w*.51,h*.18-drop,-l*.1], [150,90,190], visual.mirrors === "black" ? "#0d151c" : { "factory-black": "#343d43", "alpine-white": "#dddcd4", "estoril-blue": "#2870c6", "deep-green": "#31594c" }[visual.paint]);
  return surfaces;
}
