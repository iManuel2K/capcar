import { licensedSounds } from "./licensed-sounds";
import { communitySounds } from "./community-sounds";
import expandedSounds from "./expanded-sounds.json";
import durations from "./sound-durations.json";

const recordings = [
  {
    id: "honda-f20c",
    cylinders: 4,
    title: "Honda F20C",
    titleKey: "hondaTitle",
    detailKey: "hondaDetail",
    author: "Tyler Riddle",
    file: "2002-Honda-F20C.ogg",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0/",
    sha1: "78bc28fd606ff23be5f7f86dd18a478581cd395a",
    duration: "2:17",
    audio: "honda-f20c.mp3",
    fallback: "honda-f20c.ogg",
  },
  {
    id: "volvo-850-t5",
    cylinders: 5,
    title: "Volvo 850 T5",
    titleKey: "volvoTitle",
    detailKey: "volvoDetail",
    author: "Jonas Tittmann",
    file: "5_cylinder_engine_sound.ogg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    sha1: "703608ad35bbc2890432fd49eea1614063778df3",
    duration: "0:33",
    audio: "volvo-850-t5.mp3",
    fallback: "volvo-850-t5.ogg",
  },
  ...licensedSounds.map((sound) => ({
    ...sound,
    titleKey: "",
    detailKey: "",
    duration:
      sound.id === "nissan-vq35hr"
        ? "0:05"
        : sound.id === "triumph-i6"
          ? "0:11"
          : "0:09",
    audio: `${sound.id}.mp3`,
    fallback: `${sound.id}.ogg`,
  })),
  ...communitySounds.map((sound) => ({
    ...sound,
    titleKey: "",
    detailKey: "",
    fallback: undefined,
  })),
  ...expandedSounds.map((sound) => ({
    ...sound,
    titleKey: "",
    detailKey: "",
    audio: `${sound.id}.mp3`,
    fallback: sound.audio,
  })),
];

const makes = [
  "Alfa Romeo",
  "Aston Martin",
  "Auto Union",
  "Auto-Union",
  "AVS Shadow",
  "De Tomaso",
  "Mercedes-Benz",
  "Volkswagen",
  "Chevrolet",
  "Koenigsegg",
  "Lamborghini",
  "Land Rover",
  "Nissan",
  "Porsche",
  "Peugeot",
  "Renault",
  "Toyota",
  "Triumph",
  "Chrysler",
  "Vauxhall",
  "Bugatti",
  "Bentley",
  "Ferrari",
  "Maserati",
  "McLaren",
  "Ginetta",
  "Farbio",
  "Morgan",
  "Spyker",
  "Pagani",
  "Honda",
  "Volvo",
  "Lexus",
  "Lotus",
  "Jaguar",
  "Audi",
  "BMW",
  "Ford",
  "Opel",
  "Abarth",
  "Alpine",
  "Sauber",
  "Cooper",
  "Ecosse",
  "Matra",
  "March",
  "Brabham",
  "Tyrrell",
  "Williams",
  "Surtees",
  "Talbot",
  "Lola",
  "Skoda",
  "Škoda",
  "AC",
  "RUF",
  "KTM",
  "Berta",
  "Stanton",
  "Tesla",
  "Tramontana",
  "Citroen",
  "CD-Panhard",
  "Ariel",
  "Huron",
  "Iso",
  "Issigonis",
  "Ligier",
  "Mercer",
  "Mitsubishi",
  "Mercedes",
  "Dodge",
];
const raceFiles =
  /GT2|LMS|Quattro S1|RS200|911R \(1967\)|997 GT3|Cobra \(1964\)/;

export const soundCatalog = recordings.map((sound) => ({
  ...sound,
  title: sound.title
    .replace(/^Son stratus 2L$/, "Dodge Stratus · 2.0L")
    .replace(/^Zero car /, "")
    .replace(/ recorded2010| Jyväskylän Talviralli 2023 Kuohu/g, "")
    .replace(/-descent$/, " · deceleration")
    .replace(/ static$/, " · stationary"),
  audio: `${sound.id}.mp3`,
  fallback: sound.fallback ?? sound.audio,
  duration: (() => {
    const seconds = (durations as Record<string, number>)[sound.id];
    return seconds
      ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`
      : sound.duration;
  })(),
  make:
    makes
      .find((make) =>
        sound.title
          .replace(/^Son stratus 2L$/, "Dodge Stratus")
          .replace(/^Zero car /, "")
          .replace(/^\d{4} /, "")
          .replaceAll("-", " ")
          .toLowerCase()
          .startsWith(make.replaceAll("-", " ").toLowerCase()),
      )
      ?.replace("Auto-Union", "Auto Union")
      .replace("Škoda", "Skoda") ?? "Other",
  category: (/Talviralli/.test(sound.file)
    ? "motorsport"
    : "category" in sound
      ? sound.category
      : raceFiles.test(sound.file)
        ? "motorsport"
        : "road") as "road" | "motorsport",
}));
export type CatalogSound = (typeof soundCatalog)[number];

export function soundSource(sound: CatalogSound) {
  return `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(sound.file)}`;
}
