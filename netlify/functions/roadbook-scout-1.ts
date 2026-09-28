import { roadbookScoutHandler } from "./_shared/roadbook-scout/handler";

export default roadbookScoutHandler(1);

export const config = { schedule: "0 3 * * 1" };
