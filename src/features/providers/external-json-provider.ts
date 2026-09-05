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
    });
    if (!response.ok)
      throw new Error(`Provider request failed with status ${response.status}`);
    return (await response.json()) as TResponse;
  } finally {
    clearTimeout(timeout);
  }
}
