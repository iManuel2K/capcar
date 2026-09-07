import type { Metadata } from "next";
import { SpecialistDirectory } from "@/components/specialists/specialist-directory";
export const metadata: Metadata = { title: "Specialist directory" };
export default async function Page({ params }: { params: Promise<{ vehicleId: string }> }) { const { vehicleId } = await params; return <SpecialistDirectory vehicleId={vehicleId} />; }
