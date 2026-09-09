export type VehicleReference = {
  id: string;
  modelUid: string;
  platforms: string[];
  title: string;
  yearLabel: string;
  creator: string;
  creatorUrl: string;
  sourceUrl: string;
  embedUrl: string;
  previewImage: string;
};

export const vehicleReferences: VehicleReference[] = [
  {
    id: "sketchfab-e90-2008",
    modelUid: "683639e5ce0c477b882ed6311656d29d",
    platforms: ["E90"],
    title: "BMW E90",
    yearLabel: "2008 reference",
    creator: "byegdesign",
    creatorUrl: "https://sketchfab.com/byegdesign",
    sourceUrl:
      "https://sketchfab.com/3d-models/bmw-e90-2008-683639e5ce0c477b882ed6311656d29d",
    embedUrl:
      "https://sketchfab.com/models/683639e5ce0c477b882ed6311656d29d/embed?autostart=1&ui_theme=dark&ui_color=74A7FF&transparent=0&ui_infos=0",
    previewImage: "/capcar-bmw-current-side.webp",
  },
];

export function vehicleReferenceFor(platform: string) {
  const normalized = platform.trim().toUpperCase();
  return vehicleReferences.find((reference) =>
    reference.platforms.includes(normalized),
  );
}
