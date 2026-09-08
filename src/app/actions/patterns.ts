"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/supabase/server";
import { objectTypeOf, type PatternDraft } from "@/lib/pattern-draft";
import type { PatternStatus } from "@/lib/supabase/types";

function rowFrom(draft: PatternDraft, ownerId: string, status: PatternStatus) {
  const objectType = objectTypeOf(draft);
  return {
    owner_id: ownerId,
    status,
    name: draft.patternName.trim() || null,
    description: draft.patternDescription.trim() || null,
    meaning: draft.patternMeaning.trim() || null,
    source_type: draft.sourceType,
    source_type_other: draft.sourceType === "อื่น ๆ" ? draft.sourceTypeOther.trim() || null : null,
    object_name: draft.objectName.trim() || null,
    object_type: objectType,
    object_owner: draft.objectOwnerUnknown ? null : draft.objectOwner.trim() || null,
    object_owner_unknown: draft.objectOwnerUnknown,
    occasion: draft.occasion.trim() || null,
    province: draft.province || null,
    district: draft.district || null,
    community: draft.community || null,
    latitude: draft.latitude,
    longitude: draft.longitude,
    location_mode: draft.locationMode || null,
    informant_type: draft.informantType,
    informant_type_other:
      draft.informantType === "อื่น ๆ" ? draft.informantTypeOther.trim() || null : null,
    informant_name: draft.informantName.trim() || null,
    informant_is_self: draft.informantIsSelf,
    informant_portrait_path: draft.portraitPath,
    photo_path: draft.photoPath,
    crop: draft.crop,
    line_art_path: draft.lineArtPath,
    line_weight: draft.lineWeight,
    line_style: draft.lineStyle,
    ink_color: draft.inkColor,
    export_format: draft.exportFormat,
    export_background: draft.exportBackground,
    export_size: draft.exportSize,
    license: draft.license,
    tags: [draft.province, draft.district, objectType].filter(Boolean) as string[],
  };
}

/** Upsert the in-progress record as a draft ("บันทึกฉบับร่าง"). */
export async function saveDraftAction(draft: PatternDraft) {
  const { supabase, user } = await requireUser();
  const row = rowFrom(draft, user.id, "draft");

  if (draft.draftId) {
    const { error } = await supabase.from("patterns").update(row).eq("id", draft.draftId);
    if (error) throw new Error(error.message);
    revalidatePath("/gallery");
    return { id: draft.draftId };
  }

  const { data, error } = await supabase.from("patterns").insert(row).select("id").single();
  if (error) throw new Error(error.message);
  revalidatePath("/gallery");
  return { id: data.id };
}

/**
 * Final save. A new record lands in "รอตรวจสอบ"; an update is filed against the
 * existing pattern and also waits for review before it is merged.
 */
export async function submitPatternAction(draft: PatternDraft) {
  const { supabase, user } = await requireUser();

  if (draft.saveMode === "update") {
    if (!draft.updateTargetId) throw new Error("ยังไม่ได้เลือกลายที่ต้องการอัพเดท");
    const { error } = await supabase.from("pattern_updates").insert({
      target_pattern_id: draft.updateTargetId,
      submitted_by: user.id,
      fields: draft.updateFields,
      payload: rowFrom(draft, user.id, "pending") as unknown as Record<string, unknown>,
    });
    if (error) throw new Error(error.message);

    if (draft.draftId) await supabase.from("patterns").delete().eq("id", draft.draftId);

    revalidatePath("/gallery");
    revalidatePath("/profile");
    return { mode: "update" as const, id: draft.updateTargetId };
  }

  const row = rowFrom(draft, user.id, "pending");

  if (draft.draftId) {
    const { error } = await supabase.from("patterns").update(row).eq("id", draft.draftId);
    if (error) throw new Error(error.message);
    revalidatePath("/gallery");
    revalidatePath("/profile");
    return { mode: "new" as const, id: draft.draftId };
  }

  const { data, error } = await supabase.from("patterns").insert(row).select("id").single();
  if (error) throw new Error(error.message);
  revalidatePath("/gallery");
  revalidatePath("/profile");
  return { mode: "new" as const, id: data.id };
}

/** ♥ on the pattern detail screen. */
export async function toggleSavedAction(patternId: string) {
  const { supabase, user } = await requireUser();

  const { data: existing } = await supabase
    .from("saved_patterns")
    .select("pattern_id")
    .eq("user_id", user.id)
    .eq("pattern_id", patternId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("saved_patterns")
      .delete()
      .eq("user_id", user.id)
      .eq("pattern_id", patternId);
    if (error) throw new Error(error.message);
    revalidatePath(`/pattern/${patternId}`);
    revalidatePath("/profile");
    return { saved: false };
  }

  const { error } = await supabase
    .from("saved_patterns")
    .insert({ user_id: user.id, pattern_id: patternId });
  if (error) throw new Error(error.message);
  revalidatePath(`/pattern/${patternId}`);
  revalidatePath("/profile");
  return { saved: true };
}

/** "บันทึกลงอัลบั้ม" — save into existing albums and/or a freshly created one. */
export async function saveToAlbumsAction(
  patternId: string,
  albumIds: string[],
  newAlbumName: string,
) {
  const { supabase, user } = await requireUser();
  const targets = [...albumIds];

  const fresh = newAlbumName.trim();
  if (fresh) {
    const { data, error } = await supabase
      .from("albums")
      .insert({ owner_id: user.id, name: fresh, kind: "saved", icon: "✦" })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    targets.push(data.id);
  }

  if (!targets.length) throw new Error("เลือกอัลบั้มหรือสร้างอัลบั้มใหม่ก่อน");

  const { error: itemError } = await supabase
    .from("album_items")
    .upsert(targets.map((albumId) => ({ album_id: albumId, pattern_id: patternId })));
  if (itemError) throw new Error(itemError.message);

  await supabase
    .from("saved_patterns")
    .upsert({ user_id: user.id, pattern_id: patternId }, { ignoreDuplicates: true });

  revalidatePath("/gallery");
  revalidatePath("/profile");
  revalidatePath(`/pattern/${patternId}`);
  return { albumCount: targets.length };
}
