import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";
import type { Database } from "./types";
import { supabaseEnv } from "./env";

export async function createClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = supabaseEnv();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        try {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component; the proxy refreshes the session instead.
        }
      },
    },
  });
}

/**
 * The signed-in user. Deduped per request — a page and its nested components
 * share one auth round trip instead of one each.
 */
export const getUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/** The signed-in user's id, or null. */
export async function currentUserId() {
  return (await getUser())?.id ?? null;
}

export async function requireUser() {
  const [supabase, user] = await Promise.all([createClient(), getUser()]);
  if (!user) throw new Error("ต้องเข้าสู่ระบบก่อน");
  return { supabase, user };
}

/** The signed-in user's profile row, deduped per request. */
export const getProfile = cache(async () => {
  const user = await getUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, role_title, avatar_path, is_admin, created_at")
    .eq("id", user.id)
    .maybeSingle();
  return data;
});

/** True when the signed-in user is a reviewer. */
export async function isAdmin() {
  return Boolean((await getProfile())?.is_admin);
}

/** Like requireUser, but also refuses anyone who is not a reviewer. */
export async function requireAdmin() {
  const { supabase, user } = await requireUser();
  if (!(await isAdmin())) throw new Error("ต้องเป็นผู้ดูแลคลังจึงจะทำรายการนี้ได้");
  return { supabase, user };
}
