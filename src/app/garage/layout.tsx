import { GarageShell } from "@/components/garage/garage-shell";

export default function GarageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <GarageShell>{children}</GarageShell>;
}
