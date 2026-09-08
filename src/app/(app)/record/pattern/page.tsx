"use client";

import { useRouter } from "next/navigation";
import { WizardFooter } from "@/components/WizardFooter";
import { useToast } from "@/components/Toast";
import { useWizard } from "@/state/wizard";

export default function PatternInfoPage() {
  const router = useRouter();
  const { flash } = useToast();
  const { patternName, patternDescription, patternMeaning, patch } = useWizard();

  const length = patternDescription.trim().length;
  const longEnough = length >= 10;

  return (
    <>
      <div className="fade-in pad">
        <div className="step-title">ข้อมูลลวดลายที่ต้องการบันทึก</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
          <label className="field">
            <span className="field-label">ชื่อลาย</span>
            <input
              className="input"
              value={patternName}
              onChange={(event) => patch({ patternName: event.target.value })}
              placeholder="เช่น ลายดอกไม้ในแจกัน"
            />
          </label>

          <label className="field">
            <span className="field-label">ลักษณะลวดลาย (บังคับ)</span>
            <textarea
              className={`textarea${longEnough ? "" : " invalid"}`}
              rows={3}
              value={patternDescription}
              onChange={(event) => patch({ patternDescription: event.target.value })}
              placeholder="อธิบายจำนวนกลีบ ทิศทางเถา ช่องไฟ อย่างน้อย 10 ตัวอักษร"
            />
            <span className="field-hint" style={{ color: longEnough ? "var(--ink-3)" : "var(--err)" }}>
              {longEnough ? `${length} ตัวอักษร` : `ต้องมีอย่างน้อย 10 ตัวอักษร (ปัจจุบัน ${length})`}
            </span>
          </label>

          <label className="field">
            <span className="field-label">ความหมาย / ที่มา</span>
            <input
              className="input"
              value={patternMeaning}
              onChange={(event) => patch({ patternMeaning: event.target.value })}
              placeholder="เช่น สื่อถึงความอุดมสมบูรณ์"
            />
          </label>
        </div>
      </div>

      <WizardFooter
        onNext={() => {
          if (!longEnough) {
            flash("กรุณาเขียนลักษณะลวดลายอย่างน้อย 10 ตัวอักษร");
            return;
          }
          router.push("/record/informant");
        }}
      />
    </>
  );
}
