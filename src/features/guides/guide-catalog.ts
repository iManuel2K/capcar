import { dailyCarProblems } from "@/features/problems/daily-car-coverage";
import { bmwE90Guides } from "@/features/guides/bmw-e90-guides";
import type { Vehicle } from "@/features/vehicles/vehicle-schema";
export type GuideDifficulty = "Easy" | "Moderate" | "Advanced";
export type GuideReviewStatus = "draft" | "reviewed" | "verified";
export type GuideSource = {
  label: string;
  kind: "required" | "authoritative" | "manufacturer" | "community";
  url?: string;
  verifiedAt?: string;
};

export type GuideStep = {
  id: string;
  title: string;
  instruction: string;
  beginnerDetail: string;
  whyItMatters?: string;
  mistakesToAvoid?: string[];
  recordAfterStep?: string[];
  estimatedMinutes?: number;
  check: string;
  warning?: string;
};

export type GuideCategory =
  | "Maintenance"
  | "Engine"
  | "Electrical"
  | "Exterior"
  | "Interior"
  | "Diagnostics";

export type GuideVideo = {
  title: string;
  url: string;
  embedUrl?: string;
  source: string;
  note: string;
};

export type GuidePhoto = {
  src: string;
  alt: string;
  caption: string;
};

export type GuideVehicleRule = {
  makes?: string[];
  models?: string[];
  platforms?: string[];
  engineCodes?: string[];
};

export type GuideInstallationPlan = {
  costRange: {
    min: number;
    max: number;
    currency: "EUR";
    note: string;
  };
  prerequisites: string[];
  workAreaChecks: string[];
  consumables: string[];
  technicalChecks: string[];
  legalChecks: string[];
  stopConditions: string[];
  completionRecord: string[];
  recommendedSetting:
    "DIY suitable" | "Experienced DIY" | "Workshop recommended";
  recommendation: string;
};

export type InstallationGuide = {
  purpose?: "inspection";
  slug: string;
  partId: string;
  title: string;
  summary: string;
  reviewStatus: GuideReviewStatus;
  revision: string;
  updatedAt: string;
  applicability: string[];
  sources: GuideSource[];
  difficulty: GuideDifficulty;
  estimatedMinutes: number;
  tools: string[];
  category?: GuideCategory;
  video?: GuideVideo;
  photos?: GuidePhoto[];
  vehicleRules?: GuideVehicleRule[];
  safetyChecks: string[];
  installationPlan?: GuideInstallationPlan;
  steps: GuideStep[];
};

