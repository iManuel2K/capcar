import type {
  GuideCategory,
  GuideDifficulty,
  InstallationGuide,
} from "@/features/guides/guide-catalog";

type ShowcaseVehicleGuideConfig = {
  key: string;
  label: string;
  year: number;
  make: string;
  model: string;
  platform: string;
  engineCode: string;
  image: string;
  manualLabel: string;
  manualUrl: string;
  workshopLabel: string;
  workshopUrl: string;
};

type SharedGuideTemplate = {
  slug: string;
  title: string;
  summary: string;
  category: GuideCategory;
  difficulty: GuideDifficulty;
  minutes: number;
  tools: string[];
  part: string;
  specification: string;
  valueLabel: string;
  value: string;
  setting?: "DIY suitable" | "Experienced DIY" | "Workshop recommended";
  steps: Array<[title: string, instruction: string, check: string]>;
};

const verifiedAt = "2026-10-15";

const vehicles: ShowcaseVehicleGuideConfig[] = [
  {
    key: "ford-f150-p702",
    label: "2021 Ford F-150 3.5 EcoBoost",
    year: 2021,
    make: "Ford",
    model: "F-150",
    platform: "P702",
    engineCode: "3.5 ECOBOOST",
    image: "/capcar-project-f150.png",
    manualLabel: "Ford · 2021 F-150 Owner's Manual",
    manualUrl:
      "https://www.fordservicecontent.com/Ford_Content/Catalog/owner_information/2021-Ford-F-150-Owners-Manual-version-2_om_EN-US_10_2021.pdf",
    workshopLabel: "Ford Motorcraft Service",
    workshopUrl: "https://www.motorcraftservice.com/",
  },
  {
    key: "mercedes-w213",
    label: "2019 Mercedes-Benz E 300 W213",
    year: 2019,
    make: "Mercedes-Benz",
    model: "E 300",
    platform: "W213",
    engineCode: "M264",
    image: "/capcar-project-eclass.png",
    manualLabel: "Mercedes-Benz · W213 Owner's Manual",
    manualUrl:
      "https://static.oneweb.mercedes-benz.com/css-oom-assets/en-sa/pdf/mercedes-e-class-saloon-2019-february-w213-comand-owners-manual-1.pdf",
    workshopLabel: "Mercedes-Benz XENTRY WIS",
    workshopUrl:
      "https://b2bconnect.mercedes-benz.com/at/shop/workshop-solutions/xentry-wis",
  },
  {
    key: "vw-golf-gti-tcr",
    label: "2019 Volkswagen Golf GTI TCR",
    year: 2019,
    make: "Volkswagen",
    model: "Golf GTI TCR",
    platform: "MK7.5",
    engineCode: "EA888",
    image: "/capcar-project-gti-tcr.png",
    manualLabel: "Volkswagen · Digital Owner's Manual",
    manualUrl:
      "https://www.volkswagen.de/de/besitzer-und-service/ueber-ihr-auto/digitale-betriebsanleitung.html",
    workshopLabel: "Volkswagen erWin workshop information",
    workshopUrl:
      "https://www.volkswagen.de/de/besitzer-und-service/ueber-ihr-auto/kundeninformationen.html/__layer/layers/as-4/ueber-ihr-auto/kundeninformationen/kundeninformationen/funktionen-erwin/master.layer",
  },
];

