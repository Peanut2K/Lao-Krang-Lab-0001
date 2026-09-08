"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/server";

/** Publish a reviewed pattern so it appears in สำรวจ. */
export async function publishPatternAction(patternId: string) {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("patterns")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", patternId)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("ไม่พบลายนี้ในคิวรอตรวจสอบ — อาจมีคนตรวจไปแล้ว");

  revalidatePath("/admin");
  revalidatePath("/explore");
  revalidatePath("/gallery");
  revalidatePath(`/pattern/${patternId}`);
  return { id: patternId };
}

/** Send a pattern back to its owner as a draft, so they can fix and resubmit. */
export async function rejectPatternAction(patternId: string) {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("patterns")
    .update({ status: "draft", published_at: null })
    .eq("id", patternId)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("ไม่พบลายนี้ในคิวรอตรวจสอบ — อาจมีคนตรวจไปแล้ว");

  revalidatePath("/admin");
  revalidatePath("/gallery");
  revalidatePath(`/pattern/${patternId}`);
  return { id: patternId };
}
