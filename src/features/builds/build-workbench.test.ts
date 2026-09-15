import { beforeEach, describe, expect, it } from "vitest";
import {
  createStarterBuild,
  readBuildState,
  updateBuildItemStatus,
} from "./build-storage";
import {
  fitmentEvidenceVerdict,
  quoteFromRetail,
  quoteTotal,
  saveWorkbenchPurchase,
  selectWorkbenchQuote,
  updateWorkbench,
} from "./build-workbench";
import {
  evidenceSchema,
  quoteSchema,
  safeEvidenceUrl,
} from "./build-workbench-schema";
import {
  COST_STORAGE_KEY,
  deleteCostEntry,
  readCostState,
  saveCostEntry,
  setVehicleBudget,
} from "@/features/costs/cost-storage";
import { saveVehicle } from "@/features/vehicles/vehicle-storage";
import {
  buildVehiclePassport,
  vehiclePassportSchema,
} from "@/features/passport/vehicle-passport";
import { buildVehicleTimeline } from "@/features/timeline/vehicle-timeline";

const at = "2026-09-01T12:00:00.000Z";
beforeEach(() => localStorage.clear());
function setup() {
  const vehicle = saveVehicle(
    {
      make: "BMW",
      model: "318i",
      productionYear: 2011,
      platform: "E90",
      engineCode: "N43B20",
      bodyStyle: "Sedan",
      transmission: "Manual",
      mileage: 140000,
    },
    localStorage,
    { id: "car", createdAt: at },
  );
  const build = createStarterBuild(
    {
      vehicleId: vehicle.id,
      name: "OEM street",
      goal: "OEM+ daily",
      description: "A measured and documented daily build.",
      budget: 3000,
    },
    {
      title: "Rear lamps",
      stage: "appearance",
      priority: "now",
      estimatedCost: 300,
    },
    localStorage,
  );
  const item = readBuildState(localStorage).items[0];
  const quote = quoteSchema.parse({
    id: "quote-1",
    retailer: "Independent retailer",
    title: "Rear lamp pair",
    partNumber: "PN-123",
    url: "https://parts.example.com/lights",
    origin: "owner-quote",
    price: 200.25,
    shipping: 9.75,
    extraCharges: 0,
    currency: "EUR",
    condition: "New",
    destination: "DE",
    sellerHistory: "",
    warranty: "",
    returns: "",
    delivery: "",
    observedAt: at,
    affiliate: false,
  });
  const edit = (fn: Parameters<typeof updateWorkbench>[4]) =>
    updateWorkbench(vehicle.id, build.id, item.id, localStorage, fn);
  const evidence = evidenceSchema.parse({
    id: crypto.randomUUID(),
    kind: "manufacturer",
    source: "Owner-supplied application sheet",
    url: "https://parts.example.com/application",
    partNumber: "PN-123",
    make: "BMW",
    platform: "E90",
    engineCode: "N43B20",
    bodyStyle: "Sedan",
    transmission: "Manual",
    yearFrom: 2010,
    yearTo: 2012,
    verdict: "direct",
    note: "Application line transcribed by owner, not independently verified.",
    recordedAt: at,
  });
  return { vehicle, build, item, quote, edit, evidence };
}
describe("retailer comparison and exact fitment evidence", () => {
  it("keeps missing tax and shipping distinct from confirmed zero", () => {
    const { quote } = setup();
    expect(quoteTotal(quote)).toBe(210);
    expect(quoteTotal({ ...quote, shipping: null })).toBeNull();
    expect(quoteTotal({ ...quote, extraCharges: null })).toBeNull();
  });
  it("imports eBay without inventing seller or tax details", () => {
    const quote = quoteFromRetail(
      {
        id: "123",
        title: "Rear lamp",
        price: 20,
        shipping: 0,
        currency: "EUR",
        country: "DE",
        condition: "New",
        url: "https://ebay.de/itm/123",
        affiliate: true,
      },
      at,
    );
    expect(quote.extraCharges).toBeNull();
    expect(quote.sellerHistory).toBe("");
    expect(quote.origin).toBe("ebay-live");
  });
  it("matches all vehicle axes without turning a source claim into verification", () => {
    const { vehicle, evidence } = setup();
    expect(fitmentEvidenceVerdict("PN123", vehicle, [evidence])).toMatchObject({
      state: "direct",
      count: 1,
    });
    for (const changed of [
      { engineCode: "N43" },
      { platform: "E91" },
      { productionYear: 2013 },
      { bodyStyle: "Coupe" as const },
      { transmission: "Automatic" as const },
      { make: "Ford" },
    ])
      expect(
        fitmentEvidenceVerdict("PN123", { ...vehicle, ...changed }, [evidence])
          .state,
      ).toBe("unknown");
    expect(
      fitmentEvidenceVerdict("PN123", { ...vehicle, engineCode: "UNKNOWN" }, [
        evidence,
      ]).state,
    ).toBe("unknown");
  });
  it("blocks conflicting evidence instead of preferring a positive claim", () => {
    const { vehicle, evidence, quote, edit } = setup();
    const updated = edit((state) => ({
      ...state,
      quotes: [quote],
      fitment: [
        evidence,
        { ...evidence, id: crypto.randomUUID(), verdict: "incompatible" },
      ],
    }));
    expect(
      fitmentEvidenceVerdict(
        quote.partNumber,
        vehicle,
        updated.workbench!.fitment,
      ).state,
    ).toBe("conflict");
    expect(() =>
      edit((state, item) =>
        selectWorkbenchQuote(state, item, quote.id, vehicle),
      ),
    ).toThrow("Resolve");
  });
  it("selects one quote and updates budget without creating an expense", () => {
    const { vehicle, quote, edit, evidence } = setup();
    edit((state) => ({ ...state, quotes: [quote], fitment: [evidence] }));
    for (let i = 0; i < 2; i++)
      edit((state, item) =>
        selectWorkbenchQuote(state, item, quote.id, vehicle),
      );
    expect(readBuildState(localStorage).items[0]).toMatchObject({
      estimatedCost: 210,
      deliveredPrice: 210,
      merchantName: quote.retailer,
    });
    expect(readCostState(localStorage).entries).toHaveLength(0);
  });
  it("rejects missing totals and foreign-currency budget selection", () => {
    const { vehicle, quote, edit, evidence } = setup();
    edit((state) => ({
      ...state,
      quotes: [{ ...quote, currency: "USD" }],
      fitment: [evidence],
    }));
    expect(() =>
      edit((state, item) =>
        selectWorkbenchQuote(state, item, quote.id, vehicle),
      ),
    ).toThrow("EUR");
    edit((state) => ({
      ...state,
      quotes: [{ ...quote, shipping: null }],
      fitment: [evidence],
    }));
    expect(() =>
      edit((state, item) =>
        selectWorkbenchQuote(state, item, quote.id, vehicle),
      ),
    ).toThrow("charges");
  });
  it("does not let an edit corrupt a selected quote total", () => {
    const { vehicle, quote, edit, evidence } = setup();
    edit((state) => ({ ...state, quotes: [quote], fitment: [evidence] }));
    edit((state, item) => selectWorkbenchQuote(state, item, quote.id, vehicle));
    expect(() =>
      edit((state) => ({ ...state, quotes: [{ ...quote, shipping: null }] })),
    ).toThrow("complete EUR");
  });
  it("rejects cross-vehicle writes and enforces capacity", () => {
    const { item, build, quote, edit } = setup();
    expect(() =>
      updateWorkbench(
        "other",
        build.id,
        item.id,
        localStorage,
        (state) => state,
      ),
    ).toThrow("vehicle");
    expect(() =>
      edit((state) => ({
        ...state,
        quotes: Array.from({ length: 13 }, (_, i) => ({
          ...quote,
          id: String(i),
        })),
      })),
    ).toThrow();
  });
  it.each([
    "javascript:alert(1)",
    "http://example.com",
    "https://user:pass@example.com",
    "https://127.0.0.1/x",
    "https://localhost/x",
  ])("rejects unsafe evidence link %s", (value) =>
    expect(safeEvidenceUrl(value)).toBe(false),
  );
});
describe("purchase workflow, costs and Passport", () => {
  const purchase = {
    orderedAt: "2026-09-01",
    amount: 210,
    accounting: "include",
    refunded: 0,
    updatedAt: at,
  };
  it("repeated saves generate one cost, never a second stored copy", () => {
    const { edit } = setup();
    for (let i = 0; i < 3; i++)
      edit((state) => saveWorkbenchPurchase(purchase, state));
    expect(readCostState(localStorage).entries).toHaveLength(1);
    setVehicleBudget("car", 5000, localStorage);
    expect(
      JSON.parse(localStorage.getItem(COST_STORAGE_KEY)!).entries,
    ).toHaveLength(0);
    saveCostEntry(
      {
        vehicleId: "car",
        label: "Workshop labour",
        amount: 50,
        category: "labor",
        occurredOn: "2026-09-02",
      },
      localStorage,
    );
    expect(readCostState(localStorage).entries).toHaveLength(2);
    expect(
      readCostState(localStorage).entries.reduce(
        (sum, entry) => sum + entry.amount,
        0,
      ),
    ).toBe(260);
  });
  it("handles refunds and an already-entered expense without duplicates", () => {
    const { edit } = setup();
    edit((state) =>
      saveWorkbenchPurchase({ ...purchase, refunded: 20 }, state),
    );
    expect(readCostState(localStorage).entries[0].amount).toBe(190);
    edit((state) =>
      saveWorkbenchPurchase(
        { ...purchase, accounting: "already-recorded" },
        state,
      ),
    );
    expect(readCostState(localStorage).entries).toHaveLength(0);
    edit((state) =>
      saveWorkbenchPurchase({ ...purchase, refunded: 210 }, state),
    );
    expect(readCostState(localStorage).entries).toHaveLength(0);
  });
  it("locks status edits and linked expense deletion outside the workflow", () => {
    const { item, edit } = setup();
    edit((state) => saveWorkbenchPurchase(purchase, state));
    expect(() =>
      updateBuildItemStatus(item.id, "planned", localStorage),
    ).toThrow("workflow");
    expect(() =>
      deleteCostEntry(`build-purchase-${item.id}`, "car", localStorage),
    ).toThrow("refund");
  });
  it.each([
    { deliveredAt: "2026-08-01" },
    { installedAt: "2026-09-02", mileage: 1 },
    { deliveredAt: "2026-09-02", installedAt: "2026-09-01", mileage: 1 },
    { deliveredAt: "2026-09-02", installedAt: "2026-09-03" },
    { refunded: 211 },
    { amount: 0.001 },
    { orderedAt: "2999-01-01" },
  ])("rejects invalid lifecycle data without mutation", (patch) => {
    const { edit } = setup();
    const before = JSON.stringify(readBuildState(localStorage));
    expect(() =>
      edit((state) => saveWorkbenchPurchase({ ...purchase, ...patch }, state)),
    ).toThrow();
    expect(JSON.stringify(readBuildState(localStorage))).toBe(before);
  });
  it("exports dated progress and actual cost but excludes private evidence", () => {
    const { vehicle, edit } = setup();
    edit((state) => ({
      ...saveWorkbenchPurchase(
        {
          ...purchase,
          deliveredAt: "2026-09-02",
          installedAt: "2026-09-03",
          mileage: 140010,
          installer: "PRIVATE-INSTALLER",
        },
        state,
      ),
      evidence: [
        {
          id: crypto.randomUUID(),
          kind: "receipt",
          label: "PRIVATE-RECEIPT",
          documentName: "private-receipt.pdf",
          recordedAt: at,
        },
      ],
    }));
    const passport = buildVehiclePassport(vehicle.id, localStorage)!;
    expect(vehiclePassportSchema.safeParse(passport).success).toBe(true);
    expect(passport.modifications[0]).toMatchObject({
      status: "installed",
      cost: 210,
      costBasis: "paid-net-of-refunds",
      installedAt: "2026-09-03",
      installationMileage: 140010,
    });
    expect(JSON.stringify(passport)).not.toContain("PRIVATE");
    expect(JSON.stringify(passport)).not.toContain("private-receipt");
    const events = buildVehicleTimeline(vehicle.id, localStorage);
    expect(events.some((event) => event.title.startsWith("Purchased"))).toBe(
      true,
    );
    expect(events.some((event) => event.title.startsWith("Delivered"))).toBe(
      true,
    );
    expect(
      events.some((event) => event.title.startsWith("Evidence linked")),
    ).toBe(true);
  });
});
