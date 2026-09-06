import type { Metadata } from "next";

import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration";
import { NotificationBootstrap } from "@/components/notifications/notification-bootstrap";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Capcar — Plan it. Price it. Build it.",
    template: "%s · Capcar",
  },
  description:
    "Visualize your project car, find compatible parts and install them with confidence.",
  applicationName: "Capcar",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/capcar-mark-192.png", type: "image/png" }],
    apple: [{ url: "/capcar-mark-192.png", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="min-h-dvh font-sans antialiased">
        {children}
        <NotificationBootstrap />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
