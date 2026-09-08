"use client";

import { Sheet, SheetActions } from "./Sheet";
import { texAt } from "@/lib/design";
import { UPDATE_FIELD_LABELS } from "@/lib/pattern-draft";
import type { SimilarCandidate } from "@/lib/similar";
import { useWizard } from "@/state/wizard";

export function UpdateSheet({
  candidates,
  onClose,
  onConfirm,
  onNeedTarget,
  onNeedFields,
}: {
  candidates: SimilarCandidate[];
  onClose: () => void;
  onConfirm: () => void;
  onNeedTarget: () => void;
  onNeedFields: () => void;
}) {
  const { updateTargetId, updateFields, patch, toggleUpdateField } = useWizard();

  return (
    <Sheet
      title="เลือกลายที่ต้องการอัพเดท"
      description="ข้อมูลและภาพของคุณจะถูกส่งไปเพิ่มเติมในลายที่เลือก โดยผ่านหน้าตรวจสอบก่อนบันทึก"
      onClose={onClose}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 14 }}>
        {candidates.map((candidate, index) => {
          const on = updateTargetId === candidate.id;
          return (
            <button
              key={candidate.id}
              type="button"
              onClick={() => patch({ updateTargetId: candidate.id, updateTargetName: candidate.name })}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
                padding: 10,
                borderRadius: 9,
                cursor: "pointer",
                textAlign: "left",
                border: `1.5px solid ${on ? "var(--green)" : "rgba(42,42,38,.14)"}`,
                background: on ? "rgba(47,81,54,.06)" : "var(--surface)",
              }}
            >
              <span className="radio-ring" style={{ borderColor: on ? "var(--green)" : undefined }}>
                <span className="radio-dot" style={{ background: on ? "var(--green)" : "transparent" }} />
              </span>
              <span
                style={{
                  width: 52,
                  height: 52,
                  flex: "none",
                  borderRadius: 5,
                  background: candidate.photoUrl
                    ? `url(${candidate.photoUrl}) center/cover`
                    : texAt(index, 150),
                }}
              />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>
                  {candidate.name}
                </span>
                <span style={{ display: "block", fontSize: 10, color: "var(--ink-3)", lineHeight: 1.6, marginTop: 2 }}>
                  {candidate.place} · บันทึกเมื่อ {candidate.date}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="field-label" style={{ marginTop: 16 }}>
        ข้อมูลที่จะส่งไปอัพเดท
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 9 }}>
        {UPDATE_FIELD_LABELS.map((label) => {
          const on = updateFields.includes(label);
          return (
            <button
              key={label}
              type="button"
              onClick={() => toggleUpdateField(label)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                padding: 0,
                textAlign: "left",
              }}
            >
              <span className="check-box" data-on={on}>
                {on ? "✓" : ""}
              </span>
              <span style={{ fontSize: 11.5, color: "var(--ink)" }}>{label}</span>
            </button>
          );
        })}
      </div>

      <SheetActions
        onCancel={onClose}
        onConfirm={() => {
          if (!updateTargetId) return onNeedTarget();
          if (!updateFields.length) return onNeedFields();
          onConfirm();
        }}
        confirmLabel="ไปหน้าตรวจสอบ"
        confirmDisabled={!updateTargetId || updateFields.length === 0}
      />
    </Sheet>
  );
}