export const installationGuides: InstallationGuide[] = [
  ...dailyCarProblems.map((problem): InstallationGuide => ({
    slug: `inspection-${problem.id}`,
    partId: `inspection-${problem.id}`,
    purpose: "inspection",
    title: problem.title,
    summary:
      "Native inspection preparation checklist. Record symptoms, collect evidence and plan the next professional check; completion is not a diagnosis or repair certification.",
    reviewStatus: "draft",
    revision: "1.0",
    updatedAt: "2026-09-14",
    applicability: [problem.applicability],
    sources: [
      {
        label: problem.sourceLabel,
        kind: "authoritative",
        url: problem.sourceUrl,
        verifiedAt: "2026-09-14",
      },
    ],
    difficulty: "Easy",
    estimatedMinutes: 15,
    tools: [
      "Vehicle handbook",
      "Camera or notes",
      "Available service and test records",
    ],
    safetyChecks: [
      "Confirm that the vehicle generation and powertrain match the stated scope.",
      "Stop if there is a safety warning, impaired steering, overheating or damaged battery. Arrange professional assistance.",
      "No lifting, disassembly, live electrical work or high-voltage work is part of this checklist.",
    ],
    steps: (problem.inspectionSteps ?? []).map((instruction, index) => ({
      id: `check-${index + 1}`,
      title: `Inspection preparation · ${index + 1}`,
      instruction,
      beginnerDetail:
        "Mark this step only after recording the observation or arranging the specified professional check. An unknown result should remain unknown.",
      check:
        "Observation recorded, or the required professional check arranged. No component failure has been inferred.",
    })),
  })),
  {
    slug: "demo-e90-rear-lamps",
    partId: "demo-dark-rear-lamps-e90",
    title: "Rear-lamp concept installation",
    category: "Exterior",
    summary:
      "A non-authoritative workflow prototype for replacing an E90 rear-lamp assembly.",
    reviewStatus: "draft",
    revision: "0.1",
    updatedAt: "2026-09-05",
    applicability: [
      "BMW E90 concept",
      "Connector and production split unverified",
    ],
    sources: [
      {
        label: "Vehicle-specific workshop procedure still required",
        kind: "required",
      },
      {
        label: "Lamp manufacturer instructions still required",
        kind: "required",
      },
    ],
    difficulty: "Moderate",
    estimatedMinutes: 95,
    vehicleRules: [{ makes: ["BMW"], models: ["318i"], platforms: ["E90"] }],
    video: {
      title: "Find a matching E90 rear-lamp walkthrough",
      url: "https://www.youtube.com/results?search_query=BMW+E90+rear+lamp+replacement",
      source: "YouTube search",
      note: "Community reference only. Confirm sedan body style, connector and production split before following any video.",
    },
    photos: [
      {
        src: "/capcar-bmw-current-rear-night.webp",
        alt: "BMW E90 rear view at night",
        caption:
          "Photograph panel gaps and every light function before removal.",
      },
      {
        src: "/capcar-bmw-current-side.webp",
        alt: "Black BMW E90 side profile",
        caption:
          "Save the finished fit and lighting check to the vehicle timeline.",
      },
    ],
    installationPlan: {
      costRange: {
        min: 0,
        max: 120,
        currency: "EUR",
        note: "Labour-only planning range. Parts, coding and repairs are excluded.",
      },
      prerequisites: [
        "VIN-specific workshop procedure",
        "Exact connector and production-split match",
        "Road-approved lamp assembly for the registration country",
      ],
      workAreaChecks: [
        "Level parking position with the parking brake applied and enough room to open the luggage compartment fully",
        "Dry, clean sealing surfaces and lighting that makes connector locks and panel gaps visible",
        "A labelled tray for trim clips, nuts and any side-specific lamp hardware",
      ],
      consumables: [
        "Clean gloves",
        "Contact-safe cleaning cloth",
        "Vehicle-approved sealing material only when the exact procedure requires it",
      ],
      technicalChecks: [
        "Use only vehicle-specific fastener values from an authoritative source.",
        "Confirm every light function, warning state, seal and panel gap after installation.",
      ],
      legalChecks: [
        "Confirm E-mark or applicable road approval before fitting.",
        "Do not alter required light colour, position or visibility.",
      ],
      stopConditions: [
        "The connector, pin count, mounting pattern or housing shape differs from the removed assembly.",
        "A harness is brittle, repaired, wet or heat-damaged, or a connector lock will not retain the plug.",
        "The seal is torn, compressed unevenly or cannot sit on a clean, undamaged surface.",
      ],
      completionRecord: [
        "Photograph the approval marking, connector seating, seal and final panel gaps.",
        "Record the part number, installation date, mileage and every light-function result.",
        "Recheck the luggage area for moisture after the next rain or controlled wash.",
      ],
      recommendedSetting: "Experienced DIY",
      recommendation:
        "Suitable only with the exact procedure and approval confirmed; electrical or sealing damage belongs in a workshop.",
    },
    tools: [
      "Trim-removal tool",
      "Vehicle-appropriate socket set",
      "Clean gloves",
      "Work light",
    ],
    safetyChecks: [
      "Park securely, switch the ignition off and remove the key.",
      "Confirm the exact vehicle procedure and electrical isolation requirements.",
      "Do not proceed if wiring, connectors or seals are damaged.",
    ],
    steps: [
      {
        id: "inspect",
        title: "Inspect before removal",
        instruction:
          "Compare the demo replacement with the installed assembly and confirm every connector and mounting point.",
        beginnerDetail:
          "Photograph the original connector routing and panel gaps. These references help during reassembly.",
        whyItMatters:
          "Confirming the physical and electrical match before dismantling avoids leaving the vehicle open with an unusable replacement.",
        mistakesToAvoid: [
          "Assuming an E90 listing fits every body style and production split",
          "Comparing only the visible lens while ignoring the connector, seal and locating tabs",
        ],
        recordAfterStep: [
          "Original lamp part number and approval mark",
          "Wide photo of panel gaps plus close-ups of connector and seal",
        ],
        estimatedMinutes: 15,
        check:
          "The replacement appears identical at every mounting and connector location.",
        warning: "A visual match does not prove fitment or road approval.",
      },
      {
        id: "access",
        title: "Create safe access",
        instruction:
          "Follow the verified vehicle procedure to expose the lamp fasteners without forcing trim.",
        beginnerDetail:
          "Store clips and fasteners in order. Stop if a panel resists beyond light trim-tool pressure.",
        whyItMatters:
          "Controlled access protects trim, wiring and water barriers that are easy to damage but unrelated to the lamp itself.",
        mistakesToAvoid: [
          "Pulling trim before locating every retained clip or fastener",
          "Mixing side-specific hardware or allowing loose fasteners into body cavities",
        ],
        recordAfterStep: [
          "Fastener order and trim orientation",
          "Any pre-existing moisture, corrosion or damaged clips",
        ],
        estimatedMinutes: 20,
        check:
          "The work area is supported, illuminated and free of loose trim.",
      },
      {
        id: "replace",
        title: "Exchange the assembly",
        instruction:
          "Support the lamp, release the verified fasteners and connector, then position the replacement without trapping wiring.",
        beginnerDetail:
          "Never pull on wires. Release the connector by its housing and keep the sealing surface clean.",
        whyItMatters:
          "A correctly seated connector and undisturbed seal protect both lighting reliability and the vehicle interior from water ingress.",
        mistakesToAvoid: [
          "Using the wiring as a handle or levering against the painted body",
          "Trapping the harness behind the housing or tightening against a folded seal",
        ],
        recordAfterStep: [
          "Connector lock fully engaged",
          "Seal position and cable routing before the access trim is closed",
        ],
        estimatedMinutes: 35,
        check: "The connector is fully seated and the seal lies flat.",
        warning:
          "Use only the authoritative tightening specification for your exact vehicle.",
      },
      {
        id: "verify",
        title: "Verify the result",
        instruction:
          "Test every lamp function, inspect panel gaps and check the luggage area for sealing concerns.",
        beginnerDetail:
          "Ask a second person to observe brake and indicator functions while you operate the controls.",
        whyItMatters:
          "A lamp can illuminate yet still have an incorrect function, warning state, beam appearance or sealing problem.",
        mistakesToAvoid: [
          "Checking only the parking light and overlooking brake, reverse, fog and indicator functions",
          "Closing all trim before checking warnings, gaps and moisture protection",
        ],
        recordAfterStep: [
          "Photo or short video of every required function",
          "Final panel gaps, dashboard warning state and follow-up moisture check date",
        ],
        estimatedMinutes: 25,
        check: "All functions work and no warning is displayed.",
      },
    ],
  },
  {
    slug: "demo-n43-oil-service",
    partId: "demo-n43-service-kit",
    title: "Oil-service planning workflow",
    category: "Maintenance",
    summary:
      "A planning-only guide that demonstrates preparation, execution gates and post-service verification.",
    reviewStatus: "draft",
    revision: "0.1",
    updatedAt: "2026-09-05",
    applicability: ["BMW N43 concept", "Oil approval and capacity unverified"],
    sources: [
      {
        label: "VIN-specific workshop procedure still required",
        kind: "required",
      },
      {
        label: "Authoritative oil approval and capacity still required",
        kind: "required",
      },
    ],
    difficulty: "Moderate",
    estimatedMinutes: 70,
    vehicleRules: [
      {
        makes: ["BMW"],
        models: ["318i"],
        platforms: ["E90"],
        engineCodes: ["N43"],
      },
    ],
    video: {
      title: "Find a matching N43 oil-service walkthrough",
      url: "https://www.youtube.com/results?search_query=BMW+E90+N43+oil+service",
      source: "YouTube search",
      note: "Community reference only. Confirm the oil approval, capacity, filter and tightening values for the VIN.",
    },
    photos: [
      {
        src: "/capcar-bmw-current-front-close.webp",
        alt: "Black BMW E90 front three-quarter view",
        caption: "Record mileage and the untouched work area before service.",
      },
      {
        src: "/capcar-bmw-current-side.webp",
        alt: "Black BMW E90 side profile",
        caption:
          "Save the final leak check and service record after completion.",
      },
    ],
    installationPlan: {
      costRange: {
        min: 90,
        max: 220,
        currency: "EUR",
        note: "Planning range for materials, disposal and independent labour; local prices vary.",
      },
      prerequisites: [
        "VIN-specific oil approval and capacity",
        "Correct filter, seals and drain hardware",
        "Approved level access or lifting equipment",
      ],
      workAreaChecks: [
        "Level, ventilated work area with the vehicle secured against movement",
        "Approved lifting points, stands or a lift rated for the vehicle when underbody access is required",
        "Drain container capacity, absorbent material and a clear route to the legal waste-oil return point",
      ],
      consumables: [
        "Approved oil in the confirmed quantity",
        "Filter and all one-use seals",
        "Spill control and a legal waste-oil return route",
      ],
      technicalChecks: [
        "Take every tightening value and level-check sequence from an authoritative source.",
        "Record oil specification, quantity, date and mileage after the leak check.",
      ],
      legalChecks: [
        "Return used oil and contaminated materials through an approved collection route.",
        "Do not work beneath a vehicle supported only by a jack.",
      ],
      stopConditions: [
        "The specified oil approval, capacity, filter or sealing parts cannot be confirmed for the VIN.",
        "The lifting point, undertray, drain plug, filter housing or threads show damage.",
        "Oil contains metallic debris, coolant contamination or an unexplained fuel smell.",
      ],
      completionRecord: [
        "Record oil approval, brand, quantity, filter part number, mileage and service date.",
        "Photograph the clean drain and filter areas after the leak check.",
        "Keep the disposal receipt and note the vehicle-specific level-check result.",
      ],
      recommendedSetting: "Workshop recommended",
      recommendation:
        "Use a workshop unless safe access, fluid handling and the exact authoritative procedure are already available.",
    },
    tools: [
      "Approved lifting or access equipment",
      "Correct filter tool",
      "Drain container",
      "Protective gloves and eyewear",
    ],
    safetyChecks: [
      "Verify the exact oil approval, capacity, filter and sealing parts.",
      "Use an approved lifting method on level ground.",
      "Allow hot components and fluid to cool to a safe working temperature.",
    ],
    steps: [
      {
        id: "verify-parts",
        title: "Verify every service item",
        instruction:
          "Match the filter and sealing components to authoritative data for the exact engine and production date.",
        beginnerDetail:
          "Engine code alone may not resolve every part. Use VIN-specific data when available.",
        whyItMatters:
          "The wrong approval, quantity or seal can cause lubrication loss even when the filter appears to fit.",
        mistakesToAvoid: [
          "Buying by model name alone instead of confirming VIN and production date",
          "Reusing one-time seals or drain hardware when the verified procedure requires replacement",
        ],
        recordAfterStep: [
          "Oil approval and planned quantity",
          "Filter, seal and drain-hardware part numbers",
        ],
        estimatedMinutes: 15,
        check:
          "Oil approval, quantity, filter and seals are independently confirmed.",
      },
      {
        id: "prepare",
        title: "Prepare the work area",
        instruction:
          "Set up safe access, containment and spill protection using a verified workshop procedure.",
        beginnerDetail:
          "Have enough container capacity before opening the system and keep absorbent material nearby.",
        whyItMatters:
          "Stable access and spill containment are prerequisites, not cleanup details after fluid has already been released.",
        mistakesToAvoid: [
          "Relying on a jack without rated stands or a lift",
          "Opening the system before checking container position, capacity and escape route",
        ],
        recordAfterStep: [
          "Lifting points and support equipment used",
          "Existing leaks or underbody damage before service",
        ],
        estimatedMinutes: 15,
        check: "The vehicle is stable and spill control is ready.",
        warning: "Never work beneath a vehicle supported only by a jack.",
      },
      {
        id: "service",
        title: "Perform the verified service",
        instruction:
          "Follow the authoritative drain, filter replacement, sealing and refill sequence.",
        beginnerDetail:
          "This prototype intentionally omits capacities and torque values because they must match the exact vehicle.",
        whyItMatters:
          "The drain, sealing, filter and refill sequence controls whether the engine retains the correct amount of uncontaminated oil.",
        mistakesToAvoid: [
          "Guessing tightening values or copying them from a different engine",
          "Starting the engine before confirming the drain and filter areas are assembled and clean",
        ],
        recordAfterStep: [
          "Authoritative source used for each value",
          "Measured refill quantity and replaced one-use parts",
        ],
        estimatedMinutes: 25,
        check: "All values were taken from a verified source and recorded.",
      },
      {
        id: "post-check",
        title: "Run post-service checks",
        instruction:
          "Verify level using the vehicle-specific method, inspect for leaks and record date and mileage.",
        beginnerDetail:
          "Recheck after the specified settling or operating sequence from the official procedure.",
        whyItMatters:
          "The final level and leak check catches sealing or filling errors before they become an engine-damage event.",
        mistakesToAvoid: [
          "Treating the first level reading as final without following the required temperature and settling sequence",
          "Leaving contaminated material or used oil without an approved disposal plan",
        ],
        recordAfterStep: [
          "Final level result, warning state and leak-check outcome",
          "Date, mileage and disposal receipt",
        ],
        estimatedMinutes: 15,
        check:
          "Level and sealing are verified, and old fluid is ready for responsible disposal.",
      },
    ],
  },
  {
    slug: "demo-n43-panel-filter",
    partId: "demo-intake-n43",
    title: "Panel-filter concept installation",
    category: "Engine",
    summary:
      "A beginner-oriented workflow for checking and replacing a factory-airbox panel filter.",
    reviewStatus: "draft",
    revision: "0.1",
    updatedAt: "2026-09-05",
    applicability: ["BMW N43 concept", "Airbox variation unverified"],
    sources: [
      {
        label: "Vehicle-specific airbox procedure still required",
        kind: "required",
      },
      {
        label: "Filter manufacturer instructions still required",
        kind: "required",
      },
    ],
    difficulty: "Easy",
    estimatedMinutes: 25,
    vehicleRules: [
      {
        makes: ["BMW"],
        models: ["318i"],
        platforms: ["E90"],
        engineCodes: ["N43"],
      },
    ],
    video: {
      title: "BMW E90 air-filter walkthrough",
      url: "https://www.youtube.com/watch?v=bh-fughufxg",
      embedUrl: "https://www.youtube-nocookie.com/embed/bh-fughufxg",
      source: "AUTODOC",
      note: "Community reference only. Confirm the airbox and filter application for the exact engine before following it.",
    },
    photos: [
      {
        src: "/capcar-bmw-current-front-close.webp",
        alt: "Black BMW E90 front three-quarter view",
        caption: "Photograph every hose and clip disturbed during access.",
      },
      {
        src: "/capcar-bmw-current-side.webp",
        alt: "Black BMW E90 side profile",
        caption: "Record idle quality and warning state after the first start.",
      },
    ],
    installationPlan: {
      costRange: {
        min: 20,
        max: 80,
        currency: "EUR",
        note: "Parts and consumables planning range; workshop labour is excluded.",
      },
      prerequisites: [
        "Exact airbox and filter application",
        "Vehicle-specific opening sequence",
        "Cool engine bay and clean working area",
      ],
      workAreaChecks: [
        "Engine switched off, key removed and engine bay cool enough to touch safely",
        "Clean work light and a protected area where the old and new filters can be compared",
        "No loose leaves, grit, tools or cloths close to the open intake path",
      ],
      consumables: ["Clean cloth", "Low-pressure vacuum where appropriate"],
      technicalChecks: [
        "Confirm the seal is flat around its complete perimeter.",
        "Reconnect every hose, clip, sensor and fastener disturbed for access.",
      ],
      legalChecks: [
        "Use only a filter approved for the vehicle and local road requirements.",
        "Do not remove emissions or intake-monitoring equipment.",
      ],
      stopConditions: [
        "The filter outline, seal height or airflow orientation differs from the confirmed application.",
        "A hose, sensor, connector, clip or airbox fastener is cracked, seized or already damaged.",
        "Debris has entered beyond the filter or the airbox cannot close without force.",
      ],
      completionRecord: [
        "Record the filter part number, installation date and mileage.",
        "Photograph the seated perimeter before closing and every connection disturbed for access.",
        "After the first drive, record whether idle, warning lights and intake noise remain normal.",
      ],
      recommendedSetting: "DIY suitable",
      recommendation:
        "A low-risk DIY task when the exact filter and airbox procedure are confirmed; stop if sensors or brittle hoses must be disturbed.",
    },
    tools: ["Work light", "Clean cloth", "Vehicle-appropriate hand tools"],
    safetyChecks: [
      "Switch the engine off and allow the engine bay to cool.",
      "Confirm the filter dimensions and airbox application.",
      "Keep debris away from the open intake path.",
    ],
    steps: [
      {
        id: "compare",
        title: "Compare the filters",
        instruction:
          "Confirm the replacement has the same outline, seal position and orientation as the verified original.",
        beginnerDetail:
          "Do this before opening the airbox so an incorrect part can remain clean and returnable.",
        whyItMatters:
          "A filter that is slightly wrong can distort, bypass its seal or prevent the airbox from closing evenly.",
        mistakesToAvoid: [
          "Comparing only length and width while ignoring seal thickness and orientation",
          "Removing packaging before the application has been confirmed",
        ],
        recordAfterStep: [
          "Replacement part number and application source",
          "Side-by-side photo of outline, seal and airflow marking",
        ],
        estimatedMinutes: 5,
        check: "Dimensions and sealing edges match.",
      },
      {
        id: "open",
        title: "Open the verified airbox",
        instruction:
          "Release only the fasteners identified by the vehicle-specific procedure.",
        beginnerDetail:
          "Photograph hose and clip positions. Do not strain connected sensors or wiring.",
        whyItMatters:
          "Most intake-service mistakes happen around access: a strained sensor lead or loose hose can create faults unrelated to the new filter.",
        mistakesToAvoid: [
          "Opening unverified clips or fasteners simply because they are nearby",
          "Letting the airbox lid hang from a hose, sensor or wiring loom",
        ],
        recordAfterStep: [
          "Photo of every hose, plug and clip disturbed",
          "Any cracked fastener, hose or connector found before removal",
        ],
        estimatedMinutes: 7,
        check: "The lid moves freely without pulling on a cable or hose.",
      },
      {
        id: "install",
        title: "Seat the filter",
        instruction:
          "Remove loose debris without pushing it into the intake, then seat the filter evenly in its channel.",
        beginnerDetail:
          "A folded or pinched seal can allow unfiltered air past the element.",
        whyItMatters:
          "The filter works only when all intake air passes through the media rather than around a damaged or mis-seated edge.",
        mistakesToAvoid: [
          "Using high-pressure air that drives debris deeper into the intake",
          "Forcing the lid down over a filter that has lifted out of its channel",
        ],
        recordAfterStep: [
          "Clean airbox base before installation",
          "Photo showing the complete seated seal perimeter",
        ],
        estimatedMinutes: 6,
        check: "The seal is flat around its complete perimeter.",
      },
      {
        id: "close",
        title: "Close and inspect",
        instruction:
          "Reassemble using the verified sequence and confirm every connection disturbed during access.",
        beginnerDetail:
          "Before starting, look around the engine bay for tools, cloths or disconnected plugs.",
        whyItMatters:
          "A final connection and tool check prevents unmetered air, warning lights and loose objects in the engine bay.",
        mistakesToAvoid: [
          "Tightening one side fully before the lid is seated evenly",
          "Starting the engine with a connector unplugged or a cloth left near the intake",
        ],
        recordAfterStep: [
          "Final fastener, hose and connector check",
          "Idle quality, warning state and intake noise after the first start",
        ],
        estimatedMinutes: 7,
        check: "The airbox is closed evenly and the engine bay is clear.",
      },
    ],
  },
  ...bmwE90Guides,
];

