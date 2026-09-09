"use client";
import { useCommunity } from "@/features/community/use-community";
import { useVehicles } from "@/features/vehicles/use-vehicles";
import { actionClass, fieldClass } from "./community-shell";
export function VerifiedWork() {
  const { data, error, busy, mutate, refresh } = useCommunity();
  const { vehicles } = useVehicles();
  const specialists =
    data?.roles.filter(
      (role) => role.role === "specialist" && role.user_id !== data.userId,
    ) ?? [];
  return (
    <div className="space-y-6">
      <p className="max-w-3xl leading-7">
        Request confirmation from an approved specialist for work on a synced
        garage vehicle. Only that specialist can confirm the request. A stamp
        records their attestation, not an independent safety inspection.
        Browser-local beta stamps remain unverified.
      </p>
      {error && <p role="alert">{error}</p>}
      <button
        className={actionClass}
        onClick={() => void refresh()}
        disabled={busy}
      >
        Refresh requests
      </button>
      {!data && !error && <p role="status">Loading specialist records…</p>}
      {data && (
        <>
          {!specialists.length ? (
            <p>
              No approved specialists are available yet. Specialist accounts
              must be reviewed and enrolled by the operator.
            </p>
          ) : (
            <form
              className="space-y-4 rounded-2xl border border-[#0e2d30]/20 p-5"
              onSubmit={async (event) => {
                event.preventDefault();
                const form = event.currentTarget;
                if (
                  await mutate(
                    "request_stamp",
                    Object.fromEntries(new FormData(form)),
                  )
                )
                  form.reset();
              }}
            >
              <h2 className="text-2xl">Request a work stamp</h2>
              <label className="block">
                Garage vehicle
                <select name="vehicle_id" required className={fieldClass}>
                  <option value="">Choose a synced vehicle</option>
                  {vehicles
                    .filter((vehicle) => !vehicle.demoProject)
                    .map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.make} {vehicle.model} ·{" "}
                        {vehicle.nickname || vehicle.productionYear}
                      </option>
                    ))}
                </select>
              </label>
              <label className="block">
                Specialist
                <select name="specialist_id" required className={fieldClass}>
                  {specialists.map((role) => (
                    <option key={role.user_id} value={role.user_id}>
                      {role.display_name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                Work performed
                <textarea
                  name="work"
                  required
                  minLength={5}
                  maxLength={500}
                  className={fieldClass}
                />
              </label>
              <label className="block">
                Date performed
                <input
                  name="performed_on"
                  type="date"
                  required
                  className={fieldClass}
                />
              </label>
              <button disabled={busy} className={actionClass}>
                Request confirmation
              </button>
            </form>
          )}
          <h2 className="text-2xl">Your latest 100 work records</h2>
          {!data.stamps.length && <p>No requests or verified stamps yet.</p>}
          {data.stamps.map((stamp) => {
            const specialist = data.roles.find(
              (role) =>
                role.user_id === stamp.specialist_id &&
                role.role === "specialist",
            );
            return (
              <article
                key={stamp.id}
                className="space-y-3 rounded-2xl border border-[#0e2d30]/20 p-5"
              >
                <p className="text-xs uppercase">
                  {stamp.status === "verified" && !specialist
                    ? "Specialist approval no longer active"
                    : stamp.status}
                </p>
                <h3 className="text-xl break-words">{stamp.work}</h3>
                <p>
                  {stamp.performed_on} ·{" "}
                  {specialist?.display_name ?? "Former specialist"}
                </p>
                <p className="text-sm">
                  Vehicle:{" "}
                  {vehicles.find((vehicle) => vehicle.id === stamp.vehicle_id)
                    ?.nickname || stamp.vehicle_id}
                </p>
                {stamp.evidence && (
                  <p className="break-words">
                    Specialist evidence: {stamp.evidence}
                  </p>
                )}
                {stamp.specialist_id === data.userId &&
                  stamp.status === "requested" && (
                    <form
                      className="space-y-3"
                      onSubmit={(event) => {
                        event.preventDefault();
                        void mutate(
                          "decide_stamp",
                          Object.fromEntries(new FormData(event.currentTarget)),
                          stamp.id,
                        );
                      }}
                    >
                      <label className="block">
                        Decision
                        <select name="status" className={fieldClass}>
                          <option value="rejected">Cannot confirm</option>
                          <option value="verified">
                            I performed and confirm this work
                          </option>
                        </select>
                      </label>
                      <label className="block">
                        Job reference and evidence (no customer contact details)
                        <textarea
                          name="evidence"
                          required
                          minLength={5}
                          maxLength={500}
                          className={fieldClass}
                        />
                      </label>
                      <button className={actionClass} disabled={busy}>
                        Record attestation
                      </button>
                    </form>
                  )}
                {stamp.status !== "revoked" && (
                  <button
                    className={actionClass}
                    disabled={busy}
                    onClick={() => void mutate("revoke_stamp", {}, stamp.id)}
                  >
                    Revoke request or stamp
                  </button>
                )}
              </article>
            );
          })}
        </>
      )}
    </div>
  );
}