const templates: SharedGuideTemplate[] = [
  {
    slug: "tyres-pressure-condition",
    title: "Tyre pressure & condition",
    summary: "Set cold pressures for the fitted tyres and record wear early.",
    category: "Maintenance",
    difficulty: "Easy",
    minutes: 18,
    tools: [
      "Digital tyre gauge",
      "Tyre inflator",
      "Tread-depth gauge",
      "Chalk marker",
    ],
    part: "Valve caps or tyre repair item",
    specification:
      "Match the fitted wheel and tyre package; use a VIN lookup when ordering TPMS hardware.",
    valueLabel: "Cold tyre pressure",
    value: "Use the vehicle placard for the fitted tyre size and current load.",
    steps: [
      [
        "Read the placard",
        "Record front and rear values for the current load before adjusting anything.",
        "Correct targets are saved.",
      ],
      [
        "Measure cold",
        "Check every tyre before a long drive and inspect inner, centre and outer tread.",
        "Readings and visible condition are recorded.",
      ],
      [
        "Set and confirm",
        "Adjust, reinstall caps and repeat the measurement.",
        "Final values match the placard.",
      ],
    ],
  },
  {
    slug: "wiper-blades",
    title: "Wiper-blade replacement",
    summary:
      "Match both blade lengths and protect the glass while changing them.",
    category: "Maintenance",
    difficulty: "Easy",
    minutes: 12,
    tools: ["Microfibre towel", "Glass cleaner", "Work gloves"],
    part: "Front wiper blade set",
    specification:
      "Confirm driver/passenger length, connector and production split by VIN.",
    valueLabel: "Service position",
    value:
      "Use the sequence in the vehicle owner's manual; never force the arm past its stop.",
    steps: [
      [
        "Match the set",
        "Compare length and adapter before lifting either arm.",
        "Both replacements match.",
      ],
      [
        "Protect the glass",
        "Place a folded towel beneath the arm and replace one side at a time.",
        "A bare arm cannot strike the glass.",
      ],
      [
        "Lock and test",
        "Confirm the adapter latch, then test wipe and wash operation.",
        "Sweep is quiet and complete.",
      ],
    ],
  },
  {
    slug: "washer-fluid-system",
    title: "Washer-fluid system check",
    summary: "Check fluid, spray pattern and visible leaks in a useful order.",
    category: "Maintenance",
    difficulty: "Easy",
    minutes: 18,
    tools: [
      "Funnel",
      "Inspection light",
      "Microfibre towel",
      "Washer-fluid tester",
    ],
    part: "Approved washer fluid",
    specification:
      "Choose a seasonal product compatible with the owner's manual and local temperature.",
    valueLabel: "Freeze protection",
    value:
      "Set for the lowest expected ambient temperature shown on the product tester.",
    steps: [
      [
        "Identify the fluid",
        "Do not mix an unknown product; record the existing fluid first.",
        "Product and concentration are known.",
      ],
      [
        "Observe the spray",
        "Compare nozzles, pump sound and any visible leak trace.",
        "The weak area is identified.",
      ],
      [
        "Clean and confirm",
        "Clean only external dirt and repeat the short spray test.",
        "Pattern is even and no leak is visible.",
      ],
    ],
  },
  {
    slug: "exterior-lighting-check",
    title: "Exterior lighting check",
    summary: "Record every lamp function before replacing a bulb or assembly.",
    category: "Electrical",
    difficulty: "Easy",
    minutes: 15,
    tools: [
      "Work gloves",
      "Inspection mirror",
      "Phone camera",
      "Microfibre towel",
    ],
    part: "Lamp, bulb or lighting module",
    specification:
      "Resolve lamp technology, approval and part number by VIN before ordering.",
    valueLabel: "Lighting technology",
    value:
      "Confirm halogen, xenon or LED from the installed unit and owner's manual.",
    steps: [
      [
        "Run every function",
        "Record dipped, main, position, indicator, brake, reverse and fog functions where fitted.",
        "The failed function is isolated.",
      ],
      [
        "Inspect the housing",
        "Look for condensation, heat damage, broken seals or connector damage.",
        "Housing condition is photographed.",
      ],
      [
        "Choose the next action",
        "Use the VIN-specific access procedure or book diagnosis for sealed LED systems.",
        "Correct repair path is selected.",
      ],
    ],
  },
  {
    slug: "engine-oil-level",
    title: "Engine-oil level & condition",
    summary: "Measure with the vehicle procedure and avoid topping up blindly.",
    category: "Engine",
    difficulty: "Easy",
    minutes: 15,
    tools: ["Nitrile gloves", "Microfibre towel", "Funnel", "Phone notes"],
    part: "Manufacturer-approved engine oil",
    specification:
      "Use the exact approval and viscosity listed for the saved engine and market.",
    valueLabel: "Level procedure",
    value:
      "Follow the owner's manual conditions: level ground, temperature and electronic/dipstick sequence.",
    steps: [
      [
        "Prepare the measurement",
        "Park level and meet the manual's temperature and shutdown conditions.",
        "Measurement conditions are correct.",
      ],
      [
        "Read and record",
        "Use the specified electronic display or dipstick method without estimating.",
        "Level and warning state are recorded.",
      ],
      [
        "Top up cautiously",
        "Only add approved oil in small increments and remeasure.",
        "Level is within range without overfill.",
      ],
    ],
  },
  {
    slug: "coolant-level-leaks",
    title: "Coolant level & leak check",
    summary:
      "Inspect only when fully cold and record anything that needs diagnosis.",
    category: "Engine",
    difficulty: "Easy",
    minutes: 15,
    tools: [
      "Inspection light",
      "Nitrile gloves",
      "Microfibre towel",
      "Phone camera",
    ],
    part: "Manufacturer-approved coolant",
    specification:
      "Do not select by colour alone; confirm the exact approval for this engine and market.",
    valueLabel: "Safe inspection state",
    value:
      "Engine completely cold; never open a warm or pressurised cooling system.",
    setting: "Workshop recommended",
    steps: [
      [
        "Wait until cold",
        "Do not loosen a cap while the system is warm or pressurised.",
        "Engine is fully cold.",
      ],
      [
        "Read the indicator",
        "Use the model-specific level indicator and inspect fluid appearance.",
        "Level and appearance are recorded.",
      ],
      [
        "Trace visible residue",
        "Photograph residue at the tank, hose joints and parking position.",
        "Any leak evidence is ready for diagnosis.",
      ],
    ],
  },
  {
    slug: "battery-health",
    title: "12 V battery health",
    summary:
      "Record the installed battery and charging symptoms before replacement.",
    category: "Electrical",
    difficulty: "Moderate",
    minutes: 25,
    tools: ["Battery tester", "Multimeter", "Safety glasses", "Phone camera"],
    part: "12 V replacement battery",
    specification:
      "Match chemistry, capacity, case, terminals and venting by VIN and installed label.",
    valueLabel: "Battery management",
    value:
      "Check whether registration, adaptation or battery monitoring reset is required.",
    setting: "Workshop recommended",
    steps: [
      [
        "Record the installed unit",
        "Photograph chemistry, capacity, date code, vent and terminal layout.",
        "Installed specification is saved.",
      ],
      [
        "Test before replacing",
        "Record rested voltage and a proper battery-test result.",
        "Battery condition is measured, not guessed.",
      ],
      [
        "Plan the correct replacement",
        "Confirm power-down, registration and diagnostic requirements.",
        "Replacement path is documented.",
      ],
    ],
  },
  {
    slug: "cabin-filter",
    title: "Cabin filter replacement",
    summary: "Restore airflow with a filter matched to the exact housing.",
    category: "Maintenance",
    difficulty: "Easy",
    minutes: 25,
    tools: [
      "Small socket set",
      "Plastic trim tool",
      "Soft brush",
      "Work gloves",
    ],
    part: "Cabin filter element",
    specification:
      "Confirm shape, dimensions, charcoal option and airflow direction by VIN.",
    valueLabel: "Installation direction",
    value:
      "Follow the airflow arrow and housing marks; do not infer direction from the old filter alone.",
    steps: [
      [
        "Match the element",
        "Compare shape, seals and airflow marking before opening the housing.",
        "Replacement matches.",
      ],
      [
        "Open without force",
        "Follow the manual access route and account for every fastener.",
        "Housing is open without damaged clips.",
      ],
      [
        "Clean, seat and test",
        "Remove loose debris, seat the filter evenly and test the fan.",
        "Airflow is normal with no rattle.",
      ],
    ],
  },
  {
    slug: "engine-air-filter",
    title: "Engine air-filter check",
    summary: "Inspect the intake element without disturbing sensors or seals.",
    category: "Engine",
    difficulty: "Easy",
    minutes: 25,
    tools: ["Socket set", "Torx set", "Soft brush", "Inspection light"],
    part: "Engine air-filter element",
    specification:
      "Use VIN and engine code to confirm dimensions, sealing lip and production split.",
    valueLabel: "Housing closure",
    value:
      "All tabs and seals must sit evenly; use only manufacturer workshop torque where specified.",
    steps: [
      [
        "Confirm the filter",
        "Compare the replacement and document the unopened intake layout.",
        "Application and orientation match.",
      ],
      [
        "Open cleanly",
        "Keep debris away from the clean side and do not strain sensor wiring.",
        "Housing is safely open.",
      ],
      [
        "Seat and inspect",
        "Install evenly, close every clip or fastener and inspect intake joints.",
        "Housing is fully sealed.",
      ],
    ],
  },
  {
    slug: "brake-visual-check",
    title: "Brake visual health check",
    summary:
      "Document visible condition and symptoms without treating appearance as diagnosis.",
    category: "Diagnostics",
    difficulty: "Moderate",
    minutes: 30,
    tools: [
      "Inspection light",
      "Brake inspection mirror",
      "Phone camera",
      "Notes app",
    ],
    part: "Brake wear component",
    specification:
      "Rotor, pad, sensor and hardware vary by axle, option code and production date.",
    valueLabel: "Service limits & torque",
    value:
      "Use VIN-filtered workshop information; no universal value is safe for this guide.",
    setting: "Workshop recommended",
    steps: [
      [
        "Record symptoms",
        "Save noise, vibration, warning and pulling conditions.",
        "Symptoms are documented.",
      ],
      [
        "Inspect without dismantling",
        "Photograph visible pad, disc, hose and leak condition through the wheel.",
        "Visible evidence is saved.",
      ],
      [
        "Choose a safe next step",
        "Book measurement for uncertain thickness, fluid loss or changed braking.",
        "No repair is inferred from appearance alone.",
      ],
    ],
  },
  {
    slug: "obd-scan-baseline",
    title: "OBD diagnostic baseline",
    summary:
      "Save codes and freeze-frame data before clearing or buying parts.",
    category: "Diagnostics",
    difficulty: "Easy",
    minutes: 20,
    tools: [
      "Compatible diagnostic scanner",
      "Phone or laptop",
      "Battery voltage tester",
      "Notes app",
    ],
    part: "Diagnostic interface",
    specification:
      "Use a tool that supports the vehicle's manufacturer modules, not only generic emissions codes.",
    valueLabel: "Evidence rule",
    value:
      "Save complete scan, status and freeze-frame data before clearing any fault.",
    steps: [
      [
        "Stabilise voltage",
        "Follow the scanner's ignition sequence and avoid a low-voltage session.",
        "Connection is stable.",
      ],
      [
        "Scan all available modules",
        "Export codes, status, freeze-frame and communication faults.",
        "Original report is saved.",
      ],
      [
        "Interpret before clearing",
        "Write the next diagnostic test instead of replacing a part from a code alone.",
        "Next action is evidence-based.",
      ],
    ],
  },
  {
    slug: "drive-belt-inspection",
    title: "Drive-belt visual inspection",
    summary:
      "Spot cracking, contamination and tracking issues with the engine stopped.",
    category: "Engine",
    difficulty: "Moderate",
    minutes: 20,
    tools: [
      "Inspection light",
      "Inspection mirror",
      "Phone camera",
      "Work gloves",
    ],
    part: "Accessory drive belt",
    specification:
      "Confirm length, routing and tensioner system by VIN and engine code.",
    valueLabel: "Inspection state",
    value:
      "Engine stopped, key removed and all rotating parts stationary and cool.",
    setting: "Workshop recommended",
    steps: [
      [
        "Power down and cool",
        "Keep hands and tools away until all moving parts are stationary.",
        "Engine cannot start.",
      ],
      [
        "Inspect visible surfaces",
        "Photograph fraying, cracking, glazing or contamination without rotating the engine by hand.",
        "Condition is recorded.",
      ],
      [
        "Check belt path",
        "Look for leak traces, damaged pulley edges or obvious misalignment.",
        "Workshop receives a clear finding.",
      ],
    ],
  },
  {
    slug: "door-hinges-seals",
    title: "Door hinge & seal care",
    summary:
      "Quiet hinges and protect seals without overspraying trim or paint.",
    category: "Exterior",
    difficulty: "Easy",
    minutes: 25,
    tools: [
      "Detailing brush",
      "Microfibre towel",
      "Precision applicator",
      "Nitrile gloves",
    ],
    part: "Compatible hinge or seal-care product",
    specification:
      "Check product compatibility with painted hinges, rubber and flocked seals.",
    valueLabel: "Application rule",
    value:
      "Clean first, apply sparingly and remove all runoff before cycling the door.",
    steps: [
      [
        "Clean and inspect",
        "Remove grit and note damaged check straps, seals or corrosion.",
        "Condition is visible.",
      ],
      [
        "Apply precisely",
        "Use the smallest practical amount only at the intended surface.",
        "No product reaches trim or paint.",
      ],
      [
        "Cycle and wipe",
        "Move the door gently and remove excess product.",
        "Movement is quiet and clean.",
      ],
    ],
  },
  {
    slug: "interior-rattle-baseline",
    title: "Interior rattle baseline",
    summary: "Locate the noise before removing trim or ordering clips.",
    category: "Interior",
    difficulty: "Easy",
    minutes: 30,
    tools: ["Phone recorder", "Plastic trim tools", "Work light", "Felt tape"],
    part: "Vehicle-specific trim retainer",
    specification:
      "Match retainer geometry and panel location through VIN-filtered parts information.",
    valueLabel: "Removal map",
    value:
      "Use the panel-specific attachment diagram; hidden screws and airbags vary by trim level.",
    steps: [
      [
        "Reproduce the noise",
        "Record surface, temperature, speed and road condition.",
        "The rattle is repeatable.",
      ],
      [
        "Map the panel",
        "Confirm hidden screws, clips, wiring and nearby airbags before removal.",
        "Attachment map is known.",
      ],
      [
        "Repair one cause",
        "Replace only damaged retainers, then retest before adding padding.",
        "Original noise is resolved without a new one.",
      ],
    ],
  },
  {
    slug: "paint-chip-check",
    title: "Paint-chip inspection",
    summary:
      "Record chips early and separate surface damage from exposed metal.",
    category: "Exterior",
    difficulty: "Easy",
    minutes: 25,
    tools: [
      "Detail light",
      "pH-neutral cleaner",
      "Microfibre towel",
      "Phone camera",
    ],
    part: "VIN-matched touch-up system",
    specification:
      "Confirm the paint code from the vehicle record; colour name alone is insufficient.",
    valueLabel: "Repair limit",
    value:
      "Rust, lifting paint or damage across a panel edge should be assessed professionally.",
    steps: [
      [
        "Clean gently",
        "Remove dirt without polishing away the evidence.",
        "Damage edges are visible.",
      ],
      [
        "Classify the chip",
        "Photograph size, depth, exposed substrate and location.",
        "Repair scope is recorded.",
      ],
      [
        "Protect or escalate",
        "Use a matched system only within its instructions or book paint repair.",
        "Next step protects the panel.",
      ],
    ],
  },
  {
    slug: "headlight-lens-care",
    title: "Headlight lens assessment",
    summary:
      "Separate external haze from cracks, moisture and internal damage.",
    category: "Exterior",
    difficulty: "Moderate",
    minutes: 35,
    tools: ["Detail light", "Masking tape", "Microfibre towel", "Phone camera"],
    part: "UV-protected lens restoration system",
    specification:
      "Use only a complete system that restores UV protection; polishing alone is temporary.",
    valueLabel: "Stop condition",
    value:
      "Cracks, failed seals, internal haze or adaptive-light faults require component diagnosis.",
    steps: [
      [
        "Inspect dry and illuminated",
        "Compare both sides for haze, cracks, moisture and beam appearance.",
        "Defect type is recorded.",
      ],
      [
        "Protect adjacent surfaces",
        "Clean and mask paint, trim and seals before any abrasion.",
        "No adjacent surface is exposed.",
      ],
      [
        "Choose the finish",
        "Use a full restoration system or book replacement/repair for sealed damage.",
        "UV protection is part of the plan.",
      ],
    ],
  },
  {
    slug: "exhaust-mount-check",
    title: "Exhaust mount inspection",
    summary:
      "Trace knocks and movement without entering an unsupported vehicle.",
    category: "Diagnostics",
    difficulty: "Moderate",
    minutes: 25,
    tools: [
      "Inspection light",
      "Inspection mirror",
      "Phone camera",
      "Work gloves",
    ],
    part: "Exhaust hanger or clamp",
    specification:
      "Match hanger shape, pipe diameter and mounting position by VIN.",
    valueLabel: "Safe access",
    value:
      "System fully cold; never crawl under a vehicle supported only by a jack.",
    setting: "Workshop recommended",
    steps: [
      [
        "Cool and secure",
        "Park safely and wait until every visible exhaust part is cold.",
        "Inspection state is safe.",
      ],
      [
        "Observe from outside",
        "Photograph torn rubber, shifted brackets, contact marks and tailpipe position.",
        "Visible condition is recorded.",
      ],
      [
        "Describe the symptom",
        "Note when the knock occurs and share it with the workshop.",
        "Repair request includes useful evidence.",
      ],
    ],
  },
  {
    slug: "emergency-kit",
    title: "Emergency-kit readiness",
    summary: "Check the items that matter before a long drive.",
    category: "Interior",
    difficulty: "Easy",
    minutes: 20,
    tools: ["Inventory checklist", "Torch", "Tyre gauge", "Charging cable"],
    part: "Market-required emergency equipment",
    specification:
      "Requirements vary by country; check every destination and transit country.",
    valueLabel: "Expiry check",
    value:
      "Record first-aid, sealant, extinguisher and battery expiry dates where fitted.",
    steps: [
      [
        "Inventory the vehicle",
        "Check legal equipment, recovery items and owner-manual locations.",
        "Required items are present.",
      ],
      [
        "Check dates and charge",
        "Record expiries and charge lights, jump packs and communication devices.",
        "Time-sensitive items are ready.",
      ],
      [
        "Secure everything",
        "Store heavy items so they cannot move in a collision.",
        "Equipment is accessible and restrained.",
      ],
    ],
  },
  {
    slug: "software-recall-check",
    title: "Recall & software check",
    summary: "Use the VIN to check open campaigns and save the result.",
    category: "Diagnostics",
    difficulty: "Easy",
    minutes: 15,
    tools: [
      "Vehicle VIN",
      "Manufacturer account",
      "Phone or laptop",
      "Service history",
    ],
    part: "No part purchase before campaign confirmation",
    specification:
      "Recall eligibility and software campaigns are VIN-specific and can change.",
    valueLabel: "Authoritative result",
    value:
      "Use the manufacturer or national safety authority; save the date and campaign identifier.",
    steps: [
      [
        "Confirm the VIN",
        "Read all 17 characters from the vehicle or registration record.",
        "VIN is exact.",
      ],
      [
        "Check authoritative portals",
        "Search the manufacturer and national safety authority.",
        "Current result is saved.",
      ],
      [
        "Book, do not DIY",
        "Contact an authorised workshop for any open safety campaign.",
        "Campaign action is arranged.",
      ],
    ],
  },
  {
    slug: "seasonal-readiness",
    title: "Seasonal readiness check",
    summary:
      "Prepare visibility, tyres, fluids and battery before conditions change.",
    category: "Maintenance",
    difficulty: "Easy",
    minutes: 35,
    tools: [
      "Tyre gauge",
      "Washer-fluid tester",
      "Battery tester",
      "Inspection light",
    ],
    part: "Season-appropriate consumables",
    specification:
      "Use vehicle approvals and the legal requirements of the region where the car will be driven.",
    valueLabel: "Planning basis",
    value:
      "Prepare for the lowest expected temperature, load and journey—not only today's weather.",
    steps: [
      [
        "Visibility",
        "Check glass, wipers, washers and every exterior light.",
        "Visibility systems are ready.",
      ],
      [
        "Contact and fluids",
        "Record tyre condition, pressures, coolant and washer protection.",
        "Cold-condition values are documented.",
      ],
      [
        "Energy and equipment",
        "Test the 12 V battery and update emergency equipment.",
        "Vehicle is ready for the planned season.",
      ],
    ],
  },
  {
    slug: "pre-trip-inspection",
    title: "Pre-trip inspection",
    summary:
      "Turn a long journey into a short, evidence-based readiness check.",
    category: "Maintenance",
    difficulty: "Easy",
    minutes: 30,
    tools: ["Owner's manual", "Tyre gauge", "Inspection light", "Phone camera"],
    part: "Trip-specific spare or consumable",
    specification:
      "Select only after checking route, load, weather and manufacturer requirements.",
    valueLabel: "Load condition",
    value:
      "Use the tyre/load and towing data for the actual passengers, cargo and trailer.",
    steps: [
      [
        "Walk around",
        "Record tyres, lights, glass, leaks and body damage before loading.",
        "Baseline photos are saved.",
      ],
      [
        "Check vehicle status",
        "Review warnings, service due items, fluids and battery state.",
        "No unresolved safety warning remains.",
      ],
      [
        "Match the trip",
        "Set pressures for load and confirm documents, charging and emergency equipment.",
        "Trip configuration is ready.",
      ],
    ],
  },
  {
    slug: "dashcam-route",
    title: "Dashcam cable routing",
    summary: "Plan a reversible cable path clear of airbags and visibility.",
    category: "Interior",
    difficulty: "Moderate",
    minutes: 55,
    tools: [
      "Plastic trim tools",
      "Cable clips",
      "Multimeter",
      "Microfibre towel",
    ],
    part: "Vehicle-compatible dashcam power kit",
    specification:
      "Confirm supply type, fuse strategy and low-voltage protection before installation.",
    valueLabel: "Airbag clearance",
    value:
      "Use the vehicle restraint-system layout; never route a cable across an airbag deployment path.",
    setting: "Experienced DIY",
    steps: [
      [
        "Choose the legal position",
        "Protect the driver's view and comply with local recording rules.",
        "Mount position is acceptable.",
      ],
      [
        "Map airbags and power",
        "Confirm the restraint layout and approved power strategy.",
        "Cable route avoids every deployment path.",
      ],
      [
        "Test before closing",
        "Verify startup, shutdown and battery protection before refitting trim.",
        "System works and final routing is photographed.",
      ],
    ],
  },
];

