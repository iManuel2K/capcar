import { buildItemSchema, type BuildItem } from "./build-schema";
import { BUILD_STORAGE_KEY, readBuildState } from "./build-storage";
import {
  workbenchSchema,
  quoteSchema,
  purchaseSchema,
  type BuildQuote,
  type BuildWorkbench,
  type FitmentEvidence,
} from "./build-workbench-schema";
import type { Vehicle } from "@/features/vehicles/vehicle-schema";
import type { RetailItem } from "@/features/retail/retail-contracts";
import { safeRetailUrl } from "@/features/retail/retail-contracts";
import { dependencyBlockers } from "./build-planning";

const normalized = (value: string) =>
  value
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "");
export function quoteTotal(quote: BuildQuote) {
  const detailedCharges = [quote.tax, quote.importCharges, quote.otherCharges];
  const usesDetailedCharges = detailedCharges.some(
    (value) => value !== undefined,
  );
  if (
    quote.shipping === null ||
    (usesDetailedCharges
      ? detailedCharges.some((value) => value === null || value === undefined)
      : quote.extraCharges === null)
  )
    return null;
  const additions = usesDetailedCharges
    ? (quote.tax ?? 0) + (quote.importCharges ?? 0) + (quote.otherCharges ?? 0)
    : (quote.extraCharges ?? 0);
  return Math.round((quote.price + quote.shipping + additions) * 100) / 100;
}