function normalized(value: string) {
  return value.trim().toUpperCase();
}

export function guideMatchesVehicle(
  guide: InstallationGuide,
  vehicle: Pick<Vehicle, "make" | "model" | "platform" | "engineCode">,
) {
  if (!guide.vehicleRules?.length) return true;

  return guide.vehicleRules.some((rule) => {
    const make = normalized(vehicle.make);
    const model = normalized(vehicle.model);
    const platform = normalized(vehicle.platform);
    const engine = normalized(vehicle.engineCode);

    const makeMatches =
      !rule.makes?.length ||
      rule.makes.some((candidate) => make === normalized(candidate));
    const modelMatches =
      !rule.models?.length ||
      rule.models.some((candidate) => model.includes(normalized(candidate)));
    const platformMatches =
      !rule.platforms?.length ||
      rule.platforms.some((candidate) => platform === normalized(candidate));
    const engineMatches =
      !rule.engineCodes?.length ||
      rule.engineCodes.some((candidate) =>
        engine.startsWith(normalized(candidate)),
      );

    return makeMatches && modelMatches && platformMatches && engineMatches;
  });
}

export function findGuideBySlug(slug: string) {
  return installationGuides.find((guide) => guide.slug === slug);
}

export function findGuideForPart(partId: string) {
  return installationGuides.find((guide) => guide.partId === partId);
}
