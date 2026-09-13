import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  guardProductApi,
  isSameOriginRequest,
  readJsonRequest,
  productApiError,
} from "@/lib/api/guard";
const schema = z
  .object({
    summary: z.string().trim().min(20).max(1000),
    services: z.string().trim().min(3).max(250),
    area: z.string().trim().min(2).max(150),
    published: z.boolean(),
  })
  .strict();
export async function POST(request: Request) {
  if (!isSameOriginRequest(request))
    return NextResponse.json(
      { error: "Same-origin request required" },
      { status: 403 },
    );
  try {
    const auth = await guardProductApi("specialist-profile", { limit: 10 });
    if (!auth.ok) return auth.response;
    if (!auth.userId)
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    const input = await readJsonRequest(request, schema);
    const client = await createClient();
    const result = await client.rpc("publish_specialist_profile", {
      p_summary: input.summary,
      p_services: input.services,
      p_area: input.area,
      p_published: input.published,
    });
    if (result.error)
      return NextResponse.json(
        { error: "Approved specialist required" },
        { status: 409 },
      );
    return NextResponse.json(
      { saved: true },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return productApiError(error, "Invalid profile");
  }
}
