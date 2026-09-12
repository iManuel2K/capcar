export const locales = ["en", "de", "el", "sq", "ja"] as const;

export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "en";
export const localeCookie = "capcar_locale";

export const localeLabels: Record<AppLocale, string> = {
  en: "English",
  de: "Deutsch",
  el: "Ελληνικά",
  sq: "Shqip",
  ja: "日本語",
};

export function isAppLocale(value: string | undefined): value is AppLocale {
  return locales.includes(value as AppLocale);
}
