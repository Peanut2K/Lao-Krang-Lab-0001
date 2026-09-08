"use client";

import { useRouter } from "next/navigation";
import { WizardFooter } from "@/components/WizardFooter";
import { LICENSES, thaiDateTime } from "@/lib/design";
import { placeLine } from "@/lib/pattern-draft";
import { useWizard } from "@/state/wizard";

export default function LicensePage() {
  const router = useRouter();
  const state = useWizard();
  const { license, informantName, informantIsSelf, patch } = state;

  return (
    <>
      <div className="fade-in pad">
        <div className="field-label">การนำลวดลายไปใช้ · อ้างอิงสัญญาอนุญาตครีเอทีฟคอมมอนส์ (CC)</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 11 }}>
          {LICENSES.map((option) => {
            const on = license === option.code;
            return (
              <button
                key={option.code}
                type="button"
                onClick={() => patch({ license: option.code })}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  cursor: "pointer",
                  textAlign: "left",
                  padding: "11px 12px",
                  borderRadius: 8,
                  border: `1px solid ${on ? "var(--green)" : "rgba(42,42,38,.14)"}`,
                  background: on ? "rgba(47,81,54,.06)" : "var(--surface)",
                }}
              >
                <span
                  className="radio-ring"
                  style={{ marginTop: 3, borderColor: on ? "var(--green)" : undefined }}
                >
                  <span className="radio-dot" style={{ background: on ? "var(--green)" : "transparent" }} />
                </span>
                <span style={{ flex: "none", display: "flex", gap: 3, marginTop: 1 }}>
                  {option.marks.map((mark) => (
                    <span
                      key={mark}
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        border: "1.5px solid var(--ink)",
                        color: "var(--ink)",
                        fontSize: 11,
                        fontWeight: 600,
                        display: "grid",
                        placeItems: "center",
                        background: "var(--surface)",
                      }}
                    >
                      {mark}
                    </span>
                  ))}
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "var(--ink)" }}>
                    {option.code}
                  </span>
                  <span style={{ display: "block", fontSize: 10.5, color: "var(--ink-2)", lineHeight: 1.65, marginTop: 3 }}>
                    {option.desc}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="field-label" style={{ marginTop: 20 }}>
          แหล่งที่มา
        </div>
        <div style={{ fontSize: 11.5, color: "var(--ink)", lineHeight: 2, marginTop: 8 }}>
          {placeLine(state)}
          <br />
          <b>ผู้ให้ข้อมูล</b> {informantIsSelf ? "ผู้บันทึกลวดลาย" : informantName || "—"}
          <br />
          <b>วันที่บันทึก</b> {thaiDateTime(new Date().toISOString())}
        </div>
      </div>

      <WizardFooter nextLabel="บันทึกลงคลัง" onNext={() => router.push("/record/confirm")} />
    </>
  );
}
