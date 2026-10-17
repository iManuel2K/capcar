import { isJournalSlug } from "@/features/journal/routes";
import type { Metadata } from "next";

import { CreateBuildForm } from "@/components/builds/create-build-form";

export const metadata: Metadata = { title: "New build" };

export default async function NewBuildPage({
  params,
  searchParams,
}: {
  params: Promise<{ vehicleId: string }>;
  searchParams: Promise<{ journal?: string }>;
}) {
  const { vehicleId } = await params;
  const query = await searchParams;
  return (
    <CreateBuildForm
      vehicleId={vehicleId}
      journalSlug={
        query.journal && isJournalSlug(query.journal)
          ? query.journal
          : undefined
      }
    />
  );
}
