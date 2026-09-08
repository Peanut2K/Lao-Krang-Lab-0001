"use client";

import { useRouter } from "next/navigation";
import { WizardFooter } from "@/components/WizardFooter";
import { useToast } from "@/components/Toast";
import { SOURCE_TYPES, texAt } from "@/lib/design";
import { useWizard } from "@/state/wizard";

export default function SourceTypePage() {
  const router = useRouter();
  const { flash } = useToast();
  const { sourceType, sourceTypeOther, patch } = useWizard();
  const otherFilled = sourceTypeOther.trim().length > 0;
  const isOther = sourceType === "อื่น ๆ";

  return (
    <>
      <div className="fade-in pad">
        <div className="step-title" style={{ marginBottom: 14 }}>
          ประเภทแหล่งที่มาของลวดลาย
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
          {SOURCE_TYPES.map((label, index) => {
            const on = sourceType === label;
            return (
              <button
                key={label}
                type="button"
                onClick={() => patch({ sourceType: label })}
                style={{
                  padding: "14px 6px 10px",
                  borderRadius: 8,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 9,
                  border: `1px solid ${on ? "var(--green)" : "rgba(42,42,38,.14)"}`,
                  background: on ? "rgba(47,81,54,.07)" : "var(--surface)",
                }}
              >
                <span
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: index % 3 === 2 ? "50%" : 6,
                    display: "block",
                    background: index === 8 ? "rgba(42,42,38,.12)" : texAt(index, 25),
                  }}
                />
                <span style={{ fontSize: 9.5, lineHeight: 1.35, color: "var(--ink)", textAlign: "center" }}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        {isOther ? (
          <label className="field" style={{ marginTop: 16 }}>
            <span className="field-label">ระบุประเภทแหล่งที่มา (บังคับ)</span>
            <input
              className={`input${otherFilled ? "" : " invalid"}`}
              value={sourceTypeOther}
              onChange={(event) => patch({ sourceTypeOther: event.target.value })}
              placeholder="เช่น ยานพาหนะ ป้ายชื่อวัด งานปั้นสมัยใหม่"
            />
            <span className="field-hint" style={{ color: otherFilled ? "var(--ink-3)" : "var(--err)" }}>
              {otherFilled ? "ระบุแล้ว · จะบันทึกเป็นประเภทวัตถุนี้" : "ต้องระบุก่อนไปขั้นถัดไป"}
            </span>
          </label>
        ) : null}
      </div>

      <WizardFooter
        onNext={() => {
          if (isOther && !otherFilled) {
            flash("กรุณาระบุประเภทแหล่งที่มาเพิ่มเติม");
            return;
          }
          router.push("/record/place");
        }}
      />
    </>
  );
}
