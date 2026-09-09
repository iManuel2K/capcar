import type { DiagnosticLog } from "./diagnostic-schema";

export type DiagnosticInsight = {
  code: string;
  title: string;
  severity: DiagnosticLog["severity"];
  summary: string;
  symptoms: string[];
  causes: string[];
  steps: string[];
  partQueries: Array<{ label: string; query: string }>;
};

const reviewedInsights: Record<string, Omit<DiagnosticInsight, "code">> = {
  P0300: {
    title: "Random or multiple-cylinder misfire detected",
    severity: "critical",
    summary:
      "The engine computer detected combustion misses across more than one cylinder.",
    symptoms: [
      "Rough idle or hesitation",
      "Flashing engine light under load",
      "Fuel smell or reduced power",
    ],
    causes: [
      "Worn spark plugs or weak ignition coils",
      "Fuel-delivery or injector fault",
      "Vacuum leak or low compression",
    ],
    steps: [
      "Avoid hard driving if the engine light flashes.",
      "Record freeze-frame data and identify affected cylinders.",
      "Inspect plugs, coils, intake leaks and fuel pressure before replacing parts.",
    ],
    partQueries: [
      { label: "Ignition service parts", query: "spark plug ignition coil" },
    ],
  },
  P0301: {
    title: "Cylinder 1 misfire detected",
    severity: "critical",
    summary:
      "Cylinder 1 is not burning consistently; continued driving can damage the catalyst.",
    symptoms: [
      "Rough idle",
      "Hesitation under load",
      "Flashing or steady engine light",
    ],
    causes: [
      "Spark plug or ignition coil",
      "Injector or wiring fault",
      "Compression loss or intake leak near cylinder 1",
    ],
    steps: [
      "Stop hard acceleration if the warning lamp flashes.",
      "Inspect the cylinder 1 plug and coil; compare with a known-good cylinder.",
      "Check injector operation, wiring and compression before ordering parts.",
    ],
    partQueries: [
      { label: "Spark plugs", query: "spark plug set" },
      { label: "Ignition components", query: "ignition coil" },
    ],
  },
  P0171: {
    title: "System too lean — bank 1",
    severity: "warning",
    summary:
      "The measured air-fuel mixture is leaner than the control system expects.",
    symptoms: [
      "Unstable idle",
      "Hesitation",
      "Higher fuel trims or difficult cold starts",
    ],
    causes: [
      "Unmetered intake or vacuum leak",
      "Dirty or biased airflow sensor",
      "Low fuel pressure or injector delivery",
    ],
    steps: [
      "Review short- and long-term fuel trims.",
      "Smoke-test the intake and inspect breather hoses.",
      "Verify airflow readings and fuel pressure before replacing sensors.",
    ],
    partQueries: [{ label: "Intake service", query: "intake filter service" }],
  },
  P0420: {
    title: "Catalyst efficiency below threshold — bank 1",
    severity: "warning",
    summary:
      "Upstream and downstream oxygen-sensor signals suggest reduced catalyst efficiency.",
    symptoms: [
      "Steady engine light",
      "Possible sulphur smell",
      "Often no noticeable drivability change",
    ],
    causes: [
      "Aged or damaged catalyst",
      "Exhaust leak",
      "Oxygen sensor bias or an unresolved misfire/rich condition",
    ],
    steps: [
      "Resolve active misfire or mixture codes first.",
      "Inspect the exhaust for leaks ahead of and around the catalyst.",
      "Compare oxygen-sensor waveforms before condemning the catalyst.",
    ],
    partQueries: [
      { label: "Exhaust components", query: "exhaust catalyst oxygen sensor" },
    ],
  },
  U0100: {
    title: "Lost communication with engine control module",
    severity: "critical",
    summary:
      "Another control unit stopped receiving expected messages from the engine controller.",
    symptoms: [
      "No-start or intermittent start",
      "Multiple warning lamps",
      "Reduced-function or limp mode",
    ],
    causes: [
      "Low system voltage",
      "CAN wiring or connector fault",
      "Power, ground or module issue",
    ],
    steps: [
      "Check battery voltage and charging health.",
      "Scan every module and note which controllers remain reachable.",
      "Inspect relevant fuses, grounds and CAN wiring; module replacement requires specialist proof.",
    ],
    partQueries: [
      {
        label: "Electrical service items",
        query: "battery electrical service",
      },
    ],
  },
};

const genericByFamily: Record<string, Omit<DiagnosticInsight, "code">> = {
  P: {
    title: "Powertrain diagnostic code",
    severity: "warning",
    summary:
      "The powertrain controller recorded a condition that needs vehicle-specific diagnosis.",
    symptoms: ["Warning lamp", "Possible drivability or emissions change"],
    causes: [
      "Sensor, actuator, wiring or mechanical condition",
      "Vehicle-specific calibration or subsystem fault",
    ],
    steps: [
      "Record freeze-frame and all companion codes.",
      "Check manufacturer service information for this exact vehicle.",
      "Test the circuit or system before replacing components.",
    ],
    partQueries: [{ label: "Service parts", query: "service diagnostic" }],
  },
  B: {
    title: "Body-system diagnostic code",
    severity: "info",
    summary:
      "A body controller recorded an electrical or equipment-related condition.",
    symptoms: ["Equipment or comfort feature may be unavailable"],
    causes: [
      "Switch, sensor, wiring, power supply or control-module communication",
    ],
    steps: [
      "Confirm the affected feature.",
      "Check voltage, fuses and connectors.",
      "Use manufacturer-specific code detail before replacing parts.",
    ],
    partQueries: [{ label: "Electrical parts", query: "electrical body" }],
  },
  C: {
    title: "Chassis-system diagnostic code",
    severity: "critical",
    summary:
      "A chassis controller recorded a braking, steering or stability-related condition.",
    symptoms: [
      "ABS, steering or stability warning",
      "Driver assistance may be limited",
    ],
    causes: [
      "Wheel-speed or position sensor",
      "Wiring, power supply or hydraulic/mechanical fault",
    ],
    steps: [
      "Treat braking or steering warnings as safety-critical.",
      "Inspect the complete chassis scan and live sensor values.",
      "Use a qualified specialist for road-safety systems.",
    ],
    partQueries: [
      { label: "Brake and chassis parts", query: "brake suspension sensor" },
    ],
  },
  U: {
    title: "Vehicle-network diagnostic code",
    severity: "warning",
    summary:
      "A controller detected missing or invalid communication on the vehicle network.",
    symptoms: [
      "Several warning lamps",
      "Intermittent or unavailable vehicle functions",
    ],
    causes: [
      "Low voltage",
      "Connector or network wiring issue",
      "Module power, ground or internal fault",
    ],
    steps: [
      "Verify battery and charging voltage.",
      "Run a complete-module scan.",
      "Inspect shared power, grounds and network wiring before replacing a module.",
    ],
    partQueries: [{ label: "Electrical service", query: "battery electrical" }],
  },
};

export function diagnosticInsightFor(code: string): DiagnosticInsight {
  const normalized = code.trim().toUpperCase();
  const insight =
    reviewedInsights[normalized] ??
    genericByFamily[normalized[0]] ??
    genericByFamily.P;
  return { code: normalized, ...insight };
}
