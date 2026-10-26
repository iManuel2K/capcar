import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/supabase/current-user";
import { createAdminClient } from "@/lib/supabase/admin";
import { getTripJob } from "@/features/trips/trip-jobs";
export const runtime = "nodejs";
export async function GET(
  _request: Request,
  context: { params: Promise<{ jobId: string }> },
) {
  const headers = { "Cache-Control": "private, no-store" };
  const user = await currentUser();
  if (!user)
    return NextResponse.json(
      { error: "Sign in to use CapCar AI." },
      { status: 401, headers },
    );
  const { jobId } = await context.params;
  if (!z.uuid().safeParse(jobId).success)
    return NextResponse.json(
      { error: "Trip not found." },
      { status: 404, headers },
    );
  try {
    const job = await getTripJob(createAdminClient(), jobId, user.id);
    return job
      ? NextResponse.json(job, { headers })
      : NextResponse.json(
          { error: "Trip not found or expired." },
          { status: 404, headers },
        );
  } catch {
    return NextResponse.json(
      { error: "Trip status temporarily unavailable." },
      { status: 503, headers },
    );
  }
}
