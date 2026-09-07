import type { Metadata } from "next";
import { PassportWorkspace } from "@/components/passport/passport-workspace";
export const metadata: Metadata = { title: "Vehicle Passport" };
export default async function Page({ params }: { params: Promise<{ vehicleId: string }> }) { const { vehicleId } = await params; return <PassportWorkspace vehicleId={vehicleId} />; }
