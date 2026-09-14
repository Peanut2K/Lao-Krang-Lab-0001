"use client";

import { BackIcon } from "@/components/Icons";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveToAlbumsAction, toggleSavedAction } from "@/app/actions/patterns";
import { AlbumSheet, type AlbumChoice } from "@/components/AlbumSheet";
import { ExportSheet } from "@/components/ExportSheet";
import { useToast } from "@/components/Toast";
import { tex, type ExportFormat, type ExportSize } from "@/lib/design";
import type { Pattern } from "@/lib/supabase/types";

const TABS = ["รายละเอียด", "ที่มา", "ลักษณะเด่น"] as const;

export function PatternDetail({
  pattern,
  ownerName,
  isSaved,
  photoUrl,
  lineArtUrl,
  portraitUrl,
  recordedOn,
  albums,
}: {
  pattern: Pattern;
  ownerName: string;
  isSaved: boolean;
  photoUrl: string | null;
  lineArtUrl: string | null;
  portraitUrl: string | null;
  recordedOn: string;
  albums: AlbumChoice[];
}) {
  const router = useRouter();
  const { flash } = useToast();

  const [tab, setTab] = useState<(typeof TABS)[number]>("รายละเอียด");
  const [saved, setSaved] = useState(isSaved);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const place = [pattern.community, pattern.district && `อ.${pattern.district}`, pattern.province && `จ.${pattern.province}`]
    .filter(Boolean)
    .join(" ");

  const sections: Record<(typeof TABS)[number], { key: string; value: string }[]> = {
    รายละเอียด: [
      { key: "ลักษณะลวดลาย", value: pattern.description ?? "—" },
      { key: "ความหมาย", value: pattern.meaning ?? "—" },
    ],
    ที่มา: [
      { key: "แหล่งที่พบ", value: place || "—" },
      { key: "บริบทการใช้งาน", value: pattern.usage_context ?? pattern.occasion ?? "—" },
      { key: "วัตถุที่ปรากฏลาย", value: [pattern.object_name, pattern.object_type].filter(Boolean).join(" · ") || "—" },
    ],
    ลักษณะเด่น: [{ key: "จุดสังเกต", value: pattern.feature ?? pattern.description ?? "—" }],
  };

  // tags already carries object_type, which is usually the source type too — the
  // Set keeps the chip row (and its React keys) from repeating the same word.
  const chips = [
    ...new Set([pattern.source_type, ...(pattern.tags ?? [])].filter(Boolean) as string[]),
  ];

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: pattern.name ?? "ลวดลายไทย", url });
      else {
        await navigator.clipboard.writeText(url);
        flash("คัดลอกลิงก์ลวดลายนี้แล้ว");
      }
    } catch {
      /* the person dismissed the share sheet */
    }
  }

  function openExport() {
    if (!lineArtUrl) {
      flash("ลายนี้ยังไม่มีลายเส้นให้ส่งออก");
      return;
    }
    setExportOpen(true);
  }

  async function toggleSaved() {
    setBusy(true);
    try {
      const result = await toggleSavedAction(pattern.id);
      setSaved(result.saved);
      flash(result.saved ? "บันทึกลายนี้ไว้แล้ว" : "นำออกจากลายที่บันทึกไว้");
    } catch {
      flash("บันทึกไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fade-in" style={{ paddingBottom: 140 }}>
      <div style={{ position: "relative", height: 240, background: photoUrl ? `url(${photoUrl}) center/cover` : tex("#3A3226", "#2E271D", 145) }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top,rgba(16,16,14,.92) 0%,rgba(16,16,14,.15) 55%,rgba(16,16,14,.4) 100%)",
          }}
        />
        <button
          type="button"
          aria-label="ย้อนกลับ"
          onClick={() => router.back()}
          style={{
            position: "absolute",
            left: 12,
            top: 12,
            width: 30,
            height: 30,
            borderRadius: "50%",
            border: "none",
            background: "rgba(251,249,243,.2)",
            color: "var(--surface)",
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
          }}
        >
          <BackIcon size={17} />
        </button>
        <div style={{ position: "absolute", right: 12, top: 12, display: "flex", gap: 8 }}>
          <button type="button" onClick={share} style={heroButton}>
            แชร์
          </button>
          <button type="button" onClick={openExport} style={heroButton}>
            ส่งออก
          </button>
        </div>
        <div style={{ position: "absolute", left: 16, bottom: 14, color: "var(--surface)" }}>
          <div style={{ fontSize: 19, fontWeight: 600 }}>{pattern.name ?? "ลายไม่ระบุชื่อ"}</div>
          <div style={{ fontSize: 11, color: "rgba(251,249,243,.72)", marginTop: 3 }}>
            {pattern.alt_name ?? [pattern.object_type, pattern.object_name].filter(Boolean).join(" / ")}
          </div>
        </div>
        {lineArtUrl ? (
          <span
            style={{
              position: "absolute",
              right: 14,
              bottom: 16,
              fontSize: 9,
              padding: "3px 8px",
              borderRadius: 999,
              background: "rgba(251,249,243,.22)",
              color: "var(--surface)",
            }}
          >
            AI Extracted
          </span>
        ) : null}
      </div>

      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", padding: "12px 16px 0" }}>
        {chips.map((chip) => (
          <span key={chip} className="chip">
            {chip}
          </span>
        ))}
      </div>

      <div style={{ display: "flex", gap: 18, padding: "14px 16px 8px", borderBottom: "1px solid rgba(42,42,38,.1)" }}>
        {TABS.map((entry) => (
          <button key={entry} type="button" className="tab-btn" data-on={tab === entry} onClick={() => setTab(entry)}>
            {entry}
          </button>
        ))}
      </div>

      <div style={{ padding: "14px 16px 0" }}>
        {sections[tab].map((section) => (
          <div key={section.key} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>{section.key}</div>
            <div style={{ fontSize: 11.5, color: "var(--ink-2)", lineHeight: 1.85, marginTop: 4, textWrap: "pretty" }}>
              {section.value}
            </div>
          </div>
        ))}

        <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "12px 0", borderTop: "1px solid rgba(42,42,38,.1)" }}>
          <span
            style={{
              width: 38,
              height: 38,
              flex: "none",
              borderRadius: "50%",
              background: portraitUrl
                ? `url(${portraitUrl}) center/cover`
                : "repeating-linear-gradient(140deg,#DAD3C0 0 7px,#D0C8B3 7px 14px)",
            }}
          />
          <span style={{ flex: 1 }}>
            <span style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "var(--ink)" }}>
              {pattern.informant_is_self ? ownerName : pattern.informant_name ?? "ไม่ระบุผู้ให้ข้อมูล"}
            </span>
            <span style={{ display: "block", fontSize: 10, color: "var(--ink-3)", marginTop: 2, lineHeight: 1.5 }}>
              {pattern.informant_type ?? "ผู้ให้ข้อมูล"} · ให้ข้อมูลเมื่อ {recordedOn}
            </span>
          </span>
        </div>

        <div className="note" style={{ paddingBottom: 8 }}>
          บันทึกโดย {ownerName} · สิทธิ์การใช้งาน {pattern.license ?? "ยังไม่ระบุ"}
        </div>
      </div>

      <div
        style={{
          position: "fixed",
          bottom: 74,
          width: "100%",
          maxWidth: 412,
          zIndex: 45,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 16px",
          background: "var(--surface)",
          borderTop: "1px solid rgba(42,42,38,.1)",
        }}
      >
        <button
          type="button"
          title="บันทึกลงอัลบั้ม"
          onClick={() => (saved ? void toggleSaved() : setSheetOpen(true))}
          disabled={busy}
          style={{
            width: 44,
            height: 44,
            flex: "none",
            borderRadius: "50%",
            cursor: "pointer",
            fontSize: 17,
            border: `1px solid ${saved ? "var(--green)" : "rgba(42,42,38,.25)"}`,
            background: saved ? "var(--green)" : "transparent",
            color: saved ? "var(--surface)" : "var(--green)",
          }}
        >
          {saved ? "♥" : "♡"}
        </button>
        <button
          type="button"
          className="btn btn-primary"
          style={{ flex: 1, padding: 13 }}
          onClick={() => {
            openExport();
          }}
        >
          นำลวดลายไปใช้
        </button>
      </div>

      {exportOpen && lineArtUrl ? (
        <ExportSheet
          url={lineArtUrl}
          name={pattern.name ?? ""}
          license={pattern.license}
          defaults={{
            weight: pattern.line_weight,
            style: pattern.line_style,
            ink: pattern.ink_color,
            format: pattern.export_format as ExportFormat,
            background: pattern.export_background,
            size: pattern.export_size as ExportSize,
          }}
          onClose={() => setExportOpen(false)}
        />
      ) : null}

      {sheetOpen ? (
        <AlbumSheet
          albums={albums}
          busy={busy}
          onClose={() => setSheetOpen(false)}
          onConfirm={async (albumIds, newAlbumName) => {
            setBusy(true);
            try {
              await saveToAlbumsAction(pattern.id, albumIds, newAlbumName);
              setSaved(true);
              setSheetOpen(false);
              flash("บันทึกลายนี้ไว้ในอัลบั้มแล้ว");
              router.refresh();
            } catch (error) {
              flash(error instanceof Error ? error.message : "บันทึกลงอัลบั้มไม่สำเร็จ");
            } finally {
              setBusy(false);
            }
          }}
        />
      ) : null}
    </div>
  );
}

const heroButton: React.CSSProperties = {
  padding: "6px 12px",
  borderRadius: 999,
  border: "none",
  background: "rgba(251,249,243,.2)",
  color: "var(--surface)",
  fontSize: 10.5,
  cursor: "pointer",
};
