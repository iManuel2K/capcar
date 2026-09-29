import "@testing-library/jest-dom/vitest";

import type { ReactNode } from "react";
import { vi } from "vitest";

import messages from "../../messages/en.json";
import publicMessages from "../../messages/public/en.json";
import hardeningMessages from "../../messages/hardening/en.json";
import roadbookMessages from "../../messages/roadbook/en.json";

const allMessages = {
  ...messages,
  ...publicMessages,
  ...hardeningMessages,
  ...roadbookMessages,
};
if (typeof HTMLDialogElement !== "undefined") {
  HTMLDialogElement.prototype.showModal ??= function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close ??= function () {
    this.removeAttribute("open");
  };
}

function translate(namespace: string) {
  return (key: string, values?: Record<string, string | number>) => {
    const group = namespace
      .split(".")
      .reduce<unknown>(
        (value, segment) =>
          typeof value === "object" && value !== null
            ? (value as Record<string, unknown>)[segment]
            : undefined,
        allMessages,
      ) as Record<string, unknown>;
    const nested = key
      .split(".")
      .reduce<unknown>(
        (value, segment) =>
          typeof value === "object" && value !== null
            ? (value as Record<string, unknown>)[segment]
            : undefined,
        group,
      );
    let value = typeof nested === "string" ? nested : key;
    if (key === "found" && typeof values?.count === "number") {
      return `${values.count} listings found.`;
    }
    for (const [name, replacement] of Object.entries(values ?? {})) {
      value = value.replaceAll(`{${name}}`, String(replacement));
    }
    return value;
  };
}

vi.mock("next-intl", () => ({
  NextIntlClientProvider: ({ children }: { children: ReactNode }) => children,
  useLocale: () => "en",
  useTranslations: translate,
}));

vi.mock("next-intl/server", () => ({
  getLocale: async () => "en",
  getMessages: async () => allMessages,
  getTranslations: async (namespace: string) => translate(namespace),
}));
