import Link from "next/link";
import { redirect } from "next/navigation";
import { TabHeader } from "@/components/Headers";
import { iconForObjectType, texAt, thaiDate } from "@/lib/design";
import { publicUrl } from "@/lib/media";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const ALBUM_HEIGHTS = [170, 130, 124, 166, 142, 118];
const MINE = "mine";

type Search = { tab?: string; album?: string };

export default async function GalleryPage({ searchParams }: { searchParams: Promise<Search> }) {
  const { tab = "all", album } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ count: patternCount }, { count: pendingCount }, { count: draftCount }] = await Promise.all([
    supabase
      .from("patterns")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", user.id)
      .in("status", ["published", "pending"]),
    supabase
      .from("patterns")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", user.id)
      .eq("status", "pending"),
    supabase
      .from("patterns")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", user.id)
      .eq("status", "draft"),
  ]);

  const tabs = [
    { key: "all", label: "ทั้งหมด" },
    { key: "patterns", label: `ลาย (${patternCount ?? 0})` },
    { key: "pending", label: `รอตรวจสอบ (${pendingCount ?? 0})` },
    { key: "draft", label: `Draft (${draftCount ?? 0})` },
  ];

  const isAlbumTab = tab === "all" || tab === "patterns";

  return (
    <>
      <TabHeader title="คลังของฉัน" />
      <div className="fade-in pad-flush" style={{ paddingBottom: 86 }}>
        <div className="tabs">
          {tabs.map((entry) => (
            <Link key={entry.key} href={`/gallery?tab=${entry.key}`} style={{ textDecoration: "none" }}>
              <button type="button" className="tab-btn" data-on={tab === entry.key}>
                {entry.label}
              </button>
            </Link>
          ))}
        </div>

        {isAlbumTab && !album ? <AlbumGrid userId={user.id} tab={tab} /> : null}
        {isAlbumTab && album ? <AlbumTiles userId={user.id} albumId={album} tab={tab} /> : null}
        {!isAlbumTab ? <StatusList userId={user.id} status={tab === "draft" ? "draft" : "pending"} /> : null}
      </div>
    </>
  );
}

