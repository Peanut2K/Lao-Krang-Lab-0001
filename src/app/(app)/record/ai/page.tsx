"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cropToDataUrl, splitDataUrl } from "@/lib/crop-image";
import { useWizard } from "@/state/wizard";

const DOTS = [0, 1, 2, 3, 4, 5].map((index) => {
  const angle = (index / 6) * Math.PI * 2 - Math.PI / 2;
  return {
    key: index,
    x: 48 + 42 * Math.cos(angle),
    y: 48 + 42 * Math.sin(angle),
    delay: `${index * 0.16}s`,
  };
});

export default function AiExtractPage() {
  const router = useRouter();
  const { photoUrl, crop, patch } = useWizard();
  const [error, setError] = useState("");
  const started = useRef(false);

  const extract = useCallback(async () => {
    if (!photoUrl) return;
    setError("");
    try {
      const dataUrl = await cropToDataUrl(photoUrl, crop);
      const { mimeType, data } = splitDataUrl(dataUrl);
      const response = await fetch("/api/line-art", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: data, mimeType }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "แกะลายไม่สำเร็จ");
      patch({ lineArtPath: result.path, lineArtUrl: result.url, aiSaved: false });
      router.replace("/record/ai-result");
    } catch (thrown) {
      setError(thrown instanceof Error ? thrown.message : "แกะลายไม่สำเร็จ");
    }
  }, [photoUrl, crop, patch, router]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void extract();
  }, [extract]);

  if (error) {
    return (
      <div className="fade-in" style={{ padding: "48px 30px 0", textAlign: "center" }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", lineHeight: 1.6 }}>
          แกะลายเส้นไม่สำเร็จ
        </div>
        <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 10, lineHeight: 1.8 }}>{error}</div>
        <button
          type="button"
          className="btn btn-primary"
          style={{ width: "100%", marginTop: 24 }}
          onClick={() => {
            started.current = true;
            void extract();
          }}
        >
          ลองแกะลายอีกครั้ง
        </button>
        <button
          type="button"
          className="btn btn-outline"
          style={{ width: "100%", marginTop: 10 }}
          onClick={() => router.push("/record/verify")}
        >
          กลับไปเลือกพื้นที่ลายใหม่
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ padding: "60px 30px 0", textAlign: "center" }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", lineHeight: 1.6 }}>
        กำลังแกะลายเส้น
        <br />
        ของลวดลายจากภาพถ่าย
      </div>

      <div style={{ position: "relative", width: 110, height: 110, margin: "34px auto 0" }}>
        {DOTS.map((dot) => (
          <span
            key={dot.key}
            style={{
              position: "absolute",
              width: 13,
              height: 13,
              borderRadius: "50%",
              background: "var(--green)",
              left: dot.x,
              top: dot.y,
              animation: "appDot 1.2s ease-in-out infinite",
              animationDelay: dot.delay,
            }}
          />
        ))}
      </div>

      <div style={{ fontSize: 10.5, color: "var(--ink-3)", lineHeight: 1.8, marginTop: 34 }}>
        ข้อมูลนี้จะถูกนำไปประมวลผล
        <br />
        โดย AI เพื่อสร้างลายเส้นสำหรับนำไปใช้ต่อ
      </div>
      <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 38 }}>โปรดรอสักครู่…</div>
    </div>
  );
}
