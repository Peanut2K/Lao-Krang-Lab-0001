"use client";

import { useRouter } from "next/navigation";
import { submitPatternAction } from "@/app/actions/patterns";
import { WizardFooter } from "@/components/WizardFooter";
import { useToast } from "@/components/Toast";
import { sizeLabel, thaiDateTime } from "@/lib/design";
import { LINE_ART_PLACEHOLDER } from "@/lib/media";
import { objectTypeOf, placeLine } from "@/lib/pattern-draft";
import { draftPayload, useWizard } from "@/state/wizard";

export default function ConfirmPage() {
  const router = useRouter();
  const { flash } = useToast();
  const state = useWizard();
  const {
    photoUrl,
    lineArtUrl,
    patternName,
    patternDescription,
    objectName,
    objectOwner,
    objectOwnerUnknown,
    sourceType,
    sourceTypeOther,
    informantName,
    informantIsSelf,
    informantType,
    informantTypeOther,
    exportFormat,
    exportBackground,
    exportSize,
    license,
    saveMode,
    updateTargetName,
    updateFields,
  } = state;

  const isUpdate = saveMode === "update";
  const objectType = objectTypeOf(state);
  const sourceLabel =
    sourceType === "อื่น ๆ" ? `อื่น ๆ · ${sourceTypeOther.trim() || "ยังไม่ระบุ"}` : sourceType;
  const informantLabel = `${informantIsSelf ? "ผู้บันทึกลวดลาย" : informantName || "—"} · ${
    informantType === "อื่น ๆ" ? `อื่น ๆ (${informantTypeOther || "ยังไม่ระบุ"})` : informantType
  }`;

  const rows: { key: string; value: string; href?: string }[] = [
    { key: "ประเภทแหล่งที่มา", value: sourceLabel, href: "/record/source-type" },
    { key: "พื้นที่ที่พบ", value: placeLine(state), href: "/record/place" },
    { key: "วัตถุ", value: `${objectName || "—"} · ${objectType}`, href: "/record/object" },
    {
      key: "ผู้ครอบครอง",
      value: objectOwnerUnknown ? "ไม่ทราบข้อมูลที่แน่ชัด" : objectOwner || "—",
      href: "/record/object",
    },
    { key: "ชื่อลาย", value: patternName || "—", href: "/record/pattern" },
    { key: "ลักษณะลวดลาย", value: patternDescription || "—", href: "/record/pattern" },
    { key: "ผู้ให้ข้อมูล", value: informantLabel, href: "/record/informant" },
    {
      key: "ไฟล์ที่บันทึก",
      value: `${exportFormat} · พื้นหลัง${exportBackground} · ขนาด${sizeLabel(exportFormat, exportSize)}`,
      href: "/record/save-file",
    },
    { key: "สิทธิ์การใช้งาน", value: license, href: "/record/license" },
    {
      key: "รูปแบบการบันทึก",
      value: isUpdate
        ? `อัพเดตลาย “${updateTargetName ?? ""}” · ส่ง ${updateFields.length} รายการ`
        : "บันทึกเป็นรายการใหม่",
      href: "/record/similar",
    },
    { key: "วันเวลาบันทึก", value: thaiDateTime(new Date().toISOString()) },
  ];

  async function submit() {
    try {
      const result = await submitPatternAction(draftPayload(useWizard.getState()));
      flash(
        result.mode === "update"
          ? `ส่งข้อมูลอัพเดตเข้าลาย “${updateTargetName ?? ""}” แล้ว · รอตรวจสอบ`
          : "บันทึกเป็นรายการใหม่แล้ว · สถานะรอตรวจสอบ",
      );
      router.push("/gallery");
    } catch (error) {
      flash(error instanceof Error ? error.message : "บันทึกไม่สำเร็จ");
    }
  }

  return (
    <>
      <div className="sheet-in pad">
        <div
          style={{
            background: isUpdate ? "rgba(47,81,54,.09)" : "var(--panel)",
            borderRadius: 7,
            padding: 12,
            fontSize: 11,
            color: "var(--ink-2)",
            lineHeight: 1.7,
          }}
        >
          {isUpdate
            ? `โหมดอัพเดทข้อมูล — ข้อมูลนี้จะถูกส่งไปเพิ่มเติมในลาย “${updateTargetName ?? ""}” ที่มีอยู่แล้ว ตรวจสอบความเรียบร้อยก่อนส่ง`
            : "ตรวจสอบความเรียบร้อยอีกครั้งก่อนบันทึกลงคลัง หากมีจุดใดต้องแก้ ให้แตะ “แก้ไข” ท้ายหัวข้อนั้น"}
        </div>

        <div style={{ display: "flex", gap: 11, marginTop: 14 }}>
          <span
            style={{
              width: 78,
              height: 78,
              flex: "none",
              borderRadius: 5,
              background: photoUrl
                ? `url(${photoUrl}) center/cover`
                : "repeating-linear-gradient(150deg,#8B7F6A 0 12px,#7E7260 12px 24px)",
            }}
          />
          <span
            style={{
              width: 78,
              height: 78,
              flex: "none",
              borderRadius: 5,
              background: lineArtUrl
                ? `url(${lineArtUrl}) center/contain no-repeat #fff`
                : LINE_ART_PLACEHOLDER,
              border: "1px solid rgba(42,42,38,.12)",
            }}
          />
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--ink)" }}>
              {patternName || "ลายที่กำลังบันทึก"}
            </span>
            <span style={{ display: "block", fontSize: 10.5, color: "var(--ink-3)", lineHeight: 1.7, marginTop: 3 }}>
              {sourceLabel}
              <br />
              สถานะหลังบันทึก · รอตรวจสอบ
            </span>
          </span>
        </div>

        <div style={{ marginTop: 14, border: "1px solid rgba(42,42,38,.12)", borderRadius: 8, padding: "2px 12px" }}>
          {rows.map((row) => (
            <div
              key={row.key}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "11px 0",
                borderBottom: "1px solid rgba(42,42,38,.07)",
              }}
            >
              <span style={{ flex: "none", width: 96, fontSize: 10.5, color: "var(--ink-3)", lineHeight: 1.5 }}>
                {row.key}
              </span>
              <span style={{ flex: 1, fontSize: 11.5, color: "var(--ink)", lineHeight: 1.6 }}>{row.value}</span>
              {row.href ? (
                <button type="button" className="btn-link" onClick={() => router.push(row.href!)}>
                  แก้ไข
                </button>
              ) : null}
            </div>
          ))}
        </div>

        <div className="note" style={{ marginTop: 12 }}>
          เมื่อบันทึกแล้ว รายการจะเข้าสถานะรอตรวจสอบโดยผู้ดูแลคลัง และยังไม่เผยแพร่สู่สาธารณะ
        </div>
      </div>

      <WizardFooter
        nextLabel={isUpdate ? "ยืนยันการอัพเดต" : "ยืนยันและบันทึก"}
        busyLabel="กำลังบันทึก…"
        onNext={submit}
      />
    </>
  );
}
