"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { LineArtPreview } from "@/components/LineArtPreview";
import { WizardFooter } from "@/components/WizardFooter";
import { INK_COLORS, LINE_STYLES } from "@/lib/design";
import { useWizard } from "@/state/wizard";

export default function EditLinePage() {
  const router = useRouter();
  const { lineArtUrl, lineWeight, lineStyle, inkColor, exportBackground, exportSize, patch } =
    useWizard();

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

  return (
    <>
      <div className="fade-in pad">
        <LineArtPreview url={lineArtUrl} options={options} height={230} />

        <div className="field-label" style={{ marginTop: 16 }}>
          ความหนาเส้น
        </div>
        <input
          type="range"
          min={1}
          max={5}
          value={lineWeight}
          onChange={(event) => patch({ lineWeight: Number(event.target.value) })}
          style={{ width: "100%", marginTop: 8, accentColor: "var(--green)" }}
        />

        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginTop: 14 }}>
          <div>
            <div className="field-label">รูปแบบเส้น</div>
            <div style={{ display: "flex", gap: 18, marginTop: 9 }}>
              {LINE_STYLES.map((style) => (
                <button
                  key={style}
                  type="button"
                  className="radio-row"
                  data-on={lineStyle === style}
                  onClick={() => patch({ lineStyle: style })}
                >
                  <span className="radio-ring">
                    <span className="radio-dot" />
                  </span>
                  <span className="radio-label">{style}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="field-label">สีเส้น</div>
            <div style={{ display: "flex", gap: 10, marginTop: 9 }}>
              {INK_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`สีเส้น ${color}`}
                  onClick={() => patch({ inkColor: color })}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    cursor: "pointer",
                    background: color,
                    border: `2px solid ${inkColor === color ? "var(--green)" : "rgba(42,42,38,.2)"}`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <WizardFooter nextLabel="บันทึกการปรับแต่ง" onNext={() => router.push("/record/save-file")} />
    </>
  );
}
