import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { getTranslations } from "next-intl/server";

import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration";
import { NotificationBootstrap } from "@/components/notifications/notification-bootstrap";
import { SkipToContent } from "@/components/ui/skip-to-content";

import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  return {
    title: { default: t("siteTitle"), template: "%s · Capcar" },
    description: t("siteDescription"),
    applicationName: "Capcar",
    manifest: "/manifest.webmanifest",
    icons: {
      icon: [{ url: "/capcar-mark-192.png", type: "image/png" }],
      apple: [{ url: "/capcar-mark-192.png", type: "image/png" }],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [locale, messages] = await Promise.all([getLocale(), getMessages()]);

  return (
    <html lang={locale} data-scroll-behavior="smooth">
      <body className="min-h-dvh font-sans antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SkipToContent />
          {children}
          <NotificationBootstrap />
          <ServiceWorkerRegistration />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
