"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UpdateSheet } from "@/components/UpdateSheet";
import { WizardFooter } from "@/components/WizardFooter";
import { useToast } from "@/components/Toast";
import { texAt } from "@/lib/design";
import { objectTypeOf } from "@/lib/pattern-draft";
import { createClient } from "@/lib/supabase/client";
import { fetchSimilar, type SimilarCandidate } from "@/lib/similar";
import { useWizard } from "@/state/wizard";

export default function SimilarPage() {
  const router = useRouter();
  const { flash } = useToast();
  const state = useWizard();
  const { draftId, province, patch } = state;

  const [candidates, setCandidates] = useState<SimilarCandidate[] | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const objectType = objectTypeOf(state);

  useEffect(() => {
    let active = true;
    fetchSimilar(createClient(), { objectType, province, excludeId: draftId, limit: 5 })
      .then((rows) => active && setCandidates(rows))
      .catch(() => active && setCandidates([]));
    return () => {
      active = false;
    };
  }, [objectType, province, draftId]);

  const found = candidates ?? [];

  return (
    <>
      <div className="fade-in pad">
        <div className="step-title">พบลวดลายที่มีลักษณะใกล้เคียง</div>
        <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 4 }}>
          {candidates === null
            ? "กำลังค้นหาลายที่ใกล้เคียง…"
            : found.length
              ? `ระบบพบลายที่ใกล้เคียงกัน ${found.length} รายการ`
              : "ยังไม่พบลายที่ใกล้เคียงในคลัง — บันทึกเป็นรายการใหม่ได้เลย"}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 14 }}>
          {found.map((candidate, index) => (
            <div key={candidate.id} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
              <span
                style={{
                  width: 74,
                  height: 74,
                  flex: "none",
                  borderRadius: 4,
                  background: candidate.photoUrl
                    ? `url(${candidate.photoUrl}) center/cover`
                    : texAt(index, 150),
                }}
              />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>
                  {candidate.name}
                </span>
                <span style={{ display: "block", fontSize: 10.5, color: "var(--ink-3)", lineHeight: 1.7, marginTop: 3 }}>
                  {candidate.place}
                  <br />
                  {candidate.owner}
                  <br />
                  บันทึกเมื่อ {candidate.date}
                </span>
                <span style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={() => router.push(`/pattern/${candidate.id}`)}
                    style={{
                      border: "1px solid rgba(42,42,38,.22)",
                      background: "transparent",
                      fontSize: 10.5,
                      color: "var(--ink)",
                      cursor: "pointer",
                      padding: "6px 11px",
                      borderRadius: 999,
                    }}
                  >
                    ดูข้อมูล
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      patch({ compareTargetId: candidate.id, updateTargetName: candidate.name });
                      router.push("/record/compare");
                    }}
                    style={{
                      border: "1px solid var(--green)",
                      background: "rgba(47,81,54,.08)",
                      fontSize: 10.5,
                      color: "var(--green)",
                      cursor: "pointer",
                      padding: "6px 11px",
                      borderRadius: 999,
                    }}
                  >
                    เปรียบเทียบลวดลาย
                  </button>
                </span>
              </span>
            </div>
          ))}
        </div>

        <div className="callout" style={{ marginTop: 14 }}>
          เลือก <b>บันทึกเป็นรายการใหม่</b> หากเป็นลายต่างผืน หรือ <b>อัพเดทข้อมูล</b>{" "}
          เพื่อส่งข้อมูลของคุณเข้าไปเพิ่มเติมในลายที่มีอยู่แล้ว ทั้งสองแบบจะผ่านหน้าตรวจสอบก่อนบันทึก
        </div>
      </div>

      <WizardFooter
        nextLabel="บันทึกเป็นรายการใหม่"
        onNext={() => {
          patch({ saveMode: "new", updateTargetId: null });
          router.push("/record/ai");
        }}
        extra={
          found.length ? (
            <button type="button" className="btn-update" onClick={() => setSheetOpen(true)}>
              อัพเดทข้อมูล
            </button>
          ) : null
        }
      />

      {sheetOpen ? (
        <UpdateSheet
          candidates={found}
          onClose={() => setSheetOpen(false)}
          onNeedTarget={() => flash("เลือกลายที่ต้องการอัพเดทก่อน")}
          onNeedFields={() => flash("เลือกข้อมูลที่จะส่งไปอัพเดทอย่างน้อยหนึ่งรายการ")}
          onConfirm={() => {
            setSheetOpen(false);
            patch({ saveMode: "update" });
            router.push("/record/confirm");
          }}
        />
      ) : null}
    </>
  );
}
