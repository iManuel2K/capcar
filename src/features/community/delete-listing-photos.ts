import type { SupabaseClient } from "@supabase/supabase-js";
export async function deleteOwnListingPhotos(client: SupabaseClient) {
  const { data, error } = await client.auth.getUser();
  if (error || !data.user)
    throw new Error("Sign in again before deleting your photos.");
  const bucket = client.storage.from("listing-photos");
  const owner = data.user.id;
  // Delete through Storage rather than deleting metadata rows directly.
  for (let page = 0; page < 100; page++) {
    const folders = await bucket.list(owner, { limit: 100 });
    if (folders.error) {
      // Earlier installations may not have the photo feature enabled yet.
      if (folders.error.message.toLowerCase().includes("bucket not found"))
        return;
      throw new Error(
        "Could not delete listing photos. Retry before deleting your account.",
      );
    }
    if (!folders.data.length) return;
    for (const folder of folders.data) {
      if (!/^[0-9a-f-]{36}$/i.test(folder.name))
        throw new Error("Unexpected photo folder. Contact support.");
      const prefix = `${owner}/${folder.name}`;
      const files = await bucket.list(prefix, { limit: 100 });
      if (files.error) throw new Error("Could not read your listing photos.");
      const paths = files.data.map((file) => `${prefix}/${file.name}`);
      if (paths.length && (await bucket.remove(paths)).error)
        throw new Error("Could not delete listing photos. Please retry.");
    }
  }
  throw new Error(
    "More photos remain. Repeat deletion to finish removing them.",
  );
}
