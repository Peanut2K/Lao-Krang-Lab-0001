"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveDraftAction } from "@/app/actions/patterns";
import { useToast } from "@/components/Toast";
import { draftPayload, useWizard } from "@/state/wizard";

export function WizardFooter({
  nextLabel = "ถัดไป",
  onNext,
  disabled,
  extra,
  busyLabel,
}: {
  nextLabel?: string;
  onNext: () => void | Promise<void>;
  disabled?: boolean;
  extra?: React.ReactNode;
  busyLabel?: string;
}) {
  const router = useRouter();
  const { flash } = useToast();
  const [saving, startSaving] = useTransition();
  const [advancing, setAdvancing] = useState(false);

  async function saveDraft() {
    const state = useWizard.getState();
    startSaving(async () => {
      try {
        const { id } = await saveDraftAction(draftPayload(state));
        state.patch({ draftId: id });
        flash("บันทึกฉบับร่างแล้ว · กลับมาแก้ต่อได้จากแท็บ Draft");
      } catch (error) {
        flash(error instanceof Error ? error.message : "บันทึกฉบับร่างไม่สำเร็จ");
      }
    });
  }

  async function advance() {
    setAdvancing(true);
    try {
      await onNext();
    } finally {
      setAdvancing(false);
    }
  }

  return (
    <div className="flow-footer">
      <div className="row">
        <button type="button" className="btn-back" onClick={() => router.back()}>
          ย้อนกลับ
        </button>
        {extra}
        <button
          type="button"
          className="btn-next"
          style={extra ? { marginLeft: 8, padding: "11px 16px" } : { marginLeft: "auto" }}
          disabled={disabled || advancing}
          onClick={advance}
        >
          {advancing && busyLabel ? busyLabel : nextLabel}
        </button>
      </div>
      <button type="button" className="btn btn-dashed btn-draft" disabled={saving} onClick={saveDraft}>
        {saving ? "กำลังบันทึกฉบับร่าง…" : "บันทึกฉบับร่าง"}
      </button>
    </div>
  );
}