export function quoteCostBreakdown(quote: BuildQuote) {
  return {
    item: quote.price,
    shipping: quote.shipping,
    tax: quote.tax,
    importCharges: quote.importCharges,
    otherCharges: quote.otherCharges,
    legacyAdditionalCharges: quote.extraCharges,
    total: quoteTotal(quote),
  };
}
export function fitmentEvidenceVerdict(
  partNumber: string,
  vehicle: Vehicle,
  records: FitmentEvidence[],
) {
  if (
    !partNumber ||
    [vehicle.engineCode, vehicle.platform].some((value) =>
      ["UNKNOWN", "UNCONFIRMED"].includes(normalized(value)),
    )
  )
    return {
      state: "unknown",
      label: "Identity incomplete",
      count: 0,
      matchedAxes: [] as string[],
      missingAxes: ["part number", "platform or engine identity"],
      conflicts: [] as string[],
      nextAction: "Complete the vehicle identity and exact part number.",
    };
  const matched = records.filter(
    (record) =>
      normalized(record.partNumber) === normalized(partNumber) &&
      normalized(record.make) === normalized(vehicle.make) &&
      normalized(record.platform) === normalized(vehicle.platform) &&
      normalized(record.engineCode) === normalized(vehicle.engineCode) &&
      normalized(record.bodyStyle) === normalized(vehicle.bodyStyle) &&
      normalized(record.transmission) === normalized(vehicle.transmission) &&
      record.yearFrom <= vehicle.productionYear &&
      record.yearTo >= vehicle.productionYear,
  );
  const states = new Set(matched.map((record) => record.verdict));
  if (states.size > 1)
    return {
      state: "conflict",
      label: "Sources disagree · stop and resolve",
      count: matched.length,
      matchedAxes: [
        "part number",
        "make",
        "platform",
        "engine",
        "body",
        "transmission",
        "production year",
      ],
      missingAxes: [] as string[],
      conflicts: [...states],
      nextAction:
        "Compare the original source scopes before choosing an offer.",
    };
  const state: FitmentEvidence["verdict"] | "unknown" =
    matched[0]?.verdict ?? "unknown";
  const labels = {
    direct: "Direct bolt-on · recorded claim",
    exact: "Exact fitment match · recorded evidence",
    supported: "Supported fitment match · recorded evidence",
    confirmation: "Requires vehicle or part confirmation",
    modification: "Modification required · recorded claim",
    incompatible: "Incompatible · recorded claim",
    unknown: "Fitment not established",
  };
  return {
    state,
    label: labels[state],
    count: matched.length,
    matchedAxes: matched.length
      ? [
          "part number",
          "make",
          "platform",
          "engine",
          "body",
          "transmission",
          "production year",
        ]
      : [],
    missingAxes: matched.length
      ? []
      : [
          "exact matching evidence for part, platform, engine, body, transmission and year",
        ],
    conflicts: [] as string[],
    nextAction:
      matched.length === 0
        ? "Record a source for this exact vehicle and part."
        : state === "confirmation"
          ? "Confirm the missing variant details before selecting the offer."
          : state === "modification"
            ? "Review the required supporting modifications before purchase."
            : state === "incompatible"
              ? "Choose a different part."
              : "Confirm the source remains current, then continue.",
  };
}
export function quoteFromRetail(
  item: RetailItem,
  checkedAt: string,
  destination = "Unconfirmed",
  market: "DE" | "GB" | "FR" | "IT" | "ES" | "US" = "DE",
): BuildQuote {
  return quoteSchema.parse({
    ...item,
    id: `${item.provider ?? "ebay"}:${item.providerItemId ?? item.id}`,
    retailer: item.retailer ?? "eBay",
    partNumber: "",
    origin: item.provider === "partner" ? "retailer-live" : "ebay-live",
    provider: item.provider ?? "ebay",
    providerItemId: item.providerItemId ?? item.id,
    market,
    // Browse totals do not prove destination-specific taxes or import duties.
    extraCharges: null,
    destination,
    sellerHistory: "",
    sellerConfidence: "unknown",
    availability: "unknown",
    warranty: "",
    returns: "",
    delivery: "",
    observedAt: checkedAt,
  });
}
export function updateWorkbench(
  vehicleId: string,
  buildId: string,
  itemId: string,
  storage: Pick<Storage, "getItem" | "setItem">,
  update: (current: BuildWorkbench, item: BuildItem) => BuildWorkbench,
) {
  const state = readBuildState(storage);
  if (
    !state.builds.some(
      (build) => build.id === buildId && build.vehicleId === vehicleId,
    )
  )
    throw new Error("Build not found for this vehicle.");
  const item = state.items.find(
    (entry) => entry.id === itemId && entry.buildId === buildId,
  );
  if (!item) throw new Error("Modification not found.");
  const workbench = workbenchSchema.parse(
    update(item.workbench ?? workbenchSchema.parse({}), item),
  );
  if (
    workbench.purchase?.installedAt &&
    dependencyBlockers(
      item,
      state.items.filter((entry) => entry.buildId === buildId),
    ).length > 0
  )
    throw new Error(
      "Install the required modifications before recording this installation.",
    );
  const quote = workbench.quotes.find(
    (entry) => entry.id === workbench.selectedQuoteId,
  );
  const total = quote ? quoteTotal(quote) : null;
  if (
    workbench.selectedQuoteId &&
    (!quote || total === null || quote.currency !== "EUR")
  )
    throw new Error(
      "A selected quote must keep a complete EUR total. Confirm its charges before saving.",
    );
  const updated = buildItemSchema.parse({
    ...item,
    workbench,
    ...(quote && total !== null
      ? {
          selectedOfferId: quote.id,
          selectedOfferUrl: safeRetailUrl(quote.url) ? quote.url : undefined,
          merchantName: quote.retailer,
          deliveredPrice: total,
          estimatedCost: Math.ceil(total),
          offerSelectedAt: quote.observedAt,
        }
      : {}),
    ...(workbench.purchase
      ? { status: workbench.purchase.installedAt ? "installed" : "ordered" }
      : {}),
    updatedAt: new Date().toISOString(),
  });
  storage.setItem(
    BUILD_STORAGE_KEY,
    JSON.stringify({
      ...state,
      items: state.items.map((entry) =>
        entry.id === item.id ? updated : entry,
      ),
    }),
  );
  return updated;
}
export function selectWorkbenchQuote(
  workbench: BuildWorkbench,
  item: BuildItem,
  quoteId: string,
  vehicle: Vehicle,
) {
  if (workbench.purchase || item.status !== "planned")
    throw new Error(
      "Purchased records are locked. Keep the original offer as evidence.",
    );
  const quote = workbench.quotes.find((entry) => entry.id === quoteId);
  if (!quote) throw new Error("Quote not found.");
  if (
    quote.currency !== "EUR" ||
    quoteTotal(quote) === null ||
    quote.destination === "Unconfirmed"
  )
    throw new Error(
      "Confirm EUR shipping, destination and extra charges before selecting. Use zero only when confirmed.",
    );
  const verdict = fitmentEvidenceVerdict(
    quote.partNumber,
    vehicle,
    workbench.fitment,
  );
  if (
    ["unknown", "confirmation", "incompatible", "conflict"].includes(
      verdict.state,
    )
  )
    throw new Error(
      "Resolve fitment first: add supported evidence and clear any confirmation, conflict or incompatibility.",
    );
  return { ...workbench, selectedQuoteId: quoteId };
}
export function saveWorkbenchPurchase(
  value: unknown,
  workbench: BuildWorkbench,
) {
  const purchase = purchaseSchema.parse(value);
  const today = new Date().toISOString().slice(0, 10);
  if (
    [purchase.orderedAt, purchase.deliveredAt, purchase.installedAt].some(
      (date) => date && date > today,
    )
  )
    throw new Error("Actual events cannot be dated in the future.");
  return { ...workbench, purchase };
}
