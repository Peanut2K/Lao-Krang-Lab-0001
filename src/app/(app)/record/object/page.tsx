"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { WizardFooter } from "@/components/WizardFooter";
import { objectTypeOf } from "@/lib/pattern-draft";
import { useWizard } from "@/state/wizard";

export default function ObjectPage() {
  const router = useRouter();
  const state = useWizard();
  const { objectName, objectOwner, objectOwnerUnknown, occasion, patch } = state;

  return (
    <>
      <div className="fade-in pad">
        <div className="step-title">ข้อมูลวัตถุที่ปรากฎลวดลาย</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
          <label className="field">
            <span className="field-label">ชื่อเรียกวัตถุ</span>
            <input
              className="input"
              value={objectName}
              onChange={(event) => patch({ objectName: event.target.value })}
              placeholder="เช่น ลายปูนปั้นดอกไม้ในแจกัน"
            />
          </label>

          <div className="field">
            <span className="field-label">ประเภทวัตถุ</span>
            <span className="locked">
              <span>{objectTypeOf(state)}</span>
              <span style={{ fontSize: 11, color: "var(--ink-3)" }}>🔒</span>
            </span>
          </div>

          <div className="field">
            <label className="field">
              <span className="field-label">ผู้ครอบครอง / ผู้ดูแลวัตถุ</span>
              <input
                className="input"
                value={objectOwnerUnknown ? "ไม่ทราบข้อมูลที่แน่ชัด" : objectOwner}
                disabled={objectOwnerUnknown}
                onChange={(event) => patch({ objectOwner: event.target.value })}
                placeholder="เช่น วัดบ้านแม่สาใหม่"
              />
            </label>
            <button
              type="button"
              onClick={() => patch({ objectOwnerUnknown: !objectOwnerUnknown })}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 2,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <span className="check-box" data-on={objectOwnerUnknown}>
                {objectOwnerUnknown ? "✓" : ""}
              </span>
              <span style={{ fontSize: 10.5, color: "var(--ink)" }}>ไม่ทราบข้อมูลที่แน่ชัด</span>
            </button>
          </div>

          <label className="field">
            <span className="field-label">ใช้ในโอกาสใด (ไม่บังคับตอบ)</span>
            <input
              className="input"
              value={occasion}
              onChange={(event) => patch({ occasion: event.target.value })}
              placeholder="เช่น ตกแต่งอาคาร งานบุญ"
            />
          </label>
        </div>

        <div className="note" style={{ marginTop: 10 }}>
          ประเภทวัตถุถูกล็อกจากขั้นเลือกแหล่งที่มา หากต้องการแก้ ให้{" "}
          <Link href="/record/source-type">ย้อนกลับไปหน้าเลือกประเภทแหล่งที่มา</Link>
        </div>
      </div>

      <WizardFooter onNext={() => router.push("/record/pattern")} />
    </>
  );
}
