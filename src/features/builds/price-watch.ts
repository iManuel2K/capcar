import type { NotificationItem } from "@/features/notifications/notification-schema";
import type { Vehicle } from "@/features/vehicles/vehicle-schema";
import {
  priceWatchSchema,
  type BuildQuote,
  type BuildWorkbench,
  type PriceSnapshot,
} from "./build-workbench-schema";
import { fitmentEvidenceVerdict, quoteTotal } from "./build-workbench";

function snapshotFromQuote(
  quote: BuildQuote,
  observedAt: string,
  fitmentState: string,
): PriceSnapshot {
  return {
    observedAt,
    price: quote.price,
    shipping: quote.shipping,
    extraCharges: quote.extraCharges,
    tax: quote.tax,
    importCharges: quote.importCharges,
    otherCharges: quote.otherCharges,
    currency: quote.currency,
    availability: quote.availability,
    sellerHistory: quote.sellerHistory,
    warranty: quote.warranty,
    fitmentState,
  };
}

export function togglePriceWatch(
  workbench: BuildWorkbench,
  quote: BuildQuote,
  targetPrice: number | undefined,
  now = new Date().toISOString(),
) {
  if (quote.destination === "Unconfirmed")
    throw new Error("Confirm the destination before watching this offer.");
  const existing = workbench.watches.find(
    (watch) => watch.quoteId === quote.id,
  );
  if (existing)
    return {
      ...workbench,
      watches: workbench.watches.filter((watch) => watch.id !== existing.id),
    };
  const watch = priceWatchSchema.parse({
    id: crypto.randomUUID(),
    quoteId: quote.id,
    query: quote.title,
    partNumber: quote.partNumber,
    destination: quote.destination,
    targetPrice,
    createdAt: now,
    snapshots: [],
  });
  return { ...workbench, watches: [...workbench.watches, watch] };
}

export function refreshPriceWatches(
  workbench: BuildWorkbench,
  vehicle: Vehicle,
  vehicleLabel: string,
  href: string,
  now = new Date().toISOString(),
) {
  const notifications: NotificationItem[] = [];
  const watches = workbench.watches.map((watch) => {
    const quote = workbench.quotes.find((entry) => entry.id === watch.quoteId);
    if (!quote) return watch;
    const fitment = fitmentEvidenceVerdict(
      quote.partNumber,
      vehicle,
      workbench.fitment,
    );
    const snapshot = snapshotFromQuote(quote, now, fitment.state);
    const previous = watch.snapshots.at(-1);
    const previousTotal = previous ? snapshotTotal(previous) : null;
    const total = quoteTotal(quote);
    const events: string[] = [];
    if (
      watch.targetPrice !== undefined &&
      total !== null &&
      total <= watch.targetPrice &&
      (previousTotal === null || previousTotal > watch.targetPrice)
    )
      events.push(`Target reached at ${money(total, quote.currency)}`);
    if (previousTotal !== null && total !== null && total < previousTotal)
      events.push(
        `Delivered total fell by ${money(previousTotal - total, quote.currency)}`,
      );
    if (
      previous?.availability === "unavailable" &&
      quote.availability !== "unavailable"
    )
      events.push("Offer returned to stock");
    if (
      previous &&
      previous.availability !== "unavailable" &&
      quote.availability === "unavailable"
    )
      events.push("Offer became unavailable");
    if (
      previous &&
      (previous.sellerHistory !== quote.sellerHistory ||
        previous.warranty !== quote.warranty)
    )
      events.push("Seller or warranty evidence changed");
    if (previous?.fitmentState && previous.fitmentState !== fitment.state)
      events.push(`Fitment evidence changed to ${fitment.label}`);
    const signature = events.join("|");
    if (signature && signature !== watch.lastAlertSignature)
      notifications.push({
        id: `price-watch:${watch.id}:${signature}`,
        vehicleId: vehicle.id,
        vehicleLabel,
        taskKey: `price-watch:${watch.id}`,
        category: "price-watch",
        title: quote.title,
        urgency: fitment.state === "conflict" ? "overdue" : "info",
        detail: events.join(" · "),
        href,
        createdAt: now,
      });
    const unchanged =
      previous &&
      JSON.stringify({ ...previous, observedAt: undefined }) ===
        JSON.stringify({ ...snapshot, observedAt: undefined });
    return priceWatchSchema.parse({
      ...watch,
      checkedAt: now,
      lastAlertSignature: signature || watch.lastAlertSignature,
      snapshots: unchanged
        ? watch.snapshots
        : [...watch.snapshots, snapshot].slice(-30),
    });
  });
  return { workbench: { ...workbench, watches }, notifications };
}

export function snapshotTotal(snapshot: PriceSnapshot) {
  const detailed = [
    snapshot.tax,
    snapshot.importCharges,
    snapshot.otherCharges,
  ];
  const usesDetailed = detailed.some((value) => value !== undefined);
  if (
    snapshot.shipping === null ||
    (usesDetailed
      ? detailed.some((value) => value === null || value === undefined)
      : snapshot.extraCharges === null)
  )
    return null;
  return (
    snapshot.price +
    snapshot.shipping +
    (usesDetailed
      ? (snapshot.tax ?? 0) +
        (snapshot.importCharges ?? 0) +
        (snapshot.otherCharges ?? 0)
      : (snapshot.extraCharges ?? 0))
  );
}

function money(value: number, currency: string) {
  return new Intl.NumberFormat("en-IE", { style: "currency", currency }).format(
    value,
  );
}
