import type { CommunityRole } from "./contracts";

/** Approval is assigned by the operator; a suspended account is never active. */
export function activeSpecialists(
  roles: CommunityRole[],
  excludeUserId?: string,
) {
  const suspended = new Set(
    roles
      .filter((role) => role.role === "suspended")
      .map((role) => role.user_id),
  );
  return roles.filter(
    (role) =>
      role.role === "specialist" &&
      role.user_id !== excludeUserId &&
      !suspended.has(role.user_id),
  );
}
