const USER_AGENT = "CapCarRoadbookScout/1.0 (+https://capcar.dev/roadbook)";

export const scoutRequestHeaders = {
  Accept: "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.5",
  "User-Agent": USER_AGENT,
} as const;

function rulesForAgent(robots: string, targetAgent: string) {
  const rules: string[] = [];
  let applies = false;

  for (const rawLine of robots.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, "").trim();
    if (!line) continue;
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    const field = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();

    if (field === "user-agent") {
      const agent = value.toLowerCase();
      applies = agent === "*" || targetAgent.toLowerCase().includes(agent);
    } else if (field === "disallow" && applies && value) {
      rules.push(value);
    }
  }

  return rules;
}

export async function robotsAllows(url: string, signal: AbortSignal) {
  const target = new URL(url);
  const robotsUrl = new URL("/robots.txt", target.origin);
  const response = await fetch(robotsUrl, {
    headers: scoutRequestHeaders,
    redirect: "follow",
    signal,
  });

  if (response.status === 404) return true;
  if (!response.ok) return false;

  const rules = [
    ...rulesForAgent(await response.text(), "CapCarRoadbookScout"),
  ];
  return !rules.some(
    (rule) => rule === "/" || target.pathname.startsWith(rule),
  );
}
