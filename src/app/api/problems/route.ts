import { NextResponse } from "next/server";
import { getProblemProfile } from "@/features/problems/source-profiles";
import { getOfficialProblems } from "@/features/problems/official-records-cache";

const variation = { "Netlify-Vary": "query=profile|year" };
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const id = params.get("profile") ?? "";
  const yearText = params.get("year") ?? "";
  const year = Number(yearText);
  const profile = getProblemProfile(id);
  // Reject unknown/private parameters, repeated keys and out-of-catalog years.
  if (
    [...params.keys()].some((key) => !["profile", "year"].includes(key)) ||
    params.getAll("profile").length !== 1 ||
    params.getAll("year").length !== 1 ||
    !profile ||
    !/^\d{4}$/.test(yearText) ||
    year < profile.years[0] ||
    year > profile.years[1]
  ) {
    return NextResponse.json(
      { error: "Choose a supported model and year." },
      {
        status: 400,
        headers: {
          ...variation,
          "Cache-Control": "no-store",
          "Netlify-CDN-Cache-Control": "no-store",
        },
      },
    );
  }
  try {
    const credentialed =
      request.headers.has("cookie") || request.headers.has("authorization");
    return NextResponse.json(await getOfficialProblems(id, year), {
      headers: {
        ...variation,
        "Cache-Control": credentialed
          ? "private, no-store"
          : "public, max-age=300",
        "Netlify-CDN-Cache-Control": credentialed
          ? "no-store"
          : "public, durable, max-age=3600, stale-while-revalidate=3600",
        "Netlify-Cache-Tag": `official-problem-records,problem-${id}`,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "Official source temporarily unavailable. Reviewed references remain available.",
      },
      {
        status: 503,
        headers: {
          ...variation,
          "Cache-Control": "no-store",
          "Netlify-CDN-Cache-Control": "no-store",
          "Retry-After": "60",
        },
      },
    );
  }
}
