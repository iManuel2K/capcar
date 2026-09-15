import { z } from "zod";

import { evidenceSchema } from "@/features/builds/build-workbench-schema";
import type { FitmentResolutionRequest } from "@/features/fitment/fitment-provider";

const responseSchema = z.object({
  provider: z.string().min(1).max(80),
  checkedAt: z.iso.datetime(),
  records: evidenceSchema.array().max(10),
  warnings: z.string().array().max(10),
});

export async function requestConnectedFitment(
  input: FitmentResolutionRequest,
  signal: AbortSignal,
) {
  const response = await fetch("/api/fitment/resolve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    cache: "no-store",
    signal,
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(
      body?.error ||
        (response.status === 401
          ? "Sign in to check connected fitment sources."
          : "Connected fitment sources are unavailable."),
    );
  }
  return responseSchema.parse(await response.json());
}
