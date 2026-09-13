import { defaultLocale, isAppLocale, type AppLocale } from "./config";

export function resolveLocale(
  saved?: string,
  acceptLanguage?: string | null,
): AppLocale {
  if (isAppLocale(saved)) return saved;
  const entries = (acceptLanguage ?? "")
    .split(",")
    .map((entry, index) => {
      const [tag, ...parameters] = entry.trim().toLowerCase().split(";");
      const q = parameters.find((value) => value.trim().startsWith("q="));
      const weight = q === undefined ? 1 : Number(q.trim().slice(2));
      return { locale: tag.split("-")[0], weight, index };
    })
    .filter(
      (entry) =>
        Number.isFinite(entry.weight) && entry.weight > 0 && entry.weight <= 1,
    )
    .sort((a, b) => b.weight - a.weight || a.index - b.index);
  return (
    (entries.find((entry) => isAppLocale(entry.locale))?.locale as
      AppLocale | undefined) ?? defaultLocale
  );
}
