export async function requestExternalProvider<TRequest, TResponse>(
  connection: { endpoint: string; apiKey: string },
  body: TRequest,
): Promise<TResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetch(connection.endpoint, {
      method: "POST",
      headers: {
        authorization: `Bearer ${connection.apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: controller.signal,
      redirect: "error",
    });
    if (!response.ok)
      throw new Error(`Provider request failed with status ${response.status}`);
    const declaredSize = Number(response.headers.get("content-length") ?? 0);
    if (declaredSize > 2_000_000)
      throw new Error("Provider response exceeded the safe size limit.");
    const raw = await response.text();
    if (new TextEncoder().encode(raw).byteLength > 2_000_000)
      throw new Error("Provider response exceeded the safe size limit.");
    return JSON.parse(raw) as TResponse;
  } finally {
    clearTimeout(timeout);
  }
}
