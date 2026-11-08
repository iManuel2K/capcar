import { NextResponse } from "next/server";
import {
  getAiConnection,
  getAiConnectionSetup,
} from "@/features/connections/ai-connection";
import { drivingReviewRequestSchema } from "@/features/driving-review/contracts";
import {
  DrivingReviewError,
  isBoundedJpeg,
  reviewDrivingFrames,
} from "@/features/driving-review/review-service";
import {
  guardProductApi,
  isSameOriginRequest,
  readJsonRequest,
  productApiError,
} from "@/lib/api/guard";
import { currentUser } from "@/lib/supabase/current-user";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 60;
const headers = { "Cache-Control": "private, no-store" };
const failure = (code: string, status: number) =>
  NextResponse.json({ code }, { status, headers });

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return failure("origin", 403);
  const user = await currentUser();
  if (!user) return failure("account", 401);
  if (request.headers.get("x-capcar-owner") !== user.id)
    return failure("account", 409);
  const guard = await guardProductApi("driving-review", {
    limit: 5,
    windowSeconds: 300,
  });
  if (!guard.ok) return guard.response;
  let input;
  try {
    input = await readJsonRequest(
      request,
      drivingReviewRequestSchema,
      2_200_000,
    );
    if (!input.frames.every((frame) => isBoundedJpeg(frame.image)))
      return failure("invalid", 400);
  } catch (error) {
    return productApiError(error, "Invalid driving review request.");
  }
  if (!getAiConnectionSetup().configured) return failure("unavailable", 503);
  try {
    const connection = await getAiConnection(createAdminClient(), user.id);
    if (!connection) return failure("connection", 409);
    const review = await reviewDrivingFrames(input, connection, request.signal);
    return NextResponse.json(
      { review, provider: connection.provider },
      { headers },
    );
  } catch (error) {
    if (error instanceof DrivingReviewError)
      return failure(error.code, error.status);
    return failure("unavailable", 503);
  }
}
