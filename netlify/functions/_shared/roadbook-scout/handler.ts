import { isAuthorizedManualRun, runRoadbookScout } from "./runner";

export function roadbookScoutHandler(shard: number) {
  return async (request: Request) => {
    try {
      const result = await runRoadbookScout({
        shard,
        force: isAuthorizedManualRun(request),
      });
      return Response.json(result, {
        status: result.status === "partial" ? 207 : 200,
        headers: { "Cache-Control": "no-store" },
      });
    } catch (error) {
      console.error("Roadbook Scout failed", {
        shard,
        message: error instanceof Error ? error.message : "Unknown error",
      });
      return Response.json(
        { status: "failed", shard },
        { status: 500, headers: { "Cache-Control": "no-store" } },
      );
    }
  };
}
