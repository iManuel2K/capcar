import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CapCar — Project Car Copilot",
    short_name: "CapCar",
    description: "Plan, price and build your project car.",
    start_url: "/garage",
    display: "standalone",
    background_color: "#0b0e0c",
    theme_color: "#0b0e0c",
    icons: [
      {
        src: "/capcar-mark-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/capcar-mark-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
