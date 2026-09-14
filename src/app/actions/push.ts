"use server";

import webpush, { type PushSubscription as WebPushSubscription } from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/server";

export type StoredSubscription = { endpoint: string; p256dh: string; auth: string };

function configure() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return false;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:admin@example.com",
    publicKey,
    privateKey,
  );
  return true;
}

/**
 * Store this browser as a notification target for the signed-in reviewer.
 *
 * Only reviewers subscribe, because the only thing the app pushes is "a pattern
 * is waiting in the queue". The endpoint is the primary key, so re-subscribing
 * on the same browser refreshes the keys instead of piling up rows.
 */
export async function subscribeToReviewNotifications(subscription: StoredSubscription) {
  const { supabase, user } = await requireAdmin();

  const { error } = await supabase.from("push_subscriptions").upsert({
    endpoint: subscription.endpoint,
    user_id: user.id,
    p256dh: subscription.p256dh,
    auth: subscription.auth,
  });
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function unsubscribeFromReviewNotifications(endpoint: string) {
  const { supabase } = await requireAdmin();
  // RLS scopes the delete to the caller's own rows.
  const { error } = await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
  if (error) throw new Error(error.message);
  return { ok: true };
}

/** "แจ้งเตือนเปิดแล้ว" — proves to the reviewer that it works, on their device. */
export async function sendTestNotification() {
  const { supabase, user } = await requireAdmin();
  if (!configure()) throw new Error("ยังไม่ได้ตั้งค่า VAPID key สำหรับการแจ้งเตือน");

  const { data } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", user.id);

  const rows = data ?? [];
  if (!rows.length) throw new Error("ยังไม่ได้เปิดการแจ้งเตือนบนเครื่องนี้");

  const sent = await deliver(rows, {
    title: "เปิดการแจ้งเตือนแล้ว",
    body: "เมื่อมีคนส่งลวดลายเข้ามาให้ตรวจสอบ การแจ้งเตือนจะมาแบบนี้",
    url: "/admin",
    tag: "lai-thai-test",
  });
  if (!sent) throw new Error("ส่งการแจ้งเตือนไม่สำเร็จ");
  return { ok: true };
}

/**
 * Tell every reviewer that something is waiting.
 *
 * Called from the submit path, so a failure here must never fail the save —
 * the pattern is already filed and the queue page shows it regardless.
 * Reviewers are read with the service role because a contributor cannot (and
 * should not) read other people's subscription rows.
 */
export async function notifyReviewersOfSubmission(patternName: string) {
  if (!configure()) return { ok: false as const };

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    // No service-role key configured; notifications are simply off.
    return { ok: false as const };
  }

  const { data: reviewers } = await admin.from("profiles").select("id").eq("is_admin", true);
  const ids = (reviewers ?? []).map((row) => row.id);
  if (!ids.length) return { ok: false as const };

  const { data } = await admin
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .in("user_id", ids);

  const rows = data ?? [];
  if (!rows.length) return { ok: false as const };

  const sent = await deliver(rows, {
    title: "มีลวดลายรอตรวจสอบ",
    body: patternName ? `“${patternName}” ถูกส่งเข้ามาแล้ว` : "มีลวดลายใหม่ถูกส่งเข้ามาแล้ว",
    url: "/admin",
    tag: "lai-thai-review",
  });
  return { ok: sent };
}

type Payload = { title: string; body: string; url: string; tag: string };

/**
 * Push to every endpoint, dropping the ones the push service has retired.
 * Returns whether at least one delivery succeeded.
 */
async function deliver(rows: StoredSubscription[], payload: Payload) {
  const body = JSON.stringify({ ...payload, icon: "/icon-192.png" });

  const results = await Promise.allSettled(
    rows.map((row) =>
      webpush.sendNotification(
        {
          endpoint: row.endpoint,
          keys: { p256dh: row.p256dh, auth: row.auth },
        } satisfies WebPushSubscription,
        body,
      ),
    ),
  );

  // 404/410 means the browser threw the subscription away — stop storing it.
  const gone = results.flatMap((result, index) => {
    if (result.status !== "rejected") return [];
    const status = (result.reason as { statusCode?: number })?.statusCode;
    return status === 404 || status === 410 ? [rows[index].endpoint] : [];
  });

  if (gone.length) {
    try {
      await createAdminClient().from("push_subscriptions").delete().in("endpoint", gone);
    } catch {
      // Pruning is housekeeping; a failure here must not mask a sent notification.
    }
  }

  return results.some((result) => result.status === "fulfilled");
}
