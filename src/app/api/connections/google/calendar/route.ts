import { NextResponse } from "next/server";
import { z } from "zod";

import { createGoogleCalendarEvent } from "@/features/connections/google-api";
import { getGoogleConnectionEnvironment } from "@/features/connections/google-connection";
import {
  getFreshGoogleAccessToken,
  getGoogleConnection,
} from "@/features/connections/google-store";
import { isSameOriginRequest, readJsonRequest } from "@/lib/api/guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { currentUser } from "@/lib/supabase/current-user";

export const runtime = "nodejs";

const requestSchema = z.object({
  summary: z.string().trim().min(2).max(200),
  description: z.string().trim().max(4000),
  startDate: z.iso.date(),
  endDate: z.iso.date(),
});

export async function POST(request: Request) {
  if (!isSameOriginRequest(request))
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  const user = await currentUser();
  if (!user)
    return NextResponse.json(
      { error: "Sign in before adding a calendar event." },
      { status: 401 },
    );
  try {
    const input = await readJsonRequest(request, requestSchema);
    if (input.endDate <= input.startDate)
      return NextResponse.json(
        { error: "Calendar end date must be after the start date." },
        { status: 400 },
      );
    const environment = getGoogleConnectionEnvironment();
    const admin = createAdminClient();
    const connection = await getGoogleConnection(admin, user.id);
    if (!connection)
      return NextResponse.json(
        { error: "Connect Google Calendar first." },
        { status: 409 },
      );
    const accessToken = await getFreshGoogleAccessToken(
      admin,
      connection,
      environment,
    );
    const event = await createGoogleCalendarEvent(accessToken, input);
    return NextResponse.json(event, {
      status: 201,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { error: "The trip could not be added to Google Calendar." },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
