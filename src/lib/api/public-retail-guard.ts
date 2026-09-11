import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const fallbackBudget = {
  minuteStart: 0,
  minuteCount: 0,
  dayStart: 0,
  dayCount: 0,
};

/** Conservative availability fallback for one server instance. */
export function consumeProcessRetailBudget(now = Date.now()) {
  if (now >= fallbackBudget.minuteStart + 60_000) {
    fallbackBudget.minuteStart = now;
    fallbackBudget.minuteCount = 0;
  }
  if (now >= fallbackBudget.dayStart + 86_400_000) {
    fallbackBudget.dayStart = now;
    fallbackBudget.dayCount = 0;
  }
  if (fallbackBudget.minuteCount >= 10 || fallbackBudget.dayCount >= 100)
    return false;
  fallbackBudget.minuteCount++;
  fallbackBudget.dayCount++;
  return true;
}

export async function guardPublicRetail(
  fallback: () => boolean = consumeProcessRetailBudget,
) {
  const headers = { "Cache-Control": "no-store" };
  try {
    const client = await createClient();
    const { data, error } = await client.rpc("consume_public_retail_budget");
    if (error || typeof data !== "boolean")
      throw new Error("Budget unavailable");
    if (!data)
      return NextResponse.json(
        {
          error:
            "Live search is busy or has reached today's allowance. Please try again later.",
        },
        { status: 429, headers },
      );
    return null;
  } catch {
    if (fallback()) return null;
    return NextResponse.json(
      { error: "Live search is busy. Please try again in a minute." },
      { status: 429, headers },
    );
  }
}
