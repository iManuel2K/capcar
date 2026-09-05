import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Capcar — Project Car Copilot",
    short_name: "Capcar",
    description: "Plan, price and build your project car.",
    start_url: "/garage",
    display: "standalone",
    background_color: "#0b0e0c",
    theme_color: "#0b0e0c",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
