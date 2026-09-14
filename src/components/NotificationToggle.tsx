"use client";

import { useEffect, useState } from "react";
import {
  sendTestNotification,
  subscribeToReviewNotifications,
  unsubscribeFromReviewNotifications,
} from "@/app/actions/push";
import { useToast } from "./Toast";

/** VAPID keys travel as base64url; the push API wants raw bytes. */
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
}

function keysOf(subscription: PushSubscription) {
  const json = subscription.toJSON();
  const keys = json.keys ?? {};
  if (!keys.p256dh || !keys.auth) throw new Error("เบราว์เซอร์ไม่ได้ให้กุญแจสำหรับการแจ้งเตือน");
  return { endpoint: subscription.endpoint, p256dh: keys.p256dh, auth: keys.auth };
}

/**
 * Reviewer-only: turn on push for this browser and prove it works.
 *
 * A permission prompt with no visible result leaves people unsure whether it
 * took, so switching on sends a real notification immediately — the same shape
 * as the ones a submitted pattern will produce.
 */
export function NotificationToggle() {
  const { flash } = useToast();
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [busy, setBusy] = useState(false);
  // "unknown" until the service worker has been asked for an existing
  // subscription, so the buttons do not flicker from off to on on load.
  const [state, setState] = useState<"unknown" | "ready" | "unsupported">("unknown");

  useEffect(() => {
    let cancelled = false;

    async function look() {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        if (!cancelled) setState("unsupported");
        return;
      }
      try {
        const registration = await navigator.serviceWorker.register(
          new URL("../lib/service-worker.js", import.meta.url),
          { scope: "/", updateViaCache: "none" },
        );
        const existing = await registration.pushManager.getSubscription();
        if (cancelled) return;
        setSubscription(existing);
        setState("ready");
      } catch {
        if (!cancelled) setState("unsupported");
      }
    }

    void look();
    return () => {
      cancelled = true;
    };
  }, []);

  const supported = state !== "unsupported";
  const ready = state === "ready";

  async function enable() {
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        flash(
          permission === "denied"
            ? "เบราว์เซอร์ปิดการแจ้งเตือนไว้ — เปิดได้ที่การตั้งค่าเว็บไซต์"
            : "ยังไม่ได้อนุญาตการแจ้งเตือน",
        );
        return;
      }

      const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!key) throw new Error("ยังไม่ได้ตั้งค่า VAPID key สำหรับการแจ้งเตือน");

      const registration = await navigator.serviceWorker.ready;
      const created = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key),
      });

      await subscribeToReviewNotifications(keysOf(created));
      setSubscription(created);
      await sendTestNotification();
      flash("เปิดการแจ้งเตือนแล้ว · ส่งการแจ้งเตือนทดสอบไปที่เครื่องนี้");
    } catch (error) {
      flash(error instanceof Error ? error.message : "เปิดการแจ้งเตือนไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    if (!subscription) return;
    setBusy(true);
    try {
      const { endpoint } = subscription;
      await subscription.unsubscribe();
      await unsubscribeFromReviewNotifications(endpoint);
      setSubscription(null);
      flash("ปิดการแจ้งเตือนบนเครื่องนี้แล้ว");
    } catch (error) {
      flash(error instanceof Error ? error.message : "ปิดการแจ้งเตือนไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  async function test() {
    setBusy(true);
    try {
      await sendTestNotification();
      flash("ส่งการแจ้งเตือนทดสอบแล้ว");
    } catch (error) {
      flash(error instanceof Error ? error.message : "ส่งการแจ้งเตือนไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  const on = Boolean(subscription);

  return (
    <div
      style={{
        border: "1px solid var(--line-2)",
        borderRadius: 8,
        padding: 14,
        marginTop: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>
            แจ้งเตือนลายที่รอตรวจสอบ
          </div>
          <div style={{ fontSize: 10.5, color: "var(--ink-3)", lineHeight: 1.7, marginTop: 4 }}>
            {!supported
              ? "เบราว์เซอร์นี้ไม่รองรับการแจ้งเตือน — บน iPhone ต้องเพิ่มแอปลงหน้าจอโฮมก่อน"
              : on
                ? "เปิดอยู่บนเครื่องนี้ · เมื่อมีคนส่งลวดลายเข้ามา จะแจ้งเตือนทันที"
                : "เปิดเพื่อรับแจ้งเตือนบนเครื่องนี้เมื่อมีคนส่งลวดลายเข้ามาให้ตรวจสอบ"}
          </div>
        </div>
        {ready && supported ? (
          <span
            className="tag"
            style={{
              flex: "none",
              background: on ? "rgba(47,81,54,.12)" : "var(--chip)",
              color: on ? "var(--green)" : "var(--ink-3)",
            }}
          >
            {on ? "เปิดอยู่" : "ปิดอยู่"}
          </span>
        ) : null}
      </div>

      {supported ? (
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button
            type="button"
            className={on ? "btn btn-outline" : "btn btn-primary"}
            style={{ flex: 1, fontSize: 12, padding: 10 }}
            disabled={busy || !ready}
            onClick={() => void (on ? disable() : enable())}
          >
            {busy ? "กำลังดำเนินการ…" : on ? "ปิดการแจ้งเตือน" : "เปิดการแจ้งเตือน"}
          </button>
          {on ? (
            <button
              type="button"
              className="btn btn-outline"
              style={{ flex: "none", fontSize: 12, padding: "10px 14px" }}
              disabled={busy}
              onClick={() => void test()}
            >
              ทดสอบ
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
