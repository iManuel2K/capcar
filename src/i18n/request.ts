import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { resolveLocale } from "./resolve-locale";

import { localeCookie } from "@/i18n/config";

export default getRequestConfig(async () => {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const saved = cookieStore.get(localeCookie)?.value;
  const locale = resolveLocale(saved, headerStore.get("accept-language"));

  const [baseMessages, publicMessages, hardeningMessages] = await Promise.all([
    import(`../../messages/${locale}.json`),
    import(`../../messages/public/${locale}.json`),
    import(`../../messages/hardening/${locale}.json`),
  ]);

  return {
    locale,
    messages: {
      ...baseMessages.default,
      ...publicMessages.default,
      ...hardeningMessages.default,
    },
  };
});
