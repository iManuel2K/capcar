import type { Metadata } from "next";

import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration";
import { NotificationBootstrap } from "@/components/notifications/notification-bootstrap";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Capcar — Build with clarity.",
    template: "%s · Capcar",
  },
  description:
    "Visualize upgrades, verify fitment, compare total cost and keep every install in one private garage.",
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
