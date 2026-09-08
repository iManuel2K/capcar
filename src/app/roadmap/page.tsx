import type { Metadata } from "next";

import { RoadmapPage } from "@/components/marketing/roadmap-page";

export const metadata: Metadata = {
  title: "Roadmap",
  description:
    "See what Capcar supports today and where the digital garage is going next.",
};

export default function Roadmap() {
  return <RoadmapPage />;
}
