import { licensedSounds } from "./licensed-sounds";
import { communitySounds } from "./community-sounds";

export const soundCatalog = [
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
];
