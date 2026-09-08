"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useWizard } from "@/state/wizard";
import type { Crop } from "@/lib/supabase/types";

type Handle = "tl" | "tr" | "bl" | "br" | "move";

const MIN_SIZE = 12;
const HANDLES: { key: Exclude<Handle, "move">; left: string; top: string; cursor: string }[] = [
  { key: "tl", left: "0%", top: "0%", cursor: "nwse-resize" },
  { key: "tr", left: "100%", top: "0%", cursor: "nesw-resize" },
  { key: "bl", left: "0%", top: "100%", cursor: "nesw-resize" },
  { key: "br", left: "100%", top: "100%", cursor: "nwse-resize" },
];

export default function VerifyPage() {
  const router = useRouter();
  const { photoUrl, crop, cropTouched, patch } = useWizard();
  const boxRef = useRef<HTMLDivElement>(null);

  function startDrag(event: React.PointerEvent, kind: Handle) {
    event.preventDefault();
    event.stopPropagation();
    const box = boxRef.current;
    if (!box) return;

    const rect = box.getBoundingClientRect();
    const start: Crop = { ...crop };
    const px = ((event.clientX - rect.left) / rect.width) * 100;
    const py = ((event.clientY - rect.top) / rect.height) * 100;
    const clamp = (value: number) => Math.max(0, Math.min(100, value));

    const move = (moveEvent: PointerEvent) => {
      const nx = clamp(((moveEvent.clientX - rect.left) / rect.width) * 100);
      const ny = clamp(((moveEvent.clientY - rect.top) / rect.height) * 100);
      const next: Crop = { ...start };

      if (kind === "move") {
        const dx = nx - px;
        const dy = ny - py;
        const width = start.x2 - start.x1;
        const height = start.y2 - start.y1;
        next.x1 = clamp(Math.min(Math.max(start.x1 + dx, 0), 100 - width));
        next.y1 = clamp(Math.min(Math.max(start.y1 + dy, 0), 100 - height));
        next.x2 = next.x1 + width;
        next.y2 = next.y1 + height;
      } else {
        if (kind === "tl" || kind === "bl") next.x1 = Math.min(nx, start.x2 - MIN_SIZE);
        if (kind === "tr" || kind === "br") next.x2 = Math.max(nx, start.x1 + MIN_SIZE);
        if (kind === "tl" || kind === "tr") next.y1 = Math.min(ny, start.y2 - MIN_SIZE);
        if (kind === "bl" || kind === "br") next.y2 = Math.max(ny, start.y1 + MIN_SIZE);
      }

      patch({ crop: next, cropTouched: true });
    };

    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  return (
    <div className="fade-in pad">
      <div style={{ fontSize: 12, color: "var(--ink)", fontWeight: 600 }}>เลือกพื้นที่ของลายที่ต้องการแกะ</div>
      <div className="step-sub">
        ลากจุดที่มุมทั้งสี่เพื่อครอบพื้นที่ลาย หรือลากกลางกรอบเพื่อย้ายทั้งกรอบ ระบบจะแกะลายเฉพาะบริเวณในกรอบ
      </div>

      <div
        ref={boxRef}
        style={{
          position: "relative",
          borderRadius: 6,
          overflow: "hidden",
          height: 330,
          marginTop: 12,
          touchAction: "none",
          userSelect: "none",
          background: photoUrl
            ? `url(${photoUrl}) center/cover`
            : "repeating-linear-gradient(150deg,#8B7F6A 0 14px,#7E7260 14px 28px)",
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "rgba(16,16,14,.42)", pointerEvents: "none" }} />
        <div
          onPointerDown={(event) => startDrag(event, "move")}
          style={{
            position: "absolute",
            left: `${crop.x1}%`,
            top: `${crop.y1}%`,
            width: `${crop.x2 - crop.x1}%`,
            height: `${crop.y2 - crop.y1}%`,
            border: "1.5px solid var(--gold)",
            cursor: "move",
            background: "transparent",
          }}
        >
          <span style={{ position: "absolute", inset: 0, backdropFilter: "brightness(1.55)", pointerEvents: "none" }} />
          <span
            style={{
              position: "absolute",
              left: 0,
              top: -21,
              fontSize: 9,
              padding: "2px 7px",
              borderRadius: 3,
              background: "var(--gold)",
              color: "#20200F",
              whiteSpace: "nowrap",
              pointerEvents: "none",
            }}
          >
            พื้นที่ที่เลือก · {Math.round(crop.x2 - crop.x1)}% × {Math.round(crop.y2 - crop.y1)}%
          </span>

          {[33.33, 66.66].map((pos) => (
            <span
              key={`v${pos}`}
              style={{ position: "absolute", left: `${pos}%`, top: 0, bottom: 0, width: 1, background: "rgba(251,249,243,.35)", pointerEvents: "none" }}
            />
          ))}
          {[33.33, 66.66].map((pos) => (
            <span
              key={`h${pos}`}
              style={{ position: "absolute", top: `${pos}%`, left: 0, right: 0, height: 1, background: "rgba(251,249,243,.35)", pointerEvents: "none" }}
            />
          ))}

          {HANDLES.map((handle) => (
            <span
              key={handle.key}
              onPointerDown={(event) => startDrag(event, handle.key)}
              style={{
                position: "absolute",
                left: handle.left,
                top: handle.top,
                width: 30,
                height: 30,
                margin: "-15px 0 0 -15px",
                cursor: handle.cursor,
                display: "grid",
                placeItems: "center",
                touchAction: "none",
              }}
            >
              <span
                style={{
                  width: 15,
                  height: 15,
                  borderRadius: "50%",
                  background: "var(--surface)",
                  border: "3px solid var(--gold)",
                  boxShadow: "0 1px 5px rgba(0,0,0,.45)",
                  display: "block",
                }}
              />
            </span>
          ))}
        </div>
      </div>

      <div style={{ textAlign: "center", fontSize: 11, color: "var(--ink-3)", marginTop: 12 }}>
        {cropTouched ? "ปรับกรอบแล้ว · ลากจุดมุมเพื่อปรับเพิ่ม" : "ลากจุดที่มุมเพื่อกำหนดพื้นที่ลาย"}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => router.replace("/capture")}>
          ถ่ายใหม่
        </button>
        <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={() => router.push("/record/source-type")}>
          ใช้ภาพนี้
        </button>
      </div>
    </div>
  );
}
