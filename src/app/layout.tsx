import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Capcar — Plan it. Price it. Build it.",
    template: "%s · Capcar",
  },
  description:
    "Visualize your project car, find compatible parts and install them with confidence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="min-h-dvh font-sans antialiased">{children}</body>
    </html>
  );
}
