import { getPriceWatchEnvironment } from "./_shared/price-watch-scout/environment";

type NetlifyContext = {
  site: { url: string };
};

export default async function priceWatchScout(
  _request: Request,
  context: NetlifyContext,
) {
  const secret = getPriceWatchEnvironment().jobSecret;
  const response = await fetch(
    new URL(
      "/.netlify/functions/price-watch-refresh-background",
      context.site.url,
    ),
    {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}` },
      body: JSON.stringify({ trigger: "schedule" }),
    },
  );
  if (!response.ok && response.status !== 202)
    throw new Error(
      `Could not start price-watch background job (${response.status})`,
    );
  return new Response(null, { status: 202 });
}

export const config = { schedule: "17 */6 * * *" };
