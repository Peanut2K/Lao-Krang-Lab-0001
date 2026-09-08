"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { LineArtPreview } from "@/components/LineArtPreview";
import { WizardFooter } from "@/components/WizardFooter";
import { useToast } from "@/components/Toast";
import {
  EXPORT_BACKGROUNDS,
  EXPORT_FORMATS,
  EXPORT_SIZES,
  sizeLabel,
  type ExportFormat,
  type ExportSize,
} from "@/lib/design";
import { saveBlob } from "@/lib/download";
import { exportLineArt } from "@/lib/line-art";
import { useWizard } from "@/state/wizard";

export default function SaveFilePage() {
  const router = useRouter();
  const { flash } = useToast();
  const {
    lineArtUrl,
    lineWeight,
    lineStyle,
    inkColor,
    exportFormat,
    exportBackground,
    exportSize,
    patternName,
    patch,
  } = useWizard();

  const options = useMemo(
    () => ({
      weight: lineWeight,
      ink: inkColor,
      style: lineStyle,
      background: exportBackground,
      size: exportSize,
    }),
    [lineWeight, inkColor, lineStyle, exportBackground, exportSize],
  );

  async function saveFile() {
    if (!lineArtUrl) {
      flash("ยังไม่มีลายเส้นให้บันทึก");
      router.push("/record/license");
      return;
    }
    try {
      const { blob, extension } = await exportLineArt(lineArtUrl, options, exportFormat);
      saveBlob(blob, `${patternName || "lai-thai"}.${extension}`);
      flash(`บันทึกไฟล์ ${exportFormat} แล้ว`);
    } catch (error) {
      flash(error instanceof Error ? error.message : "สร้างไฟล์ไม่สำเร็จ");
    }
    router.push("/record/license");
  }

  const row = (label: string, children: React.ReactNode) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      <span className="field-label" style={{ flex: "none" }}>
        {label}
      </span>
      <span style={{ display: "flex", gap: 7, flexWrap: "wrap", justifyContent: "flex-end" }}>
        {children}
      </span>
    </div>
  );

  return (
    <>
      <div className="fade-in pad">
        <LineArtPreview url={lineArtUrl} options={options} height={150} />

        <div style={{ marginTop: 18 }}>
          {row(
            "รูปแบบไฟล์",
            EXPORT_FORMATS.map((format: ExportFormat) => (
              <button
                key={format}
                type="button"
                className="pill"
                data-on={exportFormat === format}
                onClick={() => patch({ exportFormat: format })}
              >
                {format}
              </button>
            )),
          )}
        </div>

        <div style={{ height: 1, background: "rgba(42,42,38,.1)", margin: "14px 0" }} />
        {row(
          "พื้นหลัง",
          EXPORT_BACKGROUNDS.map((background) => (
            <button
              key={background}
              type="button"
              className="pill"
              data-on={exportBackground === background}
              onClick={() => patch({ exportBackground: background })}
            >
              {background}
            </button>
          )),
        )}

        <div style={{ height: 1, background: "rgba(42,42,38,.1)", margin: "14px 0" }} />
        {row(
          "ขนาด",
          EXPORT_SIZES.map((size: ExportSize) => (
            <button
              key={size}
              type="button"
              className="pill"
              data-on={exportSize === size}
              onClick={() => patch({ exportSize: size })}
            >
              {sizeLabel(exportFormat, size)}
            </button>
          )),
        )}

        <div className="note" style={{ marginTop: 14 }}>
          สีและความหนาเส้นตั้งค่าไว้แล้วในหน้าปรับแต่งลวดลาย
        </div>
      </div>

      <WizardFooter nextLabel="บันทึกไฟล์" busyLabel="กำลังสร้างไฟล์…" onNext={saveFile} />
    </>
  );
}