async function AlbumGrid({ userId, tab }: { userId: string; tab: string }) {
  const supabase = await createClient();

  const [{ data: albums }, { count: ownCount }, { data: ownCover }] = await Promise.all([
    supabase
      .from("albums")
      .select("id, name, kind, icon, album_items(pattern_id, patterns(photo_path))")
      .eq("owner_id", userId)
      .order("created_at"),
    supabase
      .from("patterns")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", userId)
      .in("status", ["published", "pending"]),
    supabase
      .from("patterns")
      .select("photo_path")
      .eq("owner_id", userId)
      .in("status", ["published", "pending"])
      .not("photo_path", "is", null)
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  type AlbumRow = {
    id: string;
    name: string;
    kind: string;
    icon: string;
    album_items: { pattern_id: string; patterns: { photo_path: string | null } | null }[];
  };

  const cards = [
    {
      id: MINE,
      name: "ลายที่ฉันบันทึกเอง",
      kind: "ฉันอัพโหลด",
      icon: "⌂",
      count: ownCount ?? 0,
      cover: publicUrl("pattern-photos", ownCover?.[0]?.photo_path ?? null),
    },
    ...((albums ?? []) as AlbumRow[]).map((row) => ({
      id: row.id,
      name: row.name,
      kind: row.kind === "uploaded" ? "ฉันอัพโหลด" : "บันทึกจากสำรวจ",
      icon: row.icon,
      count: row.album_items?.length ?? 0,
      cover: publicUrl(
        "pattern-photos",
        row.album_items?.find((item) => item.patterns?.photo_path)?.patterns?.photo_path ?? null,
      ),
    })),
  ];

  return (
    <>
      <div style={{ fontSize: 11, color: "var(--ink-3)", margin: "14px 0 10px" }}>อัลบั้มของฉัน</div>
      <div style={{ columns: 2, columnGap: 10 }}>
        {cards.map((card, index) => (
          <Link
            key={card.id}
            href={`/gallery?tab=${tab}&album=${card.id}`}
            style={{
              display: "block",
              textDecoration: "none",
              breakInside: "avoid",
              marginBottom: 12,
            }}
          >
            <span
              style={{
                display: "block",
                position: "relative",
                height: ALBUM_HEIGHTS[index % ALBUM_HEIGHTS.length],
                borderRadius: 10,
                overflow: "hidden",
                background: card.cover ? `url(${card.cover}) center/cover` : texAt(index, 25),
              }}
            >
              <span
                style={{
                  position: "absolute",
                  right: 6,
                  top: 6,
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "rgba(20,20,20,.55)",
                  color: "var(--surface)",
                  fontSize: 10,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                {card.icon}
              </span>
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  padding: "16px 9px 7px",
                  background: "linear-gradient(to top,rgba(16,16,14,.8),transparent)",
                  color: "var(--surface)",
                  fontSize: 11.5,
                  fontWeight: 600,
                }}
              >
                {card.name}
              </span>
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
              <span
                style={{
                  fontSize: 9.5,
                  padding: "2px 7px",
                  borderRadius: 999,
                  background: card.kind === "ฉันอัพโหลด" ? "rgba(47,81,54,.12)" : "var(--chip)",
                  color: card.kind === "ฉันอัพโหลด" ? "var(--green)" : "var(--ink-2)",
                }}
              >
                {card.kind}
              </span>
              <span style={{ fontSize: 9.5, color: "var(--ink-3)" }}>{card.count} ลาย</span>
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}

async function AlbumTiles({ userId, albumId, tab }: { userId: string; albumId: string; tab: string }) {
  const supabase = await createClient();

  let albumName = "ลายที่ฉันบันทึกเอง";
  let tiles: { id: string; photo: string | null; objectType: string | null; pending: boolean }[] = [];

  if (albumId === MINE) {
    const { data } = await supabase
      .from("patterns")
      .select("id, photo_path, object_type, status")
      .eq("owner_id", userId)
      .in("status", ["published", "pending"])
      .order("created_at", { ascending: false });
    tiles = (data ?? []).map((row) => ({
      id: row.id,
      photo: publicUrl("pattern-photos", row.photo_path),
      objectType: row.object_type,
      pending: row.status === "pending",
    }));
  } else {
    const [{ data: album }, { data: items }] = await Promise.all([
      supabase.from("albums").select("name").eq("id", albumId).maybeSingle(),
      supabase
        .from("album_items")
        .select("pattern_id, patterns(id, photo_path, object_type, status)")
        .eq("album_id", albumId)
        .order("added_at", { ascending: false }),
    ]);
    albumName = album?.name ?? "อัลบั้ม";
    type Item = {
      patterns: { id: string; photo_path: string | null; object_type: string | null; status: string } | null;
    };
    tiles = ((items ?? []) as Item[])
      .filter((item) => item.patterns)
      .map((item) => ({
        id: item.patterns!.id,
        photo: publicUrl("pattern-photos", item.patterns!.photo_path),
        objectType: item.patterns!.object_type,
        pending: item.patterns!.status === "pending",
      }));
  }

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "14px 0 10px" }}>
        <Link href={`/gallery?tab=${tab}`} style={{ fontSize: 11, textDecoration: "underline" }}>
          ‹ อัลบั้มทั้งหมด
        </Link>
        <span style={{ fontSize: 11, color: "var(--ink-3)", marginLeft: "auto" }}>{tiles.length} ลาย</span>
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 10 }}>{albumName}</div>

      {tiles.length === 0 ? (
        <div className="callout">ยังไม่มีลายในอัลบั้มนี้ — บันทึกลายจากหน้าสำรวจ หรือถ่ายลายใหม่ได้เลย</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
          {tiles.map((tile, index) => (
            <Link
              key={tile.id}
              href={`/pattern/${tile.id}`}
              style={{
                aspectRatio: "1",
                borderRadius: 3,
                position: "relative",
                display: "block",
                background: tile.photo ? `url(${tile.photo}) center/cover` : texAt(index, 30),
              }}
            >
              <span
                style={{
                  position: "absolute",
                  right: 4,
                  top: 4,
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "rgba(251,249,243,.9)",
                  color: "var(--ink)",
                  fontSize: 11,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                {iconForObjectType(tile.objectType)}
              </span>
              {tile.pending ? (
                <span
                  style={{
                    position: "absolute",
                    left: 4,
                    bottom: 4,
                    fontSize: 8.5,
                    padding: "2px 6px",
                    borderRadius: 999,
                    background: "rgba(20,20,20,.6)",
                    color: "var(--surface)",
                  }}
                >
                  รอตรวจสอบ
                </span>
              ) : null}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

async function StatusList({ userId, status }: { userId: string; status: "pending" | "draft" }) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("patterns")
    .select("id, name, description, province, district, community, object_type, photo_path, updated_at")
    .eq("owner_id", userId)
    .eq("status", status)
    .order("updated_at", { ascending: false });

  const rows = data ?? [];

  return (
    <>
      <div style={{ fontSize: 11, color: "var(--ink-3)", margin: "14px 0 10px" }}>
        {status === "pending" ? "รอผู้ดูแลคลังตรวจสอบ · ยังไม่เผยแพร่" : "ฉบับร่าง · กลับมาแก้ต่อได้"}
      </div>

      {rows.length === 0 ? (
        <div className="callout">
          {status === "pending" ? "ยังไม่มีรายการที่รอตรวจสอบ" : "ยังไม่มีฉบับร่างที่ค้างไว้"}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {rows.map((row, index) => (
            <Link
              key={row.id}
              href={`/pattern/${row.id}`}
              style={{ display: "flex", gap: 11, alignItems: "flex-start", textDecoration: "none" }}
            >
              <span
                style={{
                  width: 74,
                  height: 74,
                  flex: "none",
                  borderRadius: 5,
                  background: row.photo_path
                    ? `url(${publicUrl("pattern-photos", row.photo_path)}) center/cover`
                    : texAt(index, 40),
                }}
              />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--ink)" }}>
                  {row.name || "ยังไม่ตั้งชื่อลาย"}
                </span>
                <span style={{ display: "block", fontSize: 10.5, color: "var(--ink-3)", lineHeight: 1.6, marginTop: 3 }}>
                  {row.description || "ยังกรอกข้อมูลไม่ครบ"}
                </span>
                <span style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                  <span className="tag">
                    {[row.community, row.district && `อ.${row.district}`, row.province && `จ.${row.province}`]
                      .filter(Boolean)
                      .join(" ")}
                  </span>
                  <span className="tag">{row.object_type ?? "ไม่ระบุประเภท"}</span>
                </span>
              </span>
              <span
                style={{
                  flex: "none",
                  fontSize: 9.5,
                  padding: "3px 9px",
                  borderRadius: 999,
                  background: status === "draft" ? "var(--chip)" : "rgba(201,161,91,.2)",
                  color: status === "draft" ? "var(--ink-2)" : "#7A5F1E",
                }}
              >
                {status === "draft" ? "ฉบับร่าง" : "รอตรวจสอบ"}
              </span>
            </Link>
          ))}
        </div>
      )}
      <div className="note" style={{ marginTop: 12 }}>
        อัปเดตล่าสุด {thaiDate(rows[0]?.updated_at ?? null)}
      </div>
    </>
  );
}
