const trackedHosts = [
  "ebay.de",
  "www.ebay.de",
  "ebay.com",
  "www.ebay.com",
  "fcpeuro.com",
  "www.fcpeuro.com",
  "ecstuning.com",
  "www.ecstuning.com",
];

export function isTrackedMerchantUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && trackedHosts.includes(url.hostname);
  } catch {
    return false;
  }
}

export function buildOutboundUrl(value: string, itemId: string) {
  if (!isTrackedMerchantUrl(value)) return value;
  const params = new URLSearchParams({ url: value, item: itemId });
  return `/api/out?${params.toString()}`;
}
