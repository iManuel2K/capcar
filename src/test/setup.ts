import "@testing-library/jest-dom/vitest";

import type { ReactNode } from "react";
import { vi } from "vitest";

import messages from "../../messages/en.json";

vi.mock("next-intl", () => ({
  NextIntlClientProvider: ({ children }: { children: ReactNode }) => children,
  useLocale: () => "en",
  useTranslations:
    (namespace: keyof typeof messages) =>
    (key: string, values?: Record<string, string | number>) => {
      const group = messages[namespace] as Record<string, string>;
      let value = group[key] ?? key;
      if (key === "found" && typeof values?.count === "number") {
        return `${values.count} listings found.`;
      }
      for (const [name, replacement] of Object.entries(values ?? {})) {
        value = value.replaceAll(`{${name}}`, String(replacement));
      }
      return value;
    },
}));
