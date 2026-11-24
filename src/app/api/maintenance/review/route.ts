import { NextResponse } from "next/server";

import {
  getAiConnection,
  getAiConnectionSetup,
} from "@/features/connections/ai-connection";
import { maintenanceCatalog } from "@/features/maintenance/maintenance-catalog";
import { buildServiceReview } from "@/features/service-review/service-review";
import {
  SERVICE_REVIEW_MAX_BODY_BYTES,
  SERVICE_REVIEW_MAX_IMAGE_EDGE,
  serviceReviewRequestSchema,
  serviceReviewResultSchema,
} from "@/features/service-review/service-review-schema";
import {
  extractServiceEvidence,
  VisionReviewError,
} from "@/features/service-review/vision-extraction";
import {
  guardProductApi,
  isSameOriginRequest,
  productApiError,
  readJsonRequest,
} from "@/lib/api/guard";
import { createAdminClient } from "@/lib/supabase/admin";

const headers = { "Cache-Control": "no-store" };

function fail(status: number, code: string, error: string) {
  return NextResponse.json({ code, error }, { status, headers });
}

function isBoundedJpeg(data: string) {
  const bytes = Buffer.from(data, "base64");
  if (
    bytes.length < 13 ||
    bytes[0] !== 0xff ||
    bytes[1] !== 0xd8 ||
    bytes[bytes.length - 2] !== 0xff ||
    bytes[bytes.length - 1] !== 0xd9
  )
    return false;

  // Check a frame header before sending it upstream. Browser uploads are
  // re-encoded as JPEG; never accept a URL, MIME guess or an unbounded image.
  let hasFrame = false;
  for (let offset = 2; offset + 4 <= bytes.length;) {
    if (bytes[offset] !== 0xff) return false;
    while (bytes[offset] === 0xff) offset++;
    if (offset + 2 >= bytes.length) return false;
    const marker = bytes[offset++];
    if (marker === 0xda) return hasFrame;
    const size = bytes.readUInt16BE(offset);
    if (size < 2 || offset + size > bytes.length) return false;
    if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
      if (hasFrame || size < 8 || bytes[offset + 2] !== 8) return false;
      const height = bytes.readUInt16BE(offset + 3);
      const width = bytes.readUInt16BE(offset + 5);
      if (
        width < 1 ||
        height < 1 ||
        width > SERVICE_REVIEW_MAX_IMAGE_EDGE ||
        height > SERVICE_REVIEW_MAX_IMAGE_EDGE
      )
        return false;
      hasFrame = true;
    }
    offset += size;
  }
  return false;
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request))
    return fail(403, "same_origin_required", "Same-origin request required.");

  const guard = await guardProductApi("service-record-review", {
    limit: 5,
  }).catch(() => null);
  if (!guard)
    return fail(
      503,
      "review_unavailable",
      "The account service is unavailable.",
    );
  if (!guard.ok) return guard.response;
  if (!guard.userId)
    return fail(401, "sign_in_required", "Sign in to review service records.");

  if (
    request.headers.get("content-type")?.split(";")[0]?.trim() !==
    "application/json"
  )
    return fail(415, "invalid_request", "Expected a service review request.");

  let input;
  try {
    input = await readJsonRequest(
      request,
      serviceReviewRequestSchema,
      SERVICE_REVIEW_MAX_BODY_BYTES,
    );
  } catch (error) {
    return productApiError(
      error,
      "Check the service photos and review details.",
    );
  }

  if (!input.photos.every((photo) => isBoundedJpeg(photo.data)))
    return fail(
      400,
      "invalid_image",
      "One or more photos are not valid JPEG images.",
    );

  const today = new Date().toISOString().slice(0, 10);
  if (input.history && input.history.date > today)
    return fail(
      400,
      "invalid_history",
      "A history entry cannot be dated in the future.",
    );

  const userId = guard.userId;
  if (!getAiConnectionSetup().configured)
    return fail(
      409,
      "ai_connection_required",
      "Connect your AI in Account → Connections.",
    );
  let connection;
  try {
    connection = await getAiConnection(createAdminClient(), userId);
  } catch {
    return fail(
      503,
      "review_unavailable",
      "Your AI connection could not be checked.",
    );
  }
  if (!connection)
    return fail(
      409,
      "ai_connection_required",
      "Connect your AI in Account → Connections.",
    );

  // All completed records are owner-supplied (the garage is browser-local).
  // Use server-side catalog names and planning intervals, not client-edited ones.
  const records = new Map(input.tasks.map((task) => [task.key, task.record]));
  const reviewInput = {
    ...input,
    tasks: maintenanceCatalog.map((task) => ({
      key: task.key,
      title: task.title,
      intervalMonths: task.intervalMonths,
      intervalMileage: task.intervalKm,
      record: records.get(task.key),
    })),
  };
  try {
    const evidence = await extractServiceEvidence(
      reviewInput,
      connection,
      request.signal,
    );
    const result = serviceReviewResultSchema.parse(
      buildServiceReview(reviewInput, evidence, today),
    );
    return NextResponse.json(result, { headers });
  } catch (error) {
    if (error instanceof VisionReviewError)
      return fail(error.status, error.code, error.message);
    return fail(
      503,
      "review_unavailable",
      "Service review is temporarily unavailable.",
    );
  }
}
