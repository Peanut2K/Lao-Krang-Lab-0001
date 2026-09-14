import { redirect } from "next/navigation";
import { TabHeader } from "@/components/Headers";
import { publicUrl } from "@/lib/media";
import { createClient, getUser } from "@/lib/supabase/server";
import { NotificationToggle } from "@/components/NotificationToggle";
import { SignOutButton } from "./SignOutButton";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const [supabase, user] = await Promise.all([createClient(), getUser()]);
  if (!user) redirect("/login");

  // `own` already returns every published+pending row, so the "recorded" and
  // "pending" counts come from it rather than two more round trips.
  const [{ data: profile }, { count: saved }, { data: own }] = await Promise.all([
    supabase.from("profiles").select("display_name, role_title, avatar_path, is_admin").eq("id", user.id).single(),
    supabase.from("saved_patterns").select("pattern_id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase
      .from("patterns")
      .select("object_type, photo_path, created_at, status")
      .eq("owner_id", user.id)
      .in("status", ["published", "pending"])
      .order("created_at", { ascending: false }),
  ]);

  const patterns = own ?? [];
  const recorded = patterns.length;
  const pending = patterns.filter((row) => row.status === "pending").length;
  const byType = new Map<string, number>();
  patterns.forEach((row) => {
    const key = row.object_type ?? "ไม่ระบุประเภท";
    byType.set(key, (byType.get(key) ?? 0) + 1);
  });
  const [topType, topCount] = [...byType.entries()].sort((a, b) => b[1] - a[1])[0] ?? ["สถาปัตยกรรม", 0];
  const share = patterns.length ? Math.round((topCount / patterns.length) * 100) : 0;
  const banner = publicUrl("pattern-photos", patterns.find((row) => row.photo_path)?.photo_path ?? null);
  const avatar = publicUrl("pattern-photos", profile?.avatar_path ?? null);

  return (
    <>
      <TabHeader title="โปรไฟล์" isAdmin={profile?.is_admin} />
      <div className="fade-in" style={{ padding: "4px 16px 86px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <div style={{ flex: 1, paddingTop: 6 }}>
            <div style={{ fontSize: 12, color: "var(--ink-3)" }}>สวัสดี</div>
            <div style={{ fontSize: 17, fontWeight: 600, color: "var(--ink)", marginTop: 2 }}>
              {profile?.display_name ?? ""}
            </div>
            <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 4 }}>
              {profile?.role_title ?? "นักถ่ายภาพ / นักสืบลาย"}
            </div>
          </div>
          <div
            style={{
              width: 104,
              height: 126,
              flex: "none",
              borderRadius: 6,
              background: avatar
                ? `url(${avatar}) center/cover`
                : "repeating-linear-gradient(140deg,#DAD3C0 0 9px,#D0C8B3 9px 18px)",
              display: "grid",
              placeItems: "center",
              textAlign: "center",
            }}
          >
            {!avatar ? (
              <span style={{ fontFamily: "ui-monospace,Menlo,monospace", fontSize: 9, color: "rgba(42,42,38,.5)", lineHeight: 1.5 }}>
                [ ภาพ
                <br />
                ผู้ใช้ ]
              </span>
            ) : null}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
          {[
            { value: recorded, label: "ลวดลายที่บันทึก" },
            { value: saved ?? 0, label: "ลายที่กดบันทึกไว้" },
          ].map((card) => (
            <div
              key={card.label}
              style={{
                border: "1px solid rgba(42,42,38,.12)",
                borderRadius: 8,
                padding: "12px 14px",
                background: "var(--surface)",
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 600, color: "var(--ink)" }}>{card.value}</div>
              <div style={{ fontSize: 10.5, color: "var(--ink-3)", marginTop: 2 }}>{card.label}</div>
            </div>
          ))}
        </div>

        <div
          style={{
            height: 78,
            borderRadius: 6,
            marginTop: 10,
            background: banner
              ? `url(${banner}) center/cover`
              : "repeating-linear-gradient(120deg,#DAD3C0 0 12px,#D0C8B3 12px 24px)",
            display: "grid",
            placeItems: "center",
          }}
        >
          {!banner ? <span className="placeholder-note">[ แบนเนอร์ลายล่าสุด ]</span> : null}
        </div>

        <div style={{ border: "1px solid rgba(42,42,38,.12)", borderRadius: 8, padding: 14, marginTop: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>ความคืบหน้าการบันทึก</div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--ink-3)", marginTop: 10 }}>
            <span>{topType}</span>
            <span>{topCount} รายการ</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: "rgba(47,81,54,.14)", marginTop: 6, overflow: "hidden" }}>
            <div style={{ width: `${share}%`, height: "100%", background: "var(--green)" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--ink-3)", marginTop: 10 }}>
            <span>รอตรวจสอบ</span>
            <span>{pending} รายการ</span>
          </div>
        </div>

        {profile?.is_admin ? <NotificationToggle /> : null}

        <SignOutButton />
      </div>
    </>
  );
}
