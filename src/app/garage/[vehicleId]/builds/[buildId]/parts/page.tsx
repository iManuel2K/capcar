import type { Metadata } from "next";
import { BuildPartsWorkspace } from "@/components/builds/build-parts-workspace";
export const metadata: Metadata = {
  title: "Compare parts for your build",
  robots: { index: false, follow: false },
};
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ vehicleId: string; buildId: string }>;
  searchParams: Promise<{ item?: string | string[] }>;
}) {
  const { vehicleId, buildId } = await params;
  const { item } = await searchParams;
  return (
    <BuildPartsWorkspace
      vehicleId={vehicleId}
      buildId={buildId}
      initialItem={typeof item === "string" ? item : ""}
    />
  );
}
