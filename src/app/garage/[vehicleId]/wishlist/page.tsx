import type { Metadata } from "next";
import { WishlistDashboard } from "@/components/wishlist/wishlist-dashboard";
export const metadata: Metadata = { title: "Part wishlist" };
export default async function Page({ params }: { params: Promise<{ vehicleId: string }> }) { const { vehicleId } = await params; return <WishlistDashboard vehicleId={vehicleId} />; }
