import { getPriceWatchEnvironment } from "./_shared/price-watch-scout/environment";
import {
  failedRunLog,
  successfulRunLog,
} from "./_shared/price-watch-scout/monitoring";
import { runScheduledPriceWatches } from "./_shared/price-watch-scout/runner";

export default async function priceWatchRefreshBackground(request: Request) {
  const startedAt = Date.now();
  const expected = getPriceWatchEnvironment().jobSecret;
  if (request.headers.get("authorization") !== `Bearer ${expected}`) {
    return new Response(null, { status: 401 });
  }
  try {
    const summary = await runScheduledPriceWatches();
    console.info("Scheduled price-watch refresh completed", {
      ...successfulRunLog(summary, startedAt),
    });
  } catch (error) {
    console.error(
      "Scheduled price-watch refresh failed",
      failedRunLog(error, startedAt),
    );
    throw error;
  }
  return new Response(null, { status: 202 });
}
