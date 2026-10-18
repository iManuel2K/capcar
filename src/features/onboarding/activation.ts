import { trackAnalytics } from "@/features/analytics/client";
import { ONBOARDING_EVENT, ONBOARDING_KEY, readOnboarding } from "./onboarding";

/** Also activate a skipped setup when its first useful action happens later. */
export function activateGarage(
  vehicleId: string,
  actionType: "maintenance" | "modification" | "drive",
) {
  try {
    const records = readOnboarding(localStorage);
    if (
      records.some(
        (record) => record.vehicleId === vehicleId && record.activatedAt,
      )
    )
      return;
    const pending = records.find((record) => record.vehicleId === vehicleId);
    if (!pending) return;
    localStorage.setItem(
      ONBOARDING_KEY,
      JSON.stringify(
        records.map((record) =>
          record.id === pending.id
            ? { ...record, activatedAt: new Date().toISOString() }
            : record,
        ),
      ),
    );
    window.dispatchEvent(new Event(ONBOARDING_EVENT));
    const properties = {
      action_type: actionType,
      elapsed_seconds: String(
        Math.min(
          604800,
          Math.max(0, Math.round((Date.now() - pending.startedAt) / 1000)),
        ),
      ),
    };
    trackAnalytics("first_useful_action_completed", properties);
    trackAnalytics("onboarding_activated", properties);
  } catch {
    /* A measurement must never undo the action it measures. */
  }
}
