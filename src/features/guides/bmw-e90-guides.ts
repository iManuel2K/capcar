import type {
  GuideCategory,
  GuideDifficulty,
  GuidePart,
  GuideSpecification,
  GuideStep,
  InstallationGuide,
} from "@/features/guides/guide-catalog";

type GuideSpec = {
  slug: string;
  title: string;
  summary: string;
  category: GuideCategory;
  difficulty: GuideDifficulty;
  minutes: number;
  tools: string[];
  steps: Array<[title: string, instruction: string, check: string]>;
  setting?: "DIY suitable" | "Experienced DIY" | "Workshop recommended";
  videoId?: string;
  videoSource?: string;
};

type GuideEvidence = {
  referenceLabel: string;
  referenceUrl: string;
  part: GuidePart;
  specification: GuideSpecification;
};

const bmwRule = {
  makes: ["BMW"],
  models: ["318i"],
  platforms: ["E90"],
  engineCodes: ["N43"],
};

const specs: GuideSpec[] = [
  {
    slug: "e90-cabin-microfilter",
    title: "Cabin microfilter replacement",
    summary:
      "Freshen the cabin air and restore airflow with a calm 20-minute service.",
    category: "Maintenance",
    difficulty: "Easy",
    minutes: 20,
    tools: ["8 mm socket", "Small ratchet", "Soft brush", "Work gloves"],
    videoId: "44QadXgA5rc",
    videoSource: "Preshaan Briglall",
    steps: [
      [
        "Match the filter",
        "Compare shape, seal and airflow marking before opening the housing.",
        "Filter application and orientation match.",
      ],
      [
        "Open the cowl housing",
        "Remove only the visible housing fasteners and lift the cover without straining wiring.",
        "Cover is free and all hardware is accounted for.",
      ],
      [
        "Clean and replace",
        "Lift out the old element, remove loose debris and seat the new filter evenly.",
        "Filter sits flat with no folded edge.",
      ],
      [
        "Close and test",
        "Refit the cover, start the fan and check airflow without rattles.",
        "Housing is secure and airflow is normal.",
      ],
    ],
  },
  {
    slug: "e90-spark-plugs-n43",
    title: "Spark-plug replacement prep",
    summary:
      "Prepare an N43 plug service without guessing parts, torque or cylinder order.",
    category: "Engine",
    difficulty: "Advanced",
    minutes: 90,
    tools: [
      "Thin-wall spark-plug socket",
      "Torque wrench",
      "Extension set",
      "Coil puller",
    ],
    setting: "Experienced DIY",
    videoId: "eqmLMumnF88",
    videoSource: "AUTODOC",
    steps: [
      [
        "Confirm plugs and values",
        "Use VIN-specific data for plug type, gap policy and tightening value.",
        "Part numbers and authoritative values are saved.",
      ],
      [
        "Create clean access",
        "Work on a cool engine and clear debris before opening any plug well.",
        "Plug wells are clean and dry.",
      ],
      [
        "Change one cylinder at a time",
        "Keep each coil and connector associated with its original cylinder.",
        "Every plug is seated using the verified procedure.",
      ],
      [
        "Run the verification",
        "Recheck connectors, start the engine and scan if idle or warnings are abnormal.",
        "Idle is stable and no new warning is present.",
      ],
    ],
  },
  {
    slug: "e90-ignition-coil-check",
    title: "Ignition-coil check",
    summary:
      "Organise a misfire check and coil replacement without swapping parts blindly.",
    category: "Diagnostics",
    difficulty: "Moderate",
    minutes: 45,
    tools: ["OBD-II scanner", "Coil puller", "Inspection light", "Label tape"],
    setting: "Experienced DIY",
    steps: [
      [
        "Read the fault state",
        "Save codes and freeze-frame data before clearing or moving components.",
        "Original fault data is recorded.",
      ],
      [
        "Inspect connectors and wells",
        "Look for oil, water, damaged boots or loose connector locks.",
        "Visual condition is documented.",
      ],
      [
        "Test methodically",
        "Follow an authoritative cylinder-by-cylinder test rather than replacing multiple coils at once.",
        "The test result identifies the next action without guesswork.",
      ],
      [
        "Confirm the repair",
        "Reassemble, scan again and record whether the fault returns.",
        "No new fault is present after the check.",
      ],
    ],
  },
  {
    slug: "e90-battery-replacement-registration",
    title: "Battery replacement & registration",
    summary:
      "Match battery technology, preserve safe access and plan the required registration step.",
    category: "Electrical",
    difficulty: "Advanced",
    minutes: 75,
    tools: [
      "Battery socket set",
      "Battery carrier",
      "Diagnostic scanner",
      "Safety glasses",
    ],
    setting: "Workshop recommended",
    steps: [
      [
        "Identify the installed battery",
        "Record capacity, battery technology, vent routing and terminal layout.",
        "Replacement specification is confirmed.",
      ],
      [
        "Prepare power-down",
        "Save required settings and follow the exact isolation sequence for the vehicle.",
        "Vehicle is safely powered down.",
      ],
      [
        "Exchange and secure",
        "Keep polarity protected, connect the vent and secure the hold-down correctly.",
        "Battery cannot move and the vent is connected.",
      ],
      [
        "Register and verify",
        "Register the battery with compatible diagnostics and check the charging state.",
        "Registration and charging result are recorded.",
      ],
    ],
  },
  {
    slug: "e90-wiper-blades",
    title: "Wiper-blade replacement",
    summary:
      "Replace front blades without damaging the windscreen or losing the service position.",
    category: "Maintenance",
    difficulty: "Easy",
    minutes: 12,
    tools: ["Microfibre towel", "Glass cleaner", "Work gloves"],
    steps: [
      [
        "Confirm length and adapter",
        "Compare both replacement blades before lifting an arm.",
        "Lengths and adapters match the vehicle.",
      ],
      [
        "Protect the glass",
        "Place a folded towel below the arm and change one blade at a time.",
        "Bare arm cannot fall onto exposed glass.",
      ],
      [
        "Lock and test",
        "Seat each adapter until it locks, then test wipe and washer operation.",
        "Blades sweep quietly without lifting or streaking.",
      ],
    ],
  },
  {
    slug: "e90-washer-system-check",
    title: "Washer system check",
    summary:
      "Restore a weak spray by checking fluid, nozzles and obvious leaks in order.",
    category: "Maintenance",
    difficulty: "Easy",
    minutes: 20,
    tools: [
      "Funnel",
      "Inspection light",
      "Microfibre towel",
      "Washer fluid tester",
    ],
    steps: [
      [
        "Check the correct fluid",
        "Confirm seasonal concentration and top up without mixing unknown products.",
        "Fluid level and freeze protection are suitable.",
      ],
      [
        "Observe the spray",
        "Operate briefly and compare both nozzles, pump sound and leak traces.",
        "Weak side or system-wide fault is identified.",
      ],
      [
        "Clean only externally",
        "Remove surface dirt gently; do not force pins into precision nozzles.",
        "Spray pattern is even and the bonnet area is dry.",
      ],
    ],
  },
  {
    slug: "e90-headlight-bulb-check",
    title: "Headlight bulb replacement prep",
    summary:
      "Identify the lamp type and access route before opening the headlight housing.",
    category: "Electrical",
    difficulty: "Moderate",
    minutes: 35,
    tools: ["Nitrile gloves", "Inspection mirror", "Work light", "Trim tool"],
    setting: "Experienced DIY",
    steps: [
      [
        "Identify the lighting system",
        "Confirm halogen, xenon or another system from the vehicle and lamp markings.",
        "Lamp type and safety procedure are known.",
      ],
      [
        "Inspect before opening",
        "Check for condensation, damaged caps or melted connectors.",
        "Housing and connector condition are recorded.",
      ],
      [
        "Replace without contamination",
        "Follow the verified access route and keep glass capsules free from skin contact.",
        "Bulb and cap are fully seated.",
      ],
      [
        "Test aim and warnings",
        "Confirm function, beam appearance and dashboard state.",
        "Both sides operate consistently without warning.",
      ],
    ],
  },
  {
    slug: "e90-brake-visual-check",
    title: "Brake visual health check",
    summary:
      "Record pad, disc and hose condition before deciding whether a workshop is needed.",
    category: "Diagnostics",
    difficulty: "Moderate",
    minutes: 30,
    tools: [
      "Inspection light",
      "Brake inspection mirror",
      "Tyre tread gauge",
      "Camera",
    ],
    setting: "Workshop recommended",
    steps: [
      [
        "Record symptoms",
        "Note noise, vibration, warning lights and whether the car pulls under braking.",
        "Symptoms and conditions are saved.",
      ],
      [
        "Inspect through the wheel",
        "Look for obvious disc damage, uneven pad appearance, leaks or damaged hoses without dismantling.",
        "Visible condition is photographed.",
      ],
      [
        "Choose the safe next step",
        "Treat uncertain thickness, fluid loss or braking change as a workshop decision.",
        "A repair has not been inferred from appearance alone.",
      ],
    ],
  },
  {
    slug: "e90-tyre-pressure-check",
    title: "Tyre pressure & condition",
    summary:
      "Set cold pressures from the vehicle placard and catch uneven wear early.",
    category: "Maintenance",
    difficulty: "Easy",
    minutes: 18,
    tools: [
      "Digital tyre gauge",
      "Tyre inflator",
      "Tread-depth gauge",
      "Chalk marker",
    ],
    steps: [
      [
        "Read the vehicle placard",
        "Use the pressure for the fitted tyre size and current load, not the sidewall maximum.",
        "Target front and rear pressures are recorded.",
      ],
      [
        "Measure cold",
        "Check all four tyres before a long drive and include the spare if fitted.",
        "Cold readings are documented.",
      ],
      [
        "Inspect the tread",
        "Check inner, centre and outer areas for damage or uneven wear.",
        "No cut, bulge or unsafe wear is visible.",
      ],
      [
        "Set and recheck",
        "Adjust pressures, reinstall caps and confirm the final readings.",
        "Final pressures match the selected load condition.",
      ],
    ],
  },
  {
    slug: "e90-coolant-level-check",
    title: "Coolant level & leak check",
    summary:
      "Check a completely cold cooling system and document signs that need professional diagnosis.",
    category: "Engine",
    difficulty: "Easy",
    minutes: 15,
    tools: [
      "Inspection light",
      "Coolant tester",
      "Nitrile gloves",
      "Microfibre towel",
    ],
    setting: "Workshop recommended",
    steps: [
      [
        "Wait for a cold engine",
        "Do not open a warm or pressurised cooling system.",
        "Engine is fully cold before inspection.",
      ],
      [
        "Check level and fluid",
        "Use the vehicle-specific indicator and look for contamination or incorrect colour mixing.",
        "Level and appearance are recorded.",
      ],
      [
        "Look for traces",
        "Inspect visible hose joints, the expansion tank and the parking area for residue.",
        "Any leak trace is photographed for diagnosis.",
      ],
    ],
  },
  {
    slug: "e90-drive-belt-inspection",
    title: "Drive-belt visual inspection",
    summary:
      "Spot cracking, contamination or tracking problems without reaching into a running engine.",
    category: "Engine",
    difficulty: "Moderate",
    minutes: 20,
    tools: ["Inspection light", "Inspection mirror", "Camera", "Work gloves"],
    setting: "Workshop recommended",
    steps: [
      [
        "Power down and cool",
        "Remove the key and wait until all moving parts are stationary and cool.",
        "Engine cannot start during the visual check.",
      ],
      [
        "Inspect the visible belt",
        "Look for fraying, cracks, glazing, contamination or material loss without rotating by hand.",
        "Visible belt condition is photographed.",
      ],
      [
        "Check the path",
        "Look for obvious misalignment, damaged pulley edges or leak traces above the belt.",
        "No obvious tracking or contamination issue is seen.",
      ],
    ],
  },
  {
    slug: "e90-door-hinge-care",
    title: "Door hinge & seal care",
    summary:
      "Quiet dry hinges and protect rubber seals without overspraying trim or paint.",
    category: "Exterior",
    difficulty: "Easy",
    minutes: 25,
    tools: [
      "Detailing brush",
      "Microfibre towel",
      "Precision applicator",
      "Nitrile gloves",
    ],
    steps: [
      [
        "Clean first",
        "Remove grit from hinges, check straps and rubber seals with a soft brush and cloth.",
        "Surfaces are clean and damage is visible.",
      ],
      [
        "Apply sparingly",
        "Use a compatible product exactly where needed rather than spraying the full jamb.",
        "Product is controlled with no runoff.",
      ],
      [
        "Cycle and wipe",
        "Open and close the door gently, then remove excess product.",
        "Movement is quiet and surrounding trim is clean.",
      ],
    ],
  },
  {
    slug: "e90-interior-trim-clips",
    title: "Interior trim-clip replacement",
    summary:
      "Stop rattles by identifying the correct clip and removing trim without force.",
    category: "Interior",
    difficulty: "Easy",
    minutes: 35,
    tools: [
      "Plastic trim tools",
      "Clip assortment tray",
      "Work light",
      "Felt tape",
    ],
    steps: [
      [
        "Locate the rattle",
        "Confirm the panel and reproduce the noise before removing anything.",
        "Noise location and conditions are recorded.",
      ],
      [
        "Map attachment points",
        "Use the panel-specific diagram or procedure to find hidden clips and screws.",
        "All attachment types are understood.",
      ],
      [
        "Replace damaged retainers",
        "Compare old and new clips, then reinstall the panel with even hand pressure.",
        "Every edge sits flush without a new noise.",
      ],
    ],
  },
  {
    slug: "e90-obd-scan-baseline",
    title: "OBD-II scan baseline",
    summary:
      "Save a clean diagnostic snapshot before parts are replaced or fault codes are cleared.",
    category: "Diagnostics",
    difficulty: "Easy",
    minutes: 20,
    tools: [
      "OBD-II scanner",
      "Phone or laptop",
      "Battery voltage tester",
      "Notes app",
    ],
    steps: [
      [
        "Stabilise the session",
        "Confirm battery voltage and follow the scanner's ignition instructions.",
        "Scan session starts with stable voltage.",
      ],
      [
        "Run a complete scan",
        "Read all available modules and save codes with status and freeze-frame data.",
        "Original scan report is exported.",
      ],
      [
        "Interpret before clearing",
        "Separate current, stored and communication faults; do not buy parts from a code alone.",
        "Next diagnostic action is written down.",
      ],
    ],
  },
  {
    slug: "e90-headlight-restoration",
    title: "Headlight lens restoration prep",
    summary:
      "Assess haze and plan a finish that includes UV protection rather than a temporary polish.",
    category: "Exterior",
    difficulty: "Moderate",
    minutes: 120,
    tools: ["Masking tape", "Spray bottle", "Sanding block", "Polishing pad"],
    setting: "Experienced DIY",
    steps: [
      [
        "Identify the defect",
        "Confirm the haze is external and check for cracks, moisture or internal damage.",
        "Lens condition and repair limits are recorded.",
      ],
      [
        "Protect the body",
        "Wash the area and mask paint, trim and seals generously.",
        "No adjacent surface is exposed.",
      ],
      [
        "Restore progressively",
        "Follow the product system through its stated abrasion and polishing stages.",
        "Finish is even with no skipped grit marks.",
      ],
      [
        "Add UV protection",
        "Apply the compatible UV protection and respect curing conditions.",
        "Protection and cure time are recorded.",
      ],
    ],
  },
  {
    slug: "e90-exhaust-hanger-check",
    title: "Exhaust mount inspection",
    summary:
      "Trace knocks and movement from a safe distance before booking exhaust work.",
    category: "Diagnostics",
    difficulty: "Moderate",
    minutes: 25,
    tools: ["Inspection light", "Inspection mirror", "Camera", "Work gloves"],
    setting: "Workshop recommended",
    steps: [
      [
        "Let the exhaust cool",
        "Park securely and wait until every visible exhaust component is cold.",
        "System is cold before inspection.",
      ],
      [
        "Observe mounts and clearance",
        "Look for torn rubber, shifted brackets, contact marks and uneven tailpipe position.",
        "Visible mount condition is photographed.",
      ],
      [
        "Record the sound context",
        "Note when the knock occurs without crawling under an unsupported vehicle.",
        "Workshop receives clear location and symptom notes.",
      ],
    ],
  },
  {
    slug: "e90-dashcam-cable-route",
    title: "Dashcam cable routing",
    summary:
      "Plan a tidy reversible cable route that stays clear of airbags, controls and visibility.",
    category: "Interior",
    difficulty: "Moderate",
    minutes: 55,
    tools: [
      "Plastic trim tools",
      "Cable clips",
      "Multimeter",
      "Microfibre towel",
    ],
    setting: "Experienced DIY",
    steps: [
      [
        "Choose the safe position",
        "Check the driver's view, legal placement and camera field before attaching anything.",
        "Mount position is legal and unobtrusive.",
      ],
      [
        "Map airbags and trim",
        "Use vehicle documentation to keep the cable away from every airbag deployment path.",
        "Cable route does not cross an airbag.",
      ],
      [
        "Route without strain",
        "Use removable clips and protected edges; do not force cable behind unknown trim.",
        "Cable is secure with slack at moving points.",
      ],
      [
        "Test and document",
        "Confirm startup, recording and shutdown behaviour before final trim closure.",
        "Camera works and the final route is photographed.",
      ],
    ],
  },
];

