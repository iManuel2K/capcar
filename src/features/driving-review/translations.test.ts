import { describe, it, expect } from "vitest";
import en from "../../../messages/driving-review/en.json";
import de from "../../../messages/driving-review/de.json";
import el from "../../../messages/driving-review/el.json";
import sq from "../../../messages/driving-review/sq.json";
import ja from "../../../messages/driving-review/ja.json";
function flatten(
  input: Record<string, unknown>,
  prefix = "",
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(input).flatMap(([key, value]) =>
      typeof value === "string"
        ? [[prefix + key, value]]
        : Object.entries(
            flatten(value as Record<string, unknown>, prefix + key + "."),
          ),
    ),
  );
}
describe("all five driving review languages", () => {
  it.each(Object.entries({ de, el, sq, ja }))(
    "%s has complete strings and matching interpolation tokens",
    (_, messages) => {
      const base = flatten(en),
        translated = flatten(messages);
      expect(Object.keys(translated).sort()).toEqual(Object.keys(base).sort());
      for (const key of Object.keys(base)) {
        expect(translated[key].trim()).not.toBe("");
        expect(translated[key].match(/\{\w+\}/g) ?? []).toEqual(
          base[key].match(/\{\w+\}/g) ?? [],
        );
      }
    },
  );
});
