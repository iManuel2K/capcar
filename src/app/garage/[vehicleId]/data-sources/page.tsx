import type { Metadata } from "next";

import { DataSourcesDashboard } from "@/components/providers/data-sources-dashboard";
import { getProviderStatuses } from "@/features/providers/provider-config";

export const metadata: Metadata = { title: "Data sources" };
export const dynamic = "force-dynamic";

export default async function DataSourcesPage({
  params,
}: {
  params: Promise<{ vehicleId: string }>;
}) {
  const { vehicleId } = await params;
  return (
    <DataSourcesDashboard
      vehicleId={vehicleId}
      statuses={getProviderStatuses()}
    />
  );
}