const bmwOwnersManualUrl = "https://www.bmwusa.com/owners-manuals.html";
const bmwTisUrl = "https://bmwtechinfo.bmwgroup.com/tisUI/";
const verifiedAt = "2026-10-15";

const evidenceBySlug: Record<string, GuideEvidence> = {
  "e90-cabin-microfilter": {
    referenceLabel: "AUTODOC · BMW E90 pollen-filter illustrated tutorial",
    referenceUrl:
      "https://club.autodoc.co.uk/manuals/how-to-change-pollen-filter-on-bmw-e90-replacement-guide-13119",
    part: {
      name: "Cabin microfilter",
      specification:
        "Match E90 sedan housing shape, sealing edge and charcoal option by VIN.",
      note: "The illustrated E90 procedure shows six housing fasteners and an 8 mm socket; confirm your production split before opening.",
    },
    specification: {
      label: "Housing access",
      value:
        "Six cover fasteners · 8 mm socket on the referenced E90 procedure.",
      sourceLabel: "AUTODOC illustrated tutorial",
      sourceUrl:
        "https://club.autodoc.co.uk/manuals/how-to-change-pollen-filter-on-bmw-e90-replacement-guide-13119",
    },
  },
  "e90-spark-plugs-n43": {
    referenceLabel: "AUTODOC · BMW E90 spark-plug illustrated tutorial",
    referenceUrl:
      "https://club.autodoc.co.uk/manuals/how-to-change-spark-plugs-on-bmw-e90-replacement-guide-11124",
    part: {
      name: "N43 spark-plug set",
      specification:
        "Resolve the BMW or plug-manufacturer number from the complete VIN; N43 production revisions must not be inferred from model name.",
      note: "The N43 installs the plugs at an angle. Use a thin-wall socket and the VIN-specific BMW tightening instruction.",
    },
    specification: {
      label: "Spark-plug tightening value",
      value:
        "VIN-specific BMW ISTA/TIS value required. CapCar deliberately does not substitute a generic plug torque.",
      sourceLabel: "BMW Technical Information System",
      sourceUrl: bmwTisUrl,
    },
  },
  "e90-ignition-coil-check": {
    referenceLabel: "AUTODOC · BMW E90 ignition-coil illustrated tutorial",
    referenceUrl:
      "https://club.autodoc.co.uk/manuals/how-to-change-ignition-coil-on-bmw-3-saloon-e90-replacement-guide-17803",
    part: {
      name: "N43 ignition coil",
      specification:
        "Match connector, index and current BMW supersession using the full VIN.",
      note: "Diagnose the cylinder and connector first; a fault code alone does not prove the coil is defective.",
    },
    specification: {
      label: "Verification rule",
      value:
        "Save codes and freeze-frame data before moving coils; re-scan after the controlled test.",
      sourceLabel: "BMW Technical Information System",
      sourceUrl: bmwTisUrl,
    },
  },
  "e90-battery-replacement-registration": {
    referenceLabel: "BMW · Digital Owner's Manual and TIS",
    referenceUrl: bmwOwnersManualUrl,
    part: {
      name: "12 V battery",
      specification:
        "Match AGM/lead-acid technology, capacity, case, terminals and vent connection from the installed label and VIN.",
      note: "Changing technology or capacity can require coding as well as battery registration.",
    },
    specification: {
      label: "Battery management",
      value:
        "Register the replacement with compatible BMW diagnostics; code any approved capacity/technology change.",
      sourceLabel: "BMW Technical Information System",
      sourceUrl: bmwTisUrl,
    },
  },
  "e90-wiper-blades": {
    referenceLabel: "AUTODOC · BMW E90 wiper illustrated tutorial",
    referenceUrl:
      "https://club.autodoc.co.uk/manuals/how-to-change-front-windshield-wipers-on-bmw-e90-replacement-guide-13120",
    part: {
      name: "Front wiper-blade set",
      specification:
        "Confirm driver/passenger lengths, adapter and right-/left-hand-drive application by VIN.",
      note: "Protect the glass from the spring-loaded bare arm and do not touch the graphite-coated wiping edge.",
    },
    specification: {
      label: "Glass protection",
      value:
        "Change one side at a time with a folded towel beneath the raised arm.",
      sourceLabel: "AUTODOC illustrated tutorial",
      sourceUrl:
        "https://club.autodoc.co.uk/manuals/how-to-change-front-windshield-wipers-on-bmw-e90-replacement-guide-13120",
    },
  },
  "e90-washer-system-check": {
    referenceLabel: "BMW · Digital Owner's Manual",
    referenceUrl: bmwOwnersManualUrl,
    part: {
      name: "Approved washer fluid",
      specification:
        "Use a BMW-compatible seasonal product and do not mix unknown concentrates.",
      note: "Choose freeze protection for the lowest expected temperature on the planned route.",
    },
    specification: {
      label: "Nozzle care",
      value:
        "Clean only external contamination; do not force a pin into a precision washer nozzle.",
      sourceLabel: "BMW Digital Owner's Manual",
      sourceUrl: bmwOwnersManualUrl,
    },
  },
  "e90-headlight-bulb-check": {
    referenceLabel: "AUTODOC · BMW 3 Series lighting tutorial hub",
    referenceUrl:
      "https://club.autodoc.co.uk/manuals/electrics/headlight-bulb/bmw/3-series",
    part: {
      name: "Headlight light source",
      specification:
        "Identify halogen, xenon or factory LED equipment and order through the VIN/installed unit.",
      note: "Xenon and adaptive-light systems carry high-voltage and calibration risks; use a workshop when the manual requires it.",
    },
    specification: {
      label: "Lighting system",
      value:
        "Confirm from the installed lamp label and VIN before opening the housing.",
      sourceLabel: "BMW Digital Owner's Manual",
      sourceUrl: bmwOwnersManualUrl,
    },
  },
  "e90-brake-visual-check": {
    referenceLabel: "AUTODOC · BMW E90 brake illustrated tutorial",
    referenceUrl:
      "https://club.autodoc.co.uk/manuals/how-to-change-front-brake-pads-on-bmw-e90-replacement-guide-13138",
    part: {
      name: "Brake wear components",
      specification:
        "Pad, disc and wear-sensor application varies by axle, brake package and production split; resolve by VIN.",
      note: "This guide is visual triage only. Thickness limits and fastener torques belong to the exact BMW repair procedure.",
    },
    specification: {
      label: "Service limits & torque",
      value:
        "VIN-specific BMW TIS values required; visual appearance is not a thickness measurement.",
      sourceLabel: "BMW Technical Information System",
      sourceUrl: bmwTisUrl,
    },
  },
  "e90-tyre-pressure-check": {
    referenceLabel: "BMW · Digital Owner's Manual",
    referenceUrl: bmwOwnersManualUrl,
    part: {
      name: "Tyre or TPMS component",
      specification:
        "Match fitted wheel size, load/speed rating and TPMS generation using the vehicle placard and VIN.",
      note: "The tyre sidewall maximum is not the vehicle target pressure.",
    },
    specification: {
      label: "Cold tyre pressure",
      value:
        "Read the driver's-door placard for the fitted size and current load; front and rear can differ.",
      sourceLabel: "BMW Digital Owner's Manual",
      sourceUrl: bmwOwnersManualUrl,
    },
  },
  "e90-coolant-level-check": {
    referenceLabel: "BMW · Digital Owner's Manual",
    referenceUrl: bmwOwnersManualUrl,
    part: {
      name: "BMW-approved coolant",
      specification:
        "Select by BMW approval and VIN, not colour alone; do not mix an unknown coolant.",
      note: "Repeated level loss requires leak diagnosis rather than repeated topping up.",
    },
    specification: {
      label: "Safe inspection state",
      value: "Engine completely cold; never open a warm or pressurised system.",
      sourceLabel: "BMW Digital Owner's Manual",
      sourceUrl: bmwOwnersManualUrl,
    },
  },
  "e90-drive-belt-inspection": {
    referenceLabel: "BMW · Technical Information System",
    referenceUrl: bmwTisUrl,
    part: {
      name: "Accessory drive belt",
      specification:
        "Confirm belt length, routing, tensioner and pulley revisions from the complete VIN.",
      note: "Oil contamination requires the leak source to be repaired, not only a new belt.",
    },
    specification: {
      label: "Inspection state",
      value:
        "Engine stopped, key removed, fully cool and all rotating parts stationary.",
      sourceLabel: "BMW Technical Information System",
      sourceUrl: bmwTisUrl,
    },
  },
  "e90-door-hinge-care": {
    referenceLabel: "BMW · Digital Owner's Manual",
    referenceUrl: bmwOwnersManualUrl,
    part: {
      name: "Hinge or rubber-care product",
      specification:
        "Confirm compatibility with painted hinges, rubber and flocked window/door seals.",
      note: "Apply with a precision applicator; overspray attracts dirt and can stain trim.",
    },
    specification: {
      label: "Application rule",
      value:
        "Clean first, use the minimum product, cycle gently and wipe all excess.",
      sourceLabel: "BMW Digital Owner's Manual",
      sourceUrl: bmwOwnersManualUrl,
    },
  },
  "e90-interior-trim-clips": {
    referenceLabel: "BMW · Technical Information System",
    referenceUrl: bmwTisUrl,
    part: {
      name: "Interior trim retainer",
      specification:
        "Resolve clip geometry and part supersession by VIN and exact panel location.",
      note: "Confirm hidden screws, wiring and airbag position before pulling any panel.",
    },
    specification: {
      label: "Removal map",
      value:
        "Use the panel-specific BMW attachment diagram; clip direction differs by panel.",
      sourceLabel: "BMW Technical Information System",
      sourceUrl: bmwTisUrl,
    },
  },
  "e90-obd-scan-baseline": {
    referenceLabel: "BMW · Technical Information System",
    referenceUrl: bmwTisUrl,
    part: {
      name: "BMW-capable diagnostic interface",
      specification:
        "Use a tool that reads manufacturer modules, fault status and freeze-frame data—not only generic emissions codes.",
      note: "A fault code identifies a test path, not automatically a failed component.",
    },
    specification: {
      label: "Evidence rule",
      value:
        "Export the complete vehicle scan before clearing, coding or disconnecting the battery.",
      sourceLabel: "BMW Technical Information System",
      sourceUrl: bmwTisUrl,
    },
  },
  "e90-headlight-restoration": {
    referenceLabel: "BMW · Digital Owner's Manual",
    referenceUrl: bmwOwnersManualUrl,
    part: {
      name: "UV-protected lens restoration system",
      specification:
        "Use a complete system compatible with polycarbonate lenses and surrounding trim.",
      note: "External polishing cannot repair cracks, internal haze or a failed housing seal.",
    },
    specification: {
      label: "Finish requirement",
      value:
        "A UV-protective final coating is required; polishing alone is temporary.",
      sourceLabel: "BMW Digital Owner's Manual",
      sourceUrl: bmwOwnersManualUrl,
    },
  },
  "e90-exhaust-hanger-check": {
    referenceLabel: "BMW · Technical Information System",
    referenceUrl: bmwTisUrl,
    part: {
      name: "Exhaust hanger or clamp",
      specification:
        "Match position, rubber shape, bracket and pipe diameter by VIN.",
      note: "Do not enter a vehicle supported only by a jack; this guide is an external visual check.",
    },
    specification: {
      label: "Safe access",
      value:
        "Exhaust fully cold and vehicle securely supported for any underbody work.",
      sourceLabel: "BMW Technical Information System",
      sourceUrl: bmwTisUrl,
    },
  },
  "e90-dashcam-cable-route": {
    referenceLabel: "BMW · Digital Owner's Manual",
    referenceUrl: bmwOwnersManualUrl,
    part: {
      name: "Dashcam power kit",
      specification:
        "Confirm supply type, fuse strategy, low-voltage protection and legal camera placement.",
      note: "Never tuck a cable across the A-pillar airbag or its deployment path.",
    },
    specification: {
      label: "Airbag clearance",
      value:
        "Use the vehicle restraint-system layout; keep the cable outside every deployment path.",
      sourceLabel: "BMW Digital Owner's Manual",
      sourceUrl: bmwOwnersManualUrl,
    },
  },
};

