import type { Metadata } from "next";

import { OfferComparison } from "@/components/offers/offer-comparison";

export const metadata: Metadata = { title: "Compare demo offers" };

export default async function OffersPage({
  params,
}: {
  params: Promise<{ vehicleId: string; partId: string }>;
}) {
  const { vehicleId, partId } = await params;
  return <OfferComparison vehicleId={vehicleId} partId={partId} />;
}
