import { readBoundedText } from "@/lib/http/read-bounded-body";

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
    const raw = await readBoundedText(response, 2_000_000);
    return JSON.parse(raw) as TResponse;
  } finally {
    clearTimeout(timeout);
  }
}
