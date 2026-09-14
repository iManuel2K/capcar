import { dailyCarProblems } from "@/features/problems/daily-car-coverage";
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
  check: string;
  warning?: string;
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
  safetyChecks: string[];
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
        check: "All functions work and no warning is displayed.",
      },
    ],
  },
  {
    slug: "demo-n43-oil-service",
    partId: "demo-n43-service-kit",
    title: "Oil-service planning workflow",
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
        check: "All values were taken from a verified source and recorded.",
      },
      {
        id: "post-check",
        title: "Run post-service checks",
        instruction:
          "Verify level using the vehicle-specific method, inspect for leaks and record date and mileage.",
        beginnerDetail:
          "Recheck after the specified settling or operating sequence from the official procedure.",
        check:
          "Level and sealing are verified, and old fluid is ready for responsible disposal.",
      },
    ],
  },
  {
    slug: "demo-n43-panel-filter",
    partId: "demo-intake-n43",
    title: "Panel-filter concept installation",
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
        check: "Dimensions and sealing edges match.",
      },
      {
        id: "open",
        title: "Open the verified airbox",
        instruction:
          "Release only the fasteners identified by the vehicle-specific procedure.",
        beginnerDetail:
          "Photograph hose and clip positions. Do not strain connected sensors or wiring.",
        check: "The lid moves freely without pulling on a cable or hose.",
      },
      {
        id: "install",
        title: "Seat the filter",
        instruction:
          "Remove loose debris without pushing it into the intake, then seat the filter evenly in its channel.",
        beginnerDetail:
          "A folded or pinched seal can allow unfiltered air past the element.",
        check: "The seal is flat around its complete perimeter.",
      },
      {
        id: "close",
        title: "Close and inspect",
        instruction:
          "Reassemble using the verified sequence and confirm every connection disturbed during access.",
        beginnerDetail:
          "Before starting, look around the engine bay for tools, cloths or disconnected plugs.",
        check: "The airbox is closed evenly and the engine bay is clear.",
      },
    ],
  },
];

export function findGuideBySlug(slug: string) {
  return installationGuides.find((guide) => guide.slug === slug);
}

export function findGuideForPart(partId: string) {
  return installationGuides.find((guide) => guide.partId === partId);
}
