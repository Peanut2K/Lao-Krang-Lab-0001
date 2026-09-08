export type Bucket = "pattern-photos" | "line-art" | "portraits";

export function publicUrl(bucket: Bucket, path: string | null | undefined) {
  if (!path) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}

export const LINE_ART_PLACEHOLDER =
  "repeating-linear-gradient(150deg,#FFFFFF 0 12px,#F0EDE3 12px 24px)";
