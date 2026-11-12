import type { Vehicle } from "@/features/vehicles/vehicle-schema";
import { everydayGarageCars } from "@/features/vehicles/everyday-garage-cars";
import { additionalGarageCars } from "@/features/vehicles/additional-garage-cars";

export type ModelProblemTopic =
  | "oil"
  | "brakes"
  | "springs"
  | "joints"
  | "steering"
  | "exhaust"
  | "lights"
  | "battery"
  | "parkingBrake"
  | "brakeHoses"
  | "starter"
  | "injection"
  | "tpms";
export type ModelProblemProfile = {
  carId: string;
  sourceUrl: string;
  reportYears: [number, number];
  scope: "petrol" | "diesel" | "mixed" | "electric";
  issues: { topic: ModelProblemTopic; years?: number[] }[];
};
// Human-reviewed against each report's “Mängel und Rückrufe” section.
// These are inspection priorities, not diagnoses or exhaustive defect lists.
// Some reports cover more years/body styles than the narrower garage choice.
export const modelProblemsReviewedAt = "2026-11-03";
export const modelProblemProfiles: ModelProblemProfile[] = [
  {
    carId: "audi-a1-8x",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/audi-a1-182/",
    reportYears: [2010, 2018],
    scope: "petrol",
    issues: [{ topic: "oil" }, { topic: "brakes" }],
  },
  {
    carId: "audi-a5-8t",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/audi-a5-206/",
    reportYears: [2007, 2016],
    scope: "petrol",
    issues: [{ topic: "springs" }],
  },
  {
    carId: "audi-a6-c7",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/audi-a6-274/",
    reportYears: [2011, 2018],
    scope: "petrol",
    issues: [{ topic: "exhaust" }],
  },
  {
    carId: "audi-q3-8u",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/audi-q3-226/",
    reportYears: [2011, 2018],
    scope: "petrol",
    issues: [{ topic: "brakes" }, { topic: "springs" }],
  },
  {
    carId: "audi-q5-8r",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/audi-q5-220/",
    reportYears: [2008, 2016],
    scope: "petrol",
    issues: [{ topic: "injection", years: [2012] }],
  },
  {
    carId: "bmw-1-e87",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/bmw-1er-reihe-227/",
    reportYears: [2004, 2013],
    scope: "petrol",
    issues: [{ topic: "springs" }, { topic: "brakeHoses" }],
  },
  {
    carId: "bmw-3-f30",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/bmw-3er-reihe-125/",
    reportYears: [2012, 2018],
    scope: "petrol",
    issues: [{ topic: "springs" }, { topic: "oil" }],
  },
  {
    carId: "bmw-5-f10",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/bmw-5er-reihe-127/",
    reportYears: [2010, 2017],
    scope: "petrol",
    issues: [{ topic: "springs" }, { topic: "joints" }],
  },
  {
    carId: "bmw-x1-e84",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/bmw-x1-136/",
    reportYears: [2009, 2015],
    scope: "petrol",
    issues: [{ topic: "joints" }, { topic: "parkingBrake" }],
  },
  {
    carId: "bmw-x3-f25",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/bmw-x3-142/",
    reportYears: [2010, 2017],
    scope: "petrol",
    issues: [{ topic: "steering" }, { topic: "springs" }],
  },
  {
    carId: "b-class-w246",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/mercedes-benz-b-klasse-236/",
    reportYears: [2011, 2018],
    scope: "petrol",
    issues: [{ topic: "starter", years: [2011] }],
  },
  {
    carId: "c-class-w205",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/mercedes-benz-c-klasse-356/",
    reportYears: [2014, 2023],
    scope: "petrol",
    issues: [{ topic: "joints" }],
  },
  {
    carId: "glk-x204",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/mercedes-benz-glk-klasse-281/",
    reportYears: [2008, 2015],
    scope: "diesel",
    issues: [{ topic: "springs" }, { topic: "parkingBrake" }],
  },
  {
    carId: "golf-vi",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/vw-golf-154/",
    reportYears: [2008, 2012],
    scope: "petrol",
    issues: [{ topic: "springs" }, { topic: "oil" }],
  },
  {
    carId: "passat-b8",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/vw-passat-352/",
    reportYears: [2014, 2023],
    scope: "petrol",
    issues: [{ topic: "brakes" }, { topic: "oil" }],
  },
  {
    carId: "touran-1t",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/vw-touran-98/",
    reportYears: [2003, 2015],
    scope: "petrol",
    issues: [{ topic: "springs" }, { topic: "brakes" }, { topic: "oil" }],
  },
  {
    carId: "up-aa",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/vw-up-200/",
    reportYears: [2011, 2026],
    scope: "petrol",
    issues: [{ topic: "brakes" }, { topic: "exhaust" }],
  },
  {
    carId: "sharan-ii",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/vw-sharan-294/",
    reportYears: [2010, 2022],
    scope: "petrol",
    issues: [{ topic: "joints" }, { topic: "brakes" }],
  },
  {
    carId: "superb-ii",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/skoda-superb-246/",
    reportYears: [2008, 2015],
    scope: "petrol",
    issues: [{ topic: "joints" }, { topic: "springs" }],
  },
  {
    carId: "yeti-5l",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/skoda-yeti-80/",
    reportYears: [2009, 2017],
    scope: "petrol",
    issues: [{ topic: "brakes" }, { topic: "oil" }],
  },
  {
    carId: "rapid-nh",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/skoda-rapid-312/",
    reportYears: [2012, 2019],
    scope: "petrol",
    issues: [{ topic: "springs" }, { topic: "brakes" }, { topic: "oil" }],
  },
  {
    carId: "tesla-model-3",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/tesla-model-3-484/",
    reportYears: [2019, 2026],
    scope: "electric",
    issues: [{ topic: "brakes" }, { topic: "lights" }],
  },
  {
    carId: "insignia-a",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/opel-insignia-194/",
    reportYears: [2008, 2017],
    scope: "petrol",
    issues: [{ topic: "springs" }, { topic: "oil" }],
  },
  {
    carId: "meriva-b",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/opel-meriva-190/",
    reportYears: [2010, 2017],
    scope: "mixed",
    issues: [{ topic: "oil" }],
  },
  {
    carId: "mondeo-iv",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/ford-mondeo-157/",
    reportYears: [2007, 2014],
    scope: "petrol",
    issues: [{ topic: "lights" }, { topic: "exhaust" }, { topic: "oil" }],
  },
  {
    carId: "kuga-ii",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/ford-kuga-244/",
    reportYears: [2013, 2019],
    scope: "petrol",
    issues: [{ topic: "joints" }, { topic: "brakes" }],
  },
  {
    carId: "jazz-ge-gg",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/honda-jazz-292/",
    reportYears: [2008, 2015],
    scope: "petrol",
    issues: [{ topic: "brakes" }, { topic: "battery" }],
  },
  {
    carId: "civic-viii",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/honda-civic-135/",
    reportYears: [2005, 2011],
    scope: "mixed",
    issues: [{ topic: "steering" }, { topic: "brakes" }, { topic: "lights" }],
  },
  {
    carId: "cr-v-iv",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/honda-cr-v-437/",
    reportYears: [2012, 2018],
    scope: "mixed",
    issues: [{ topic: "battery", years: [2012, 2014, 2015, 2016, 2017, 2018] }],
  },
  {
    carId: "avensis-t27",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/toyota-avensis-343/",
    reportYears: [2009, 2018],
    scope: "mixed",
    issues: [{ topic: "lights" }],
  },
  {
    carId: "rav4-xa30",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/toyota-rav4-453/",
    reportYears: [2006, 2013],
    scope: "mixed",
    issues: [{ topic: "parkingBrake" }, { topic: "springs" }],
  },
  {
    carId: "mazda2-de",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/mazda-2-285/",
    reportYears: [2007, 2015],
    scope: "mixed",
    issues: [{ topic: "joints" }, { topic: "steering" }],
  },
  {
    carId: "mazda6-gj",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/mazda-6-511/",
    reportYears: [2013, 2026],
    scope: "mixed",
    issues: [{ topic: "springs" }, { topic: "brakes" }],
  },
  {
    carId: "cx5-ke",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/mazda-cx-5-302/",
    reportYears: [2012, 2017],
    scope: "mixed",
    issues: [{ topic: "steering" }, { topic: "springs" }, { topic: "brakes" }],
  },
  {
    carId: "i10-ia",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/hyundai-i10-248/",
    reportYears: [2013, 2019],
    scope: "petrol",
    issues: [{ topic: "springs" }, { topic: "brakes" }, { topic: "oil" }],
  },
  {
    carId: "i20-gb",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/hyundai-i20-394/",
    reportYears: [2014, 2020],
    scope: "petrol",
    issues: [{ topic: "brakes" }, { topic: "lights" }],
  },
  {
    carId: "ix35-lm",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/hyundai-ix35-279/",
    reportYears: [2010, 2015],
    scope: "mixed",
    issues: [{ topic: "steering" }, { topic: "lights" }, { topic: "brakes" }],
  },
  {
    carId: "picanto-ta",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/kia-picanto-325/",
    reportYears: [2011, 2017],
    scope: "petrol",
    issues: [{ topic: "lights" }, { topic: "brakes" }, { topic: "battery" }],
  },
  {
    carId: "sportage-sl",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/kia-sportage-304/",
    reportYears: [2010, 2016],
    scope: "mixed",
    issues: [
      { topic: "joints" },
      { topic: "parkingBrake" },
      { topic: "brakes" },
    ],
  },
  {
    carId: "captur-i",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/renault-captur-231/",
    reportYears: [2013, 2019],
    scope: "mixed",
    issues: [{ topic: "joints" }, { topic: "brakes" }],
  },
  {
    carId: "duster-i",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/dacia-duster-233/",
    reportYears: [2010, 2017],
    scope: "petrol",
    issues: [{ topic: "steering" }, { topic: "exhaust" }, { topic: "lights" }],
  },
  {
    carId: "2008-i",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/peugeot-2008-253/",
    reportYears: [2013, 2019],
    scope: "petrol",
    issues: [{ topic: "oil" }, { topic: "lights" }, { topic: "brakes" }],
  },
  {
    carId: "c3-ii",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/citroen-c3-330/",
    reportYears: [2010, 2017],
    scope: "petrol",
    issues: [{ topic: "springs" }, { topic: "steering" }, { topic: "exhaust" }],
  },
  {
    carId: "panda-iii",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/fiat-panda-316/",
    reportYears: [2012, 2026],
    scope: "mixed",
    issues: [{ topic: "springs" }, { topic: "joints" }, { topic: "lights" }],
  },
  {
    carId: "swift-fz-nz",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/suzuki-swift-301/",
    reportYears: [2010, 2017],
    scope: "mixed",
    issues: [{ topic: "steering" }, { topic: "brakes" }, { topic: "lights" }],
  },
  {
    carId: "audi-a3-8v",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/audi-a3-265/",
    reportYears: [2012, 2020],
    scope: "petrol",
    issues: [{ topic: "brakes" }, { topic: "springs" }],
  },
  {
    carId: "audi-a4-b8",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/audi-a4-156/",
    reportYears: [2007, 2015],
    scope: "petrol",
    issues: [],
  },
  {
    carId: "bmw-1-f20",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/bmw-1er-reihe-208/",
    reportYears: [2011, 2019],
    scope: "petrol",
    issues: [{ topic: "tpms", years: [2011, 2012, 2013, 2014] }],
  },
  {
    carId: "polo-6r",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/vw-polo-249/",
    reportYears: [2009, 2017],
    scope: "petrol",
    issues: [{ topic: "brakes" }, { topic: "exhaust" }, { topic: "springs" }],
  },
  {
    carId: "passat-b7",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/vw-passat-258/",
    reportYears: [2010, 2014],
    scope: "petrol",
    issues: [{ topic: "brakes" }, { topic: "joints" }, { topic: "springs" }],
  },
  {
    carId: "tiguan-5n",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/vw-tiguan-202/",
    reportYears: [2007, 2016],
    scope: "petrol",
    issues: [{ topic: "springs" }, { topic: "joints" }, { topic: "brakes" }],
  },
  {
    carId: "octavia-iii",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/skoda-octavia-242/",
    reportYears: [2013, 2016],
    scope: "petrol",
    issues: [{ topic: "springs" }],
  },
  {
    carId: "fabia-iii",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/skoda-fabia-353/",
    reportYears: [2014, 2022],
    scope: "petrol",
    issues: [{ topic: "brakes" }],
  },
  {
    carId: "leon-5f",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/seat-leon-268/",
    reportYears: [2012, 2020],
    scope: "petrol",
    issues: [{ topic: "springs" }],
  },
  {
    carId: "ibiza-6j",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/seat-ibiza-197/",
    reportYears: [2008, 2017],
    scope: "petrol",
    issues: [{ topic: "oil" }, { topic: "exhaust" }, { topic: "brakes" }],
  },
  {
    carId: "a-class-w176",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/mercedes-benz-a-klasse-276/",
    reportYears: [2012, 2018],
    scope: "petrol",
    issues: [],
  },
  {
    carId: "c-class-w204",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/mercedes-benz-c-klasse-161/",
    reportYears: [2007, 2015],
    scope: "petrol",
    issues: [{ topic: "joints" }],
  },
  {
    carId: "e-class-w212",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/mercedes-benz-e-klasse-187/",
    reportYears: [2009, 2016],
    scope: "petrol",
    issues: [{ topic: "parkingBrake" }, { topic: "oil" }],
  },
  {
    carId: "astra-j",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/opel-astra-191/",
    reportYears: [2009, 2017],
    scope: "petrol",
    issues: [{ topic: "springs" }, { topic: "oil" }],
  },
  {
    carId: "corsa-d",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/opel-corsa-164/",
    reportYears: [2006, 2014],
    scope: "petrol",
    issues: [{ topic: "springs" }, { topic: "oil" }, { topic: "brakes" }],
  },
  {
    carId: "focus-iii",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/ford-focus-222/",
    reportYears: [2011, 2018],
    scope: "petrol",
    issues: [{ topic: "exhaust" }, { topic: "lights" }, { topic: "oil" }],
  },
  {
    carId: "yaris-xp13",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/toyota-yaris-300/",
    reportYears: [2011, 2020],
    scope: "mixed",
    issues: [{ topic: "lights" }],
  },
  {
    carId: "i30-ii",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/hyundai-i30-185/",
    reportYears: [2012, 2017],
    scope: "mixed",
    issues: [{ topic: "steering" }, { topic: "brakes" }, { topic: "lights" }],
  },
  {
    carId: "ceed-jd",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/kia-ceed-335/",
    reportYears: [2012, 2018],
    scope: "mixed",
    issues: [{ topic: "lights" }, { topic: "brakes" }, { topic: "joints" }],
  },
  {
    carId: "clio-iv",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/renault-clio-280/",
    reportYears: [2012, 2020],
    scope: "mixed",
    issues: [{ topic: "joints" }, { topic: "brakes" }],
  },
  {
    carId: "megane-iii",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/renault-megane-195/",
    reportYears: [2008, 2016],
    scope: "petrol",
    issues: [{ topic: "steering" }, { topic: "springs" }, { topic: "brakes" }],
  },
  {
    carId: "208-i",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/peugeot-208-346/",
    reportYears: [2012, 2019],
    scope: "petrol",
    issues: [{ topic: "lights" }, { topic: "brakes" }, { topic: "oil" }],
  },
  {
    carId: "308-ii",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/peugeot-308-462/",
    reportYears: [2013, 2022],
    scope: "petrol",
    issues: [{ topic: "brakes" }, { topic: "oil" }, { topic: "joints" }],
  },
  {
    carId: "qashqai-j11",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/nissan-qashqai-383/",
    reportYears: [2014, 2021],
    scope: "petrol",
    issues: [{ topic: "battery" }, { topic: "joints" }, { topic: "brakes" }],
  },
  {
    carId: "sandero-ii",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/dacia-sandero-234/",
    reportYears: [2013, 2020],
    scope: "mixed",
    issues: [{ topic: "joints" }, { topic: "brakes" }, { topic: "lights" }],
  },
];
const choices = [...everydayGarageCars, ...additionalGarageCars];
const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase()
    .replace(/^VW$/, "VOLKSWAGEN");
export function modelProblemProfileForVehicle(
  vehicle: Pick<Vehicle, "make" | "model" | "platform" | "productionYear">,
) {
  const choice = choices.find(
    (car) =>
      normalize(car.make) === normalize(vehicle.make) &&
      normalize(car.model) === normalize(vehicle.model) &&
      normalize(car.platform) === normalize(vehicle.platform) &&
      vehicle.productionYear >= car.years[0] &&
      vehicle.productionYear <= car.years[1],
  );
  const profile = modelProblemProfiles.find(
    (entry) =>
      entry.carId === choice?.id &&
      vehicle.productionYear >= entry.reportYears[0] &&
      vehicle.productionYear <= entry.reportYears[1],
  );
  if (!profile) return undefined;
  return {
    ...profile,
    issues: profile.issues.filter(
      (issue) => !issue.years || issue.years.includes(vehicle.productionYear),
    ),
  };
}
