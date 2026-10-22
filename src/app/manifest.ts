import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CapCar — Project Car Copilot",
    short_name: "CapCar",
    description: "Plan, price and build your project car.",
    start_url: "/garage",
    display: "standalone",
    background_color: "#0c0d10",
    theme_color: "#0c0d10",
    icons: [
      {
        src: "/capcar-mark-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/capcar-mark.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
