import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Pattern } from "./supabase/types";
import { publicUrl } from "./media";
import { thaiDate } from "./design";
import { safeFilterValue } from "./pgrst";

export type SimilarCandidate = {
  id: string;
  name: string;
  place: string;
  owner: string;
  date: string;
  photoUrl: string | null;
};

const SELECT = "id, name, province, district, community, object_owner, photo_path, created_at";

export function toCandidate(
  row: Pick<
    Pattern,
    "id" | "name" | "province" | "district" | "community" | "object_owner" | "photo_path" | "created_at"
  >,
): SimilarCandidate {
  return {
    id: row.id,
    name: row.name ?? "ลายไม่ระบุชื่อ",
    place: [row.district && `อ.${row.district}`, row.province && `จ.${row.province}`]
      .filter(Boolean)
      .join(" "),
    owner: row.object_owner ?? row.community ?? "",
    date: thaiDate(row.created_at),
    photoUrl: publicUrl("pattern-photos", row.photo_path),
  };
}

/** Published patterns that share the object type or the province with the record in progress. */
export async function fetchSimilar(
  supabase: SupabaseClient<Database>,
  options: { objectType: string; province: string; excludeId?: string | null; limit?: number },
) {
  let query = supabase
    .from("patterns")
    .select(SELECT)
    .eq("status", "published")
    .or(
      `object_type.eq.${safeFilterValue(options.objectType)},province.eq.${safeFilterValue(options.province)}`,
    )
    .order("created_at", { ascending: false })
    .limit(options.limit ?? 5);

  if (options.excludeId) query = query.neq("id", options.excludeId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map(toCandidate);
}
