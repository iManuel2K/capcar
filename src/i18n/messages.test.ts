import { describe, expect, it } from "vitest";

import de from "../../messages/de.json";
import el from "../../messages/el.json";
import en from "../../messages/en.json";
import ja from "../../messages/ja.json";
import sq from "../../messages/sq.json";
import publicDe from "../../messages/public/de.json";
import publicEl from "../../messages/public/el.json";
import publicEn from "../../messages/public/en.json";
import publicJa from "../../messages/public/ja.json";
import publicSq from "../../messages/public/sq.json";

function keys(value: object, prefix = ""): string[] {
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof child === "object" && child !== null
      ? keys(child as object, path)
      : [path];
  });
}

describe("localized messages", () => {
  it.each([
    ["German", de],
    ["Greek", el],
    ["Albanian", sq],
    ["Japanese", ja],
  ])("keeps %s in parity with English", (_name, messages) => {
    expect(keys(messages).sort()).toEqual(keys(en).sort());
    expect(Object.values(messages).every(Boolean)).toBe(true);
  });

  it.each([
    ["German", publicDe],
    ["Greek", publicEl],
    ["Albanian", publicSq],
    ["Japanese", publicJa],
  ])("keeps public %s messages in parity with English", (_name, messages) => {
    expect(keys(messages).sort()).toEqual(keys(publicEn).sort());
    expect(Object.values(messages).every(Boolean)).toBe(true);
  });
});
