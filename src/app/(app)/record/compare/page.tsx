"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UpdateSheet } from "@/components/UpdateSheet";
import { WizardFooter } from "@/components/WizardFooter";
import { useToast } from "@/components/Toast";
import { tex } from "@/lib/design";
import { placeLine } from "@/lib/pattern-draft";
import { createClient } from "@/lib/supabase/client";
import { toCandidate, type SimilarCandidate } from "@/lib/similar";
import { useWizard } from "@/state/wizard";

export default function ComparePage() {
  const router = useRouter();
  const { flash } = useToast();
  const state = useWizard();
  const { compareTargetId, patternName, photoUrl, patch } = state;

  const [existing, setExisting] = useState<SimilarCandidate | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (!compareTargetId) return;
    let active = true;
    createClient()
      .from("patterns")
      .select("id, name, province, district, community, object_owner, photo_path, created_at")
      .eq("id", compareTargetId)
      .single()
      .then(({ data }) => {
        if (active && data) setExisting(toCandidate(data));
      });
    return () => {
      active = false;
    };
  }, [compareTargetId]);

  const column = (
    title: string,
    name: string,
    place: string,
    detail: string,
    background: string,
  ) => (
    <div>
      <div
        style={{
          textAlign: "center",
          fontSize: 11,
          color: "var(--ink-3)",
          paddingBottom: 7,
          borderBottom: "1px solid rgba(42,42,38,.12)",
        }}
      >
        {title}
      </div>
      <div style={{ height: 118, borderRadius: 4, marginTop: 10, background }} />
      <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--ink)", marginTop: 8 }}>{name}</div>
      <div style={{ fontSize: 10, color: "var(--ink-3)", lineHeight: 1.6, marginTop: 3 }}>
        {place}
        <br />
        {detail}
      </div>
    </div>
  );

  return (
    <>
      <div className="fade-in pad">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {column(
            "รายการเดิม",
            existing?.name ?? "กำลังโหลด…",
            existing?.place ?? "",
            existing?.owner ?? "",
            existing?.photoUrl
              ? `url(${existing.photoUrl}) center/cover`
              : tex("#8B7F6A", "#7E7260", 150),
          )}
          {column(
            "รายการใหม่",
            patternName || "ลายที่กำลังบันทึก",
            placeLine(state),
            state.objectName || "",
            photoUrl ? `url(${photoUrl}) center/cover` : tex("#9A8B6E", "#8D7F63", 30),
          )}
        </div>

        <div
          style={{
            marginTop: 16,
            background: "var(--panel)",
            borderRadius: 6,
            padding: 12,
            textAlign: "center",
            fontSize: 11,
            color: "var(--ink-2)",
            lineHeight: 1.7,
          }}
        >
          เทียบลายเส้น จำนวนกลีบ และการจัดวางก้าน หากเป็นลายคนละผืนให้บันทึกเป็นรายการใหม่
          หากเป็นลายเดียวกันให้ส่งข้อมูลไปอัพเดทรายการเดิม
        </div>
      </div>

      <WizardFooter
        nextLabel="บันทึกเป็นรายการใหม่"
        onNext={() => {
          patch({ saveMode: "new", updateTargetId: null });
          router.push("/record/ai");
        }}
        extra={
          existing ? (
            <button
              type="button"
              className="btn-update"
              onClick={() => {
                patch({ updateTargetId: existing.id, updateTargetName: existing.name });
                setSheetOpen(true);
              }}
            >
              อัพเดทข้อมูล
            </button>
          ) : null
        }
      />

      {sheetOpen && existing ? (
        <UpdateSheet
          candidates={[existing]}
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
