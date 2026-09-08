import Link from "next/link";
import { Suspense } from "react";
import { TabHeader } from "@/components/Headers";
import { texAt } from "@/lib/design";
import { publicUrl } from "@/lib/media";
import { safeFilterValue } from "@/lib/pgrst";
import { createClient } from "@/lib/supabase/server";
import { ExploreControls } from "./ExploreControls";

export const dynamic = "force-dynamic";

type Search = { q?: string; tab?: string; province?: string; source?: string; object?: string };

export default async function ExplorePage({ searchParams }: { searchParams: Promise<Search> }) {
  const { q, tab = "all", province, source, object } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("patterns")
    .select("id, name, province, district, photo_path, saved_count, published_at, created_at")
    .eq("status", "published")
    .limit(40);

  if (province) query = query.eq("province", province);
  if (source) query = query.eq("source_type", source);
  if (object) query = query.eq("object_type", object);
  const search = q ? safeFilterValue(q) : "";
  if (search) {
    const like = `%${search}%`;
    query = query.or(
      `name.ilike.${like},description.ilike.${like},province.ilike.${like},district.ilike.${like},community.ilike.${like}`,
    );
  }

  query =
    tab === "popular"
      ? query.order("saved_count", { ascending: false })
      : tab === "recent"
        ? query.order("published_at", { ascending: false, nullsFirst: false })
        : query.order("created_at", { ascending: false });

  const { data } = await query;
  const results = data ?? [];

  return (
    <>
      <TabHeader title="สำรวจลวดลาย" />
      <div className="fade-in pad-flush" style={{ paddingBottom: 86 }}>
        <Suspense>
          <ExploreControls />
        </Suspense>

        {results.length === 0 ? (
          <div className="callout" style={{ marginTop: 14 }}>
            ยังไม่พบลวดลายที่ตรงกับเงื่อนไข — ลองล้างตัวกรอง หรือเป็นคนแรกที่บันทึกลายนี้เข้าคลัง
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
            {results.map((row, index) => (
              <Link key={row.id} href={`/pattern/${row.id}`} style={{ textDecoration: "none" }}>
                <span
                  style={{
                    display: "block",
                    height: 96,
                    borderRadius: 4,
                    background: row.photo_path
                      ? `url(${publicUrl("pattern-photos", row.photo_path)}) center/cover`
                      : texAt(index, 40),
                  }}
                />
                <span style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--ink)", marginTop: 7 }}>
                  {row.name || "ลายไม่ระบุชื่อ"}
                </span>
                <span style={{ display: "block", fontSize: 10.5, color: "var(--ink-3)", marginTop: 2, lineHeight: 1.5 }}>
                  {[row.district && `อ.${row.district}`, row.province && `จ.${row.province}`]
                    .filter(Boolean)
                    .join(" ")}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
