import type { SupabaseClient } from "@supabase/supabase-js";
import { DOCUMENT_BUCKET, documentPrefix } from "./vehicle-documents";

export async function deleteOwnVehicleDocuments(client: SupabaseClient) {
  const { data, error } = await client.auth.getUser();
  if (error || !data.user)
    throw new Error("Sign in again before deleting your documents.");
  const owner = data.user.id;
  const bucket = client.storage.from(DOCUMENT_BUCKET);
  const safe = (name: string) =>
    /^[a-zA-Z0-9_.-]{1,200}$/.test(name) && name !== "." && name !== "..";
  for (let page = 0; page < 100; page++) {
    const folders = await bucket.list(owner, { limit: 100 });
    if (folders.error) {
      if (folders.error.message.toLowerCase().includes("bucket not found"))
        return;
      throw new Error(
        "Private documents could not be listed. Retry before deleting your garage or account.",
      );
    }
    if (!folders.data.length) return;
    for (const folder of folders.data) {
      if (!safe(folder.name))
        throw new Error(
          "Unexpected document path. Contact support before deleting your account.",
        );
      if (folder.id) {
        if ((await bucket.remove([`${owner}/${folder.name}`])).error)
          throw new Error("Document deletion failed. Retry.");
        continue;
      }
      const prefix = documentPrefix(owner, folder.name);
      const files = await bucket.list(prefix, { limit: 100 });
      if (files.error)
        throw new Error("Private documents could not be read. Retry.");
      if (files.data.some((file) => !file.id || !safe(file.name)))
        throw new Error("Unexpected nested document folder. Contact support.");
      const paths = files.data.map((file) => `${prefix}/${file.name}`);
      if (paths.length && (await bucket.remove(paths)).error)
        throw new Error("Private documents could not be deleted. Retry.");
    }
  }
  throw new Error(
    "More private documents remain. Repeat deletion to finish before deleting the account.",
  );
}