function makeStep(
  slug: string,
  tuple: GuideSpec["steps"][number],
  index: number,
  minutes: number,
  stepCount: number,
): GuideStep {
  const [title, instruction, check] = tuple;
  return {
    id: `${slug}-${index + 1}`,
    title,
    instruction,
    beginnerDetail:
      "Open the optional photos, tools and video first. Stop when your vehicle differs from the shown scope.",
    whyItMatters:
      "A short check now prevents a wrong part, damaged fastener or unclear result later.",
    mistakesToAvoid: [
      "Working from model name alone instead of the saved vehicle identity",
      "Continuing when access, connectors or condition differ from the guide",
    ],
    recordAfterStep: ["One clear photo and the result of this check"],
    estimatedMinutes: Math.max(3, Math.round(minutes / stepCount)),
    check,
  };
}

export const bmwE90Guides: InstallationGuide[] = specs.map((spec) => {
  const evidence = evidenceBySlug[spec.slug];
  const categoryVisuals: Record<GuideCategory, string> = {
    Maintenance: "/guides/bmw-e90/diagnostics.webp",
    Engine: "/guides/bmw-e90/engine.webp",
    Electrical: "/guides/bmw-e90/electrical.webp",
    Exterior: "/guides/bmw-e90/diagnostics.webp",
    Interior: "/guides/bmw-e90/electrical.webp",
    Diagnostics: "/guides/bmw-e90/diagnostics.webp",
  };
  return {
    slug: spec.slug,
    partId: `guide-${spec.slug}`,
    title: spec.title,
    summary: spec.summary,
    category: spec.category,
    reviewStatus: "reviewed",
    revision: "1.0",
    updatedAt: verifiedAt,
    applicability: ["2011 BMW 318i", "E90 sedan", "N43B20 engine"],
    vehicleRules: [bmwRule],
    sources: [
      {
        label: "BMW Digital Owner's Manual",
        kind: "manufacturer",
        url: bmwOwnersManualUrl,
        verifiedAt,
      },
      {
        label: evidence.referenceLabel,
        kind:
          evidence.referenceUrl.includes("bmwtechinfo") ||
          evidence.referenceUrl.includes("bmwusa")
            ? "manufacturer"
            : "authoritative",
        url: evidence.referenceUrl,
        verifiedAt,
      },
      ...(spec.videoId
        ? [
            {
              label: `${spec.videoSource} video walkthrough`,
              kind: "community" as const,
              url: `https://www.youtube.com/watch?v=${spec.videoId}`,
              verifiedAt,
            },
          ]
        : []),
    ],
    difficulty: spec.difficulty,
    estimatedMinutes: spec.minutes,
    tools: spec.tools,
    parts: [evidence.part],
    specifications: [evidence.specification],
    video: {
      title: spec.videoId
        ? `${spec.title} walkthrough`
        : `Open the illustrated ${spec.title.toLowerCase()} reference`,
      url: spec.videoId
        ? `https://www.youtube.com/watch?v=${spec.videoId}`
        : evidence.referenceUrl,
      embedUrl: spec.videoId
        ? `https://www.youtube-nocookie.com/embed/${spec.videoId}`
        : undefined,
      source: spec.videoSource ?? evidence.referenceLabel,
      note: spec.videoId
        ? "Visual aid only. Match E90 body style, N43 engine, production date and installed equipment before following the sequence."
        : "Source-checked illustrated reference. Open the BMW VIN-specific procedure before dismantling or applying a technical value.",
    },
    photos: [
      {
        src: categoryVisuals[spec.category],
        alt: `Illustrative ${spec.title.toLowerCase()} workshop setup`,
        caption:
          "Illustrative setup—not the exact procedure. Compare every component with your installed car and the source-checked reference.",
        illustrative: true,
      },
      {
        src: "/capcar-bmw-current-side.webp",
        alt: "Black BMW E90 side profile",
        caption: "Save the finished state to the vehicle timeline.",
      },
    ],
    safetyChecks: [
      "Confirm the saved vehicle identity, VIN and exact component before starting.",
      "Work parked, powered down and cool unless the BMW procedure specifies another test state.",
      "Stop for damaged wiring, leaking fluid, seized hardware or any uncertain safety step.",
    ],
    installationPlan: {
      costRange: {
        min: 0,
        max:
          spec.difficulty === "Easy"
            ? 90
            : spec.difficulty === "Moderate"
              ? 220
              : 450,
        currency: "EUR",
        note: "Early planning range only; parts, local labour and hidden damage vary.",
      },
      prerequisites: [
        "Full VIN and installed equipment confirmed",
        "BMW source opened for the exact component",
      ],
      workAreaChecks: [
        "Stable, well-lit and dry work area",
        "Hardware tray and clear photo record",
      ],
      consumables: [
        "Clean gloves",
        "Vehicle-compatible replacement parts or product",
      ],
      technicalChecks: [
        "Use only VIN-filtered BMW values and current part supersessions",
        "Compare the finished state with the original photos",
      ],
      legalChecks: [
        "Keep required road equipment and approvals intact",
        "Dispose of parts and fluids through the correct route",
      ],
      stopConditions: [
        "The vehicle differs from the stated scope",
        "A safety-critical fault or damaged component is found",
      ],
      completionRecord: [
        "Part or product used, date and mileage",
        "Before/after photos and final check result",
      ],
      recommendedSetting:
        spec.setting ??
        (spec.difficulty === "Easy" ? "DIY suitable" : "Experienced DIY"),
      recommendation:
        "Use CapCar as the concise work plan and the BMW VIN-specific source for the exact repair procedure.",
    },
    steps: spec.steps.map((step, index) =>
      makeStep(spec.slug, step, index, spec.minutes, spec.steps.length),
    ),
  };
});
