import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";

import {
  defaultLocale,
  isAppLocale,
  localeCookie,
  type AppLocale,
} from "@/i18n/config";

function preferredLocale(acceptLanguage: string | null): AppLocale {
  const requested = acceptLanguage
    ?.split(",")
    .map((entry) => entry.trim().split(";")[0]?.toLowerCase())
    .find(Boolean);
  const base = requested?.split("-")[0];
  return isAppLocale(base) ? base : defaultLocale;
}

export default getRequestConfig(async () => {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const saved = cookieStore.get(localeCookie)?.value;
  const locale = isAppLocale(saved)
    ? saved
    : preferredLocale(headerStore.get("accept-language"));

  const [baseMessages, publicMessages] = await Promise.all([
    import(`../../messages/${locale}.json`),
    import(`../../messages/public/${locale}.json`),
  ]);

  return {
    locale,
    messages: { ...baseMessages.default, ...publicMessages.default },
  };
});
