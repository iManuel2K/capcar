import { getAuthStatus } from "@/features/auth/auth-config";
import { createClient } from "./server";

export async function currentUser() {
  if (!getAuthStatus().configured) return null;
  try {
    const client = await createClient();
    const { data, error } = await client.auth.getUser();
    return error ? null : data.user;
  } catch {
    return null;
  }
}
