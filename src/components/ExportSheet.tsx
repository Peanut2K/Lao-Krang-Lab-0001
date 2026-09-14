"use client";

import { useMemo, useState } from "react";
import { Sheet } from "./Sheet";
import { LineArtPreview } from "./LineArtPreview";
import { useToast } from "./Toast";
import {
  EXPORT_BACKGROUNDS,
  EXPORT_SIZES,
  EXPORT_FORMATS,
  INK_COLORS,
  sizeLabel,
  type ExportFormat,
  type ExportSize,
} from "@/lib/design";
import { saveBlob } from "@/lib/download";
import { exportLineArt } from "@/lib/line-art";

export type ExportDefaults = {
  weight: number;
  style: string;
  ink: string;
  format: ExportFormat;
  background: string;
  size: ExportSize;
};

/**
 * Downloads a published pattern's line art under its licence.
 *
 * Choices live in local state, not the record wizard: taking a pattern away to
 * use is not the same act as filing one, and must never reach the review queue.
 * The record's own saved settings are the starting point.
 */
export function ExportSheet({
  url,
  name,
  license,
  defaults,
  onClose,
}: {
  url: string;
  name: string;
  license: string | null;
  defaults: ExportDefaults;
  onClose: () => void;
}) {
  const { flash } = useToast();
  const [format, setFormat] = useState<ExportFormat>(defaults.format);
  const [background, setBackground] = useState(defaults.background);
  const [size, setSize] = useState<ExportSize>(defaults.size);
  const [ink, setInk] = useState(defaults.ink);
  const [busy, setBusy] = useState(false);

  const options = useMemo(
    () => ({ weight: defaults.weight, style: defaults.style, ink, background, size }),
    [defaults.weight, defaults.style, ink, background, size],
  );

  async function download() {
    setBusy(true);
    try {
      const { blob, extension } = await exportLineArt(url, options, format);
      saveBlob(blob, `${name || "lai-thai"}.${extension}`);
      flash(`บันทึกไฟล์ ${format} แล้ว`);
      onClose();
    } catch (error) {
      flash(error instanceof Error ? error.message : "สร้างไฟล์ไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
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
    <Sheet
      title="นำลวดลายไปใช้"
      description={
        license
          ? `ดาวน์โหลดลายเส้นไปใช้ต่อได้ตามสิทธิ์ ${license} — อ้างอิงที่มาทุกครั้งที่เผยแพร่`
          : "ดาวน์โหลดลายเส้นไปใช้ต่อ — อ้างอิงที่มาทุกครั้งที่เผยแพร่"
      }
      onClose={() => (busy ? undefined : onClose())}
    >
      <div style={{ marginTop: 14 }}>
        <LineArtPreview url={url} options={options} height={150} />
      </div>

      <div style={{ marginTop: 16 }}>
        {row(
          "รูปแบบไฟล์",
          EXPORT_FORMATS.map((option) => (
            <button
              key={option}
              type="button"
              className="pill"
              data-on={format === option}
              onClick={() => setFormat(option)}
            >
              {option}
            </button>
          )),
        )}
      </div>

      <div style={{ height: 1, background: "var(--line)", margin: "14px 0" }} />
      {row(
        "พื้นหลัง",
        EXPORT_BACKGROUNDS.map((option) => (
          <button
            key={option}
            type="button"
            className="pill"
            data-on={background === option}
            onClick={() => setBackground(option)}
          >
            {option}
          </button>
        )),
      )}

      <div style={{ height: 1, background: "var(--line)", margin: "14px 0" }} />
      {row(
        "ขนาด",
        EXPORT_SIZES.map((option) => (
          <button
            key={option}
            type="button"
            className="pill"
            data-on={size === option}
            onClick={() => setSize(option)}
          >
            {sizeLabel(format, option)}
          </button>
        )),
      )}

      <div style={{ height: 1, background: "var(--line)", margin: "14px 0" }} />
      {row(
        "สีเส้น",
        INK_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            aria-label={`สีเส้น ${color}`}
            aria-pressed={ink === color}
            onClick={() => setInk(color)}
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              cursor: "pointer",
              background: color,
              border: `2px solid ${ink === color ? "var(--green)" : "rgba(42,42,38,.2)"}`,
            }}
          />
        )),
      )}

      <button
        type="button"
        className="btn btn-primary"
        style={{ width: "100%", marginTop: 18 }}
        disabled={busy}
        onClick={() => void download()}
      >
        {busy ? "กำลังสร้างไฟล์…" : `ดาวน์โหลด ${format}`}
      </button>
    </Sheet>
  );
}
