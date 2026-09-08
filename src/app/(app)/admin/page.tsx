import Link from "next/link";
import { redirect } from "next/navigation";
import { TabHeader } from "@/components/Headers";
import { thaiDateTime } from "@/lib/design";
import { publicUrl } from "@/lib/media";
import { createClient, getUser, isAdmin } from "@/lib/supabase/server";
import { ReviewList, type ReviewItem } from "./ReviewList";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [supabase, user] = await Promise.all([createClient(), getUser()]);
  if (!user) redirect("/login");
  if (!(await isAdmin())) redirect("/capture");

  // The RLS policy added in 0003 lets a reviewer read every pattern, so this
  // returns other people's pending records too.
  const { data } = await supabase
    .from("patterns")
    .select(
      "id, name, description, province, district, community, object_name, object_type, source_type, photo_path, line_art_path, license, owner_id, created_at",
    )
    .eq("status", "pending")
    .order("created_at");

  const rows = data ?? [];

  const ownerNames = new Map<string, string>();
  if (rows.length) {
    const { data: owners } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", [...new Set(rows.map((row) => row.owner_id))]);
    (owners ?? []).forEach((owner) => ownerNames.set(owner.id, owner.display_name));
  }

  const items: ReviewItem[] = rows.map((row) => ({
    id: row.id,
    name: row.name || "ยังไม่ตั้งชื่อลาย",
    description: row.description || "ยังไม่ได้กรอกลักษณะลวดลาย",
    place:
      [row.community, row.district && `อ.${row.district}`, row.province && `จ.${row.province}`]
        .filter(Boolean)
        .join(" ") || "ไม่ระบุพื้นที่",
    object: [row.object_name, row.object_type].filter(Boolean).join(" · ") || "ไม่ระบุวัตถุ",
    sourceType: row.source_type ?? "ไม่ระบุ",
    license: row.license ?? "ยังไม่ระบุสิทธิ์",
    owner: ownerNames.get(row.owner_id) ?? "ไม่ทราบผู้บันทึก",
    submittedAt: thaiDateTime(row.created_at),
    photoUrl: publicUrl("pattern-photos", row.photo_path),
    lineArtUrl: publicUrl("line-art", row.line_art_path),
  }));

  return (
    <>
      <TabHeader title="ตรวจสอบลวดลาย" />
      <div className="fade-in pad-flush" style={{ paddingBottom: 86 }}>
        <div className="callout" style={{ marginTop: 4 }}>
          ลายที่รอตรวจสอบจะยังไม่แสดงในหน้าสำรวจ · <b>เผยแพร่</b> เพื่อนำขึ้นคลังสาธารณะ หรือ{" "}
          <b>ส่งกลับแก้ไข</b> เพื่อคืนให้เจ้าของเป็นฉบับร่าง
        </div>

        {items.length === 0 ? (
          <div className="callout" style={{ marginTop: 12 }}>
            ไม่มีลายที่รอตรวจสอบ — คิวว่างแล้ว
          </div>
        ) : (
          <>
            <div style={{ fontSize: 11, color: "var(--ink-3)", margin: "14px 0 10px" }}>
              รอตรวจสอบ {items.length} รายการ · เรียงจากที่ส่งเข้ามาก่อน
            </div>
            <ReviewList items={items} />
          </>
        )}

        <div className="note" style={{ marginTop: 14 }}>
          เห็นหน้านี้เพราะบัญชีของคุณถูกตั้งเป็นผู้ดูแลคลัง ·{" "}
          <Link href="/explore">ไปดูคลังสาธารณะ</Link>
        </div>
      </div>
    </>
  );
}
