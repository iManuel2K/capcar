import { describe, expect, it, vi } from "vitest";
import { resolveLocale } from "./resolve-locale";
import en from "../../messages/hardening/en.json";
import de from "../../messages/hardening/de.json";
import el from "../../messages/hardening/el.json";
import sq from "../../messages/hardening/sq.json";
import ja from "../../messages/hardening/ja.json";
function leaves(value: object, prefix = ""): [string, string][] {
  return Object.entries(value).flatMap(([key, child]) =>
    typeof child === "object" && child !== null
      ? leaves(child, `${prefix}${key}.`)
      : [[`${prefix}${key}`, String(child)]],
  );
}
describe("public language behavior", () => {
  it.each(["en", "de", "el", "sq", "ja"])(
    "compiles the complete public %s catalog with the real ICU engine",
    async (locale) => {
      const { createTranslator } =
        await vi.importActual<typeof import("next-intl")>("next-intl");
      const [base, publicCatalog] = await Promise.all([
        import(`../../messages/${locale}.json`),
        import(`../../messages/public/${locale}.json`),
      ]);
      const messages = { ...base.default, ...publicCatalog.default };
      const t = createTranslator({
        locale,
        messages,
        onError(error) {
          throw error;
        },
      });
      for (const [key, value] of leaves(messages)) {
        expect(value.trim().length, `${locale}:${key}`).toBeGreaterThan(0);
        const values = Object.fromEntries(
          [...value.matchAll(/\{([A-Za-z]\w*)\s*[,}]/g)].map((match) => [
            match[1],
            2,
          ]),
        );
        expect(typeof t(key, values), `${locale}:${key}`).toBe("string");
      }
    },
  );
  it("respects preference weights and regional languages", () => {
    expect(resolveLocale(undefined, "fr-FR,ja-JP;q=0.8,de;q=0.9")).toBe("de");
    expect(resolveLocale("sq", "de")).toBe("sq");
    expect(resolveLocale(undefined, "ja;q=0,de;q=0.5")).toBe("de");
    expect(resolveLocale("invalid", "el-GR")).toBe("el");
  });
  it.each(Object.entries({ en, de, el, sq, ja }))(
    "renders every new %s message through the real ICU formatter",
    async (locale, messages) => {
      const { createTranslator } =
        await vi.importActual<typeof import("next-intl")>("next-intl");
      expect(leaves(messages).map(([key]) => key)).toEqual(
        leaves(en).map(([key]) => key),
      );
      const t = createTranslator({
        locale,
        messages,
        onError(error) {
          throw error;
        },
      });
      for (const [key, value] of leaves(messages)) {
        expect(value.trim().length).toBeGreaterThan(0);
        expect(t(key as never)).toBe(value);
      }
    },
  );
});