function makeGuide(
  vehicle: ShowcaseVehicleGuideConfig,
  template: SharedGuideTemplate,
): InstallationGuide {
  const stepCount = template.steps.length;
  return {
    slug: `${vehicle.key}-${template.slug}`,
    partId: `guide-${vehicle.key}-${template.slug}`,
    title: template.title,
    summary: template.summary,
    category: template.category,
    reviewStatus: "reviewed",
    revision: "1.0",
    updatedAt: verifiedAt,
    applicability: [vehicle.label, vehicle.platform, vehicle.engineCode],
    vehicleRules: [
      {
        makes: [vehicle.make],
        models: [vehicle.model],
        platforms: [vehicle.platform],
        engineCodes: [vehicle.engineCode],
      },
    ],
    sources: [
      {
        label: vehicle.manualLabel,
        kind: "manufacturer",
        url: vehicle.manualUrl,
        verifiedAt,
      },
      {
        label: vehicle.workshopLabel,
        kind: "authoritative",
        url: vehicle.workshopUrl,
        verifiedAt,
      },
    ],
    difficulty: template.difficulty,
    estimatedMinutes: template.minutes,
    tools: template.tools,
    video: {
      title: `Open the illustrated ${vehicle.model} reference`,
      url: vehicle.manualUrl,
      source: vehicle.manualLabel,
      note: "Manufacturer reference. Use the saved VIN and installed equipment to select the exact procedure before dismantling.",
    },
    photos: [
      {
        src: vehicle.image,
        alt: vehicle.label,
        caption:
          "Save a clear before photo of the untouched vehicle and work area.",
      },
      {
        src: vehicle.image,
        alt: `${vehicle.label} completion record`,
        caption:
          "Save the finished state, part label and final check to the vehicle timeline.",
      },
    ],
    parts: [
      {
        name: template.part,
        specification: template.specification,
        note: "CapCar will not invent a part number. Add the VIN to resolve the exact production split.",
      },
    ],
    specifications: [
      {
        label: template.valueLabel,
        value: template.value,
        sourceLabel: vehicle.manualLabel,
        sourceUrl: vehicle.manualUrl,
      },
    ],
    safetyChecks: [
      "Confirm the saved vehicle identity, VIN and installed equipment before starting.",
      "Park securely, power down and allow hot or moving components to become safe.",
      "Stop for a warning, leak, damaged wiring, seized hardware or any mismatch with the manufacturer procedure.",
    ],
    installationPlan: {
      costRange: {
        min: 0,
        max:
          template.difficulty === "Easy"
            ? 120
            : template.difficulty === "Moderate"
              ? 260
              : 500,
        currency: "EUR",
        note: "Planning range only; VIN-specific parts, labour and hidden damage vary.",
      },
      prerequisites: [
        "Saved VIN and installed equipment confirmed",
        "Manufacturer reference opened for the exact vehicle",
      ],
      workAreaChecks: [
        "Stable, dry and well-lit work area",
        "Hardware tray and camera ready before dismantling",
      ],
      consumables: ["Clean gloves", "Vehicle-approved parts or product"],
      technicalChecks: [
        "Use only VIN-filtered part numbers and values",
        "Compare every connector, seal and fastener with the original",
      ],
      legalChecks: [
        "Keep required road equipment and approvals intact",
        "Follow local disposal, lighting, recording and modification rules",
      ],
      stopConditions: [
        "The vehicle differs from the saved identity or reference",
        "A safety-critical fault, damaged component or unknown value is found",
      ],
      completionRecord: [
        "Date, mileage, part/product label and source used",
        "Before/after photos and final check result",
      ],
      recommendedSetting:
        template.setting ??
        (template.difficulty === "Easy" ? "DIY suitable" : "Experienced DIY"),
      recommendation:
        "Use CapCar as the concise work plan and the manufacturer source for the exact vehicle procedure.",
    },
    steps: template.steps.map(([title, instruction, check], index) => ({
      id: `${vehicle.key}-${template.slug}-${index + 1}`,
      title,
      instruction,
      beginnerDetail:
        "Open the visual reference, tools and exact-values sections first. Stop when the installed vehicle differs.",
      whyItMatters:
        "A documented match prevents wrong parts, damaged fasteners and unclear results.",
      mistakesToAvoid: [
        "Ordering by model name without the VIN or installed equipment",
        "Continuing after the vehicle or procedure differs from the guide",
      ],
      recordAfterStep: ["One clear photo plus the result of this check"],
      estimatedMinutes: Math.max(3, Math.round(template.minutes / stepCount)),
      check,
    })),
  };
}

export const showcaseVehicleGuides: InstallationGuide[] = vehicles.flatMap(
  (vehicle) => templates.map((template) => makeGuide(vehicle, template)),
);
