const unavailableTitle = "Passport unavailable";
const unavailableMessage = "This link is no longer public.";

/**
 * Next.js may stream a segment-level notFound() response after its HTTP status
 * has been committed. On adapters such as Netlify, that valid response can be
 * HTTP 200, so require both the private-safe Capcar state and noindex metadata.
 */
export function isMissingPassportResponse({
  status,
  body,
  robotsHeader = null,
}) {
  if (status === 404) return true;
  if (status !== 200) return false;

  const isUnavailableDocument =
    body.includes(unavailableTitle) && body.includes(unavailableMessage);
  const isNoIndex =
    /(?:^|[,\s])noindex(?:[,\s]|$)/i.test(robotsHeader ?? "") ||
    /<meta\s+[^>]*(?:name=["']robots["'][^>]*content=["'][^"']*noindex|content=["'][^"']*noindex[^"']*["'][^>]*name=["']robots["'])[^>]*>/i.test(
      body,
    );

  return isUnavailableDocument && isNoIndex;
}
