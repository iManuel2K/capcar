import { getPriceWatchEnvironment } from "./_shared/price-watch-scout/environment";
import { runScheduledPriceWatches } from "./_shared/price-watch-scout/runner";

export default async function priceWatchRefreshBackground(request: Request) {
  const expected = getPriceWatchEnvironment().jobSecret;
  if (request.headers.get("authorization") !== `Bearer ${expected}`) {
    return new Response(null, { status: 401 });
  }
  try {
    await runScheduledPriceWatches();
  } catch (error) {
    console.error("Scheduled price-watch refresh failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
  return new Response(null, { status: 202 });
}
