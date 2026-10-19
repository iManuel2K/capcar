import { describe, it, expect } from "vitest";
import { getShowroomExamples } from "./showroom-examples";
import { matchCarModel } from "@/features/visualizer/car-model-catalog";

describe("public rotating examples", () => {
  it("offers matching 3D cars without writing account storage", () => {
    localStorage.clear();
    const cars = getShowroomExamples();
    expect(cars).toHaveLength(7);
    expect(cars.slice(0, 3).map((car) => matchCarModel(car)?.id)).toEqual([
      "bmw-m3-e30",
      "nissan-gt-r",
      "toyota-supra-mk",
    ]);
    expect(cars.every((car) => car.demoProject)).toBe(true);
    expect(localStorage.length).toBe(0);
  });
});
