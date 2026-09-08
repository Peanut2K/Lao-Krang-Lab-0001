"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadSheet } from "@/components/UploadSheet";
import { WizardFooter } from "@/components/WizardFooter";
import { useToast } from "@/components/Toast";
import { INFORMANT_TYPES } from "@/lib/design";
import { createClient } from "@/lib/supabase/client";
import { extensionOf, uploadImage } from "@/lib/upload";
import { useWizard } from "@/state/wizard";

export function InformantForm({ userId, userName }: { userId: string; userName: string }) {
  const router = useRouter();
  const { flash } = useToast();
  const {
    informantType,
    informantTypeOther,
    informantName,
    informantIsSelf,
    portraitPath,
    patch,
  } = useWizard();

  const [portraitUrl, setPortraitUrl] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!portraitPath) return;
    let active = true;
    createClient()
      .storage.from("portraits")
      .createSignedUrl(portraitPath, 60 * 60)
      .then(({ data }) => {
        if (active) setPortraitUrl(data?.signedUrl ?? null);
      });
    return () => {
      active = false;
    };
  }, [portraitPath]);

  const otherFilled = informantTypeOther.trim().length > 0;
  const isOther = informantType === "อื่น ๆ";
  const shownName = informantIsSelf ? userName : informantName;

  async function uploadPortrait(file: File) {
    setBusy(true);
    try {
      const stored = await uploadImage(createClient(), "portraits", userId, file, extensionOf(file));
      patch({ portraitPath: stored.path });
      setPortraitUrl(stored.url);
      setUploadOpen(false);
      flash("อัปโหลดภาพผู้ให้ข้อมูลแล้ว");
    } catch {
      flash("อัปโหลดภาพไม่สำเร็จ ลองอีกครั้ง");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="fade-in pad">
        <div className="step-title">ผู้ให้ข้อมูล</div>

        <div style={{ marginTop: 16 }}>
          <div className="field-label" style={{ marginBottom: 9 }}>
            ประเภทผู้ให้ข้อมูล
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {INFORMANT_TYPES.map((label) => (
              <button
                key={label}
                type="button"
                className="radio-row"
                data-on={informantType === label}
                onClick={() => patch({ informantType: label })}
              >
                <span className="radio-ring">
                  <span className="radio-dot" />
                </span>
                <span className="radio-label">{label}</span>
              </button>
            ))}
          </div>

          {isOther ? (
            <label className="field" style={{ marginTop: 12 }}>
              <span className="field-label">ระบุประเภทผู้ให้ข้อมูล (บังคับ)</span>
              <input
                className={`input${otherFilled ? "" : " invalid"}`}
                value={informantTypeOther}
                onChange={(event) => patch({ informantTypeOther: event.target.value })}
                placeholder="เช่น เจ้าหน้าที่พิพิธภัณฑ์ ผู้เก็บรวบรวมของเก่า"
              />
              <span className="field-hint" style={{ color: otherFilled ? "var(--ink-3)" : "var(--err)" }}>
                {otherFilled ? "ระบุแล้ว" : "ต้องระบุก่อนไปขั้นถัดไป"}
              </span>
            </label>
          ) : null}

          <label className="field" style={{ marginTop: 16 }}>
            <span className="field-label">ชื่อผู้ให้ข้อมูล</span>
            <input
              className="input"
              value={shownName}
              onChange={(event) => patch({ informantName: event.target.value, informantIsSelf: false })}
              placeholder="เช่น นางคำแก้ว อินตา"
            />
          </label>

          <button
            type="button"
            onClick={() => patch({ informantIsSelf: !informantIsSelf })}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 10,
              padding: "9px 12px",
              borderRadius: 7,
              cursor: "pointer",
              border: `1px solid ${informantIsSelf ? "var(--green)" : "rgba(42,42,38,.18)"}`,
              background: informantIsSelf ? "rgba(47,81,54,.08)" : "var(--surface)",
            }}
          >
            <span className="check-box" data-on={informantIsSelf}>
              {informantIsSelf ? "✓" : ""}
            </span>
            <span style={{ fontSize: 11, color: "var(--ink)" }}>ผู้บันทึกลวดลาย · {userName}</span>
          </button>

          <div className="field-label" style={{ marginTop: 18 }}>
            ภาพผู้ให้ข้อมูล (ไม่บังคับ)
          </div>
          <div style={{ display: "flex", gap: 11, alignItems: "center", marginTop: 8 }}>
            <span
              style={{
                width: 70,
                height: 86,
                flex: "none",
                borderRadius: 7,
                overflow: "hidden",
                background: portraitUrl ? `url(${portraitUrl}) center/cover` : "var(--chip)",
                display: "grid",
                placeItems: "center",
                border: "1px solid rgba(42,42,38,.14)",
              }}
            >
              {!portraitUrl ? (
                <span style={{ fontSize: 9, color: "rgba(42,42,38,.5)", textAlign: "center", lineHeight: 1.5 }}>
                  ยังไม่มี
                  <br />
                  ภาพ
                </span>
              ) : null}
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <button
                type="button"
                onClick={() => setUploadOpen(true)}
                style={{
                  width: "100%",
                  padding: 10,
                  borderRadius: 8,
                  cursor: "pointer",
                  border: "1px dashed rgba(42,42,38,.3)",
                  background: "transparent",
                  color: "var(--green)",
                  fontSize: 11.5,
                  fontWeight: 600,
                }}
              >
                ↑ อัปโหลดภาพผู้ให้ข้อมูล
              </button>
              {portraitPath ? (
                <button
                  type="button"
                  onClick={() => {
                    patch({ portraitPath: null });
                    setPortraitUrl(null);
                  }}
                  style={{
                    width: "100%",
                    marginTop: 7,
                    border: "none",
                    background: "transparent",
                    fontSize: 10.5,
                    color: "var(--ink-3)",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  ลบภาพนี้
                </button>
              ) : null}
              <span className="note" style={{ display: "block", marginTop: 7 }}>
                ขออนุญาตเจ้าตัวก่อนถ่ายและอัปโหลดทุกครั้ง ภาพจะแสดงในหน้ารายละเอียดลวดลาย
              </span>
            </span>
          </div>
        </div>
      </div>

      <WizardFooter
        onNext={() => {
          if (isOther && !otherFilled) {
            flash("กรุณาระบุประเภทผู้ให้ข้อมูลเพิ่มเติม");
            return;
          }
          router.push("/record/similar");
        }}
      />

      {uploadOpen ? (
        <UploadSheet
          title="อัปโหลดภาพผู้ให้ข้อมูล"
          description="เลือกภาพถ่ายของผู้ให้ข้อมูล ควรเห็นใบหน้าชัดเจน และต้องได้รับอนุญาตจากเจ้าตัวก่อน"
          recent={[]}
          busy={busy}
          onClose={() => setUploadOpen(false)}
          onPickExisting={() => {}}
          onPickFile={uploadPortrait}
        />
      ) : null}
    </>
  );
}
