"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitPatternAction } from "@/app/actions/patterns";
import { useToast } from "@/components/Toast";
import { downloadFrom } from "@/lib/download";
import { LINE_ART_PLACEHOLDER } from "@/lib/media";
import { draftPayload, useWizard } from "@/state/wizard";

export default function AiResultPage() {
  const router = useRouter();
  const { flash } = useToast();
  const state = useWizard();
  const { photoUrl, lineArtUrl, aiSaved, patternName, patch } = state;
  const [saving, setSaving] = useState(false);

  async function saveLineArt() {
    setSaving(true);
    try {
      const { id } = await submitPatternAction(draftPayload(useWizard.getState()));
      patch({ draftId: id, aiSaved: true });
      flash("บันทึกแล้ว · รายการเข้าสถานะรอตรวจสอบ");
    } catch (error) {
      flash(error instanceof Error ? error.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  async function download() {
    if (!lineArtUrl) return;
    try {
      await downloadFrom(lineArtUrl, `${patternName || "lai-thai"}-line-art.png`);
    } catch {
      flash("ดาวน์โหลดลายเส้นไม่สำเร็จ");
    }
  }

  return (
    <div className="fade-in pad" style={{ textAlign: "center" }}>
      <div className="field-label">ภาพต้นฉบับ</div>
      <div
        style={{
          height: 150,
          borderRadius: 5,
          marginTop: 8,
          background: photoUrl
            ? `url(${photoUrl}) center/cover`
            : "repeating-linear-gradient(150deg,#8B7F6A 0 13px,#7E7260 13px 26px)",
        }}
      />

      <div className="field-label" style={{ marginTop: 14 }}>
        ลายเส้นที่แกะได้
      </div>
      <div
        style={{
          height: 180,
          borderRadius: 5,
          marginTop: 8,
          background: lineArtUrl ? `url(${lineArtUrl}) center/contain no-repeat #fff` : LINE_ART_PLACEHOLDER,
          border: "1px solid rgba(42,42,38,.12)",
          display: "grid",
          placeItems: "center",
        }}
      >
        {!lineArtUrl ? <span className="placeholder-note">[ ยังไม่มีลายเส้นจาก AI ]</span> : null}
      </div>

      {!aiSaved ? (
        <>
          <div className="callout" style={{ marginTop: 14, textAlign: "left" }}>
            บันทึกก่อนเพื่อเก็บลายเส้นและข้อมูลไว้ในคลัง รายการจะเข้าสถานะ <b>รอตรวจสอบ</b> (ยังไม่เผยแพร่)
            แล้วจึงตกแต่งลวดลายต่อได้
          </div>
          <button
            type="button"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: 14, padding: 13 }}
            disabled={saving}
            onClick={saveLineArt}
          >
            {saving ? "กำลังบันทึก…" : "บันทึกลายเส้นนี้"}
          </button>
        </>
      ) : (
        <>
          <div
            style={{
              marginTop: 14,
              background: "rgba(47,81,54,.09)",
              border: "1px solid rgba(47,81,54,.25)",
              borderRadius: 6,
              padding: 11,
              fontSize: 10.5,
              color: "var(--green)",
              lineHeight: 1.7,
              textAlign: "left",
            }}
          >
            บันทึกแล้ว · สถานะ <b>รอตรวจสอบ</b> ยังไม่เผยแพร่สู่คลังสาธารณะ แต่ดาวน์โหลดลายเส้นไปใช้ได้เลย
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button type="button" className="btn btn-outline" style={{ flex: 1, fontSize: 12.5 }} onClick={download}>
              ดาวน์โหลดลายเส้น
            </button>
            <button
              type="button"
              className="btn btn-primary"
              style={{ flex: 1, fontSize: 12.5 }}
              onClick={() => router.push("/record/edit-line")}
            >
              ตกแต่งลวดลาย
            </button>
          </div>
        </>
      )}
    </div>
  );
}
