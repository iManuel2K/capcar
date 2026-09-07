import type { Metadata } from "next";
import { DiagnosticsDashboard } from "@/components/diagnostics/diagnostics-dashboard";
export const metadata: Metadata = { title: "Diagnostic log" };
export default async function Page({ params }: { params: Promise<{ vehicleId: string }> }) { const { vehicleId } = await params; return <DiagnosticsDashboard vehicleId={vehicleId} />; }
