"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./supabase/types";
import { publicUrl, type Bucket } from "./media";

export type StoredImage = { path: string; url: string };

/** Uploads into the caller's own folder — storage policies require the uid as the first segment. */
export async function uploadImage(
  supabase: SupabaseClient<Database>,
  bucket: Bucket,
  userId: string,
  file: Blob,
  extension = "jpg",
): Promise<StoredImage> {
  const path = `${userId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type || `image/${extension}`,
    upsert: false,
  });
  if (error) throw error;

  if (bucket === "portraits") {
    const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60);
    return { path, url: data?.signedUrl ?? "" };
  }
  return { path, url: publicUrl(bucket, path) ?? "" };
}

export function extensionOf(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]{2,5}$/.test(fromName)) return fromName;
  return file.type.split("/")[1] || "jpg";
}
