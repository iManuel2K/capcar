import { roadbookScoutHandler } from "./_shared/roadbook-scout/handler";

export default roadbookScoutHandler(2);

export const config = { schedule: "0 5 * * 1" };
