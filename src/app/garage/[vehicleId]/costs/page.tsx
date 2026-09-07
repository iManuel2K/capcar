import type { Metadata } from "next";
import { CostAnalyticsDashboard } from "@/components/costs/cost-analytics-dashboard";
export const metadata: Metadata = { title: "Cost analytics" };
export default async function Page({ params }: { params: Promise<{ vehicleId: string }> }) { const { vehicleId } = await params; return <CostAnalyticsDashboard vehicleId={vehicleId} />; }
