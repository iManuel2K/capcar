import { roadbookScoutHandler } from "./_shared/roadbook-scout/handler";

export default roadbookScoutHandler(3);

export const config = { schedule: "0 7 * * 1" };
