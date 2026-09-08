"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadSheet, type RecentImage } from "@/components/UploadSheet";
import { useToast } from "@/components/Toast";
import { createClient } from "@/lib/supabase/client";
import { extensionOf, uploadImage } from "@/lib/upload";
import { useWizard } from "@/state/wizard";

const PLACEHOLDER = "repeating-linear-gradient(150deg,#8B7F6A 0 14px,#7E7260 14px 28px)";

export function CameraScreen({
  userId,
  recentPhotos,
}: {
  userId: string;
  recentPhotos: RecentImage[];
}) {
  const router = useRouter();
  const { flash } = useToast();
  const startCapture = useWizard((s) => s.startCapture);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [live, setLive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing, width: { ideal: 1920 }, height: { ideal: 2240 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setLive(true);
      } catch {
        setLive(false);
      }
    }

    void start();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [facing]);

  const goVerify = useCallback(
    (photo: { path: string; url: string }) => {
      startCapture(photo);
      router.push("/record/verify");
    },
    [router, startCapture],
  );

  async function shoot() {
    const video = videoRef.current;
    if (busy) return;
    if (!live || !video || !video.videoWidth) {
      flash("ยังเปิดกล้องไม่ได้ — ใช้ปุ่มอัปโหลดรูปแทนได้");
      return;
    }
    setBusy(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d")?.drawImage(video, 0, 0);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.92),
      );
      if (!blob) throw new Error("แปลงภาพไม่สำเร็จ");
      const stored = await uploadImage(createClient(), "pattern-photos", userId, blob, "jpg");
      goVerify(stored);
    } catch {
      flash("บันทึกภาพไม่สำเร็จ ลองอีกครั้ง");
      setBusy(false);
    }
  }

  async function useFile(file: File) {
    setBusy(true);
    try {
      const stored = await uploadImage(
        createClient(),
        "pattern-photos",
        userId,
        file,
        extensionOf(file),
      );
      setUploadOpen(false);
      goVerify(stored);
    } catch {
      flash("อัปโหลดรูปไม่สำเร็จ ลองอีกครั้ง");
      setBusy(false);
    }
  }

  return (
    <div
      className="fade-in"
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: "calc(100dvh - var(--tabbar))",
        background: PLACEHOLDER,
        overflow: "hidden",
      }}
    >
      <video
        ref={videoRef}
        playsInline
        muted
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: live ? 1 : 0,
        }}
      />
      {!live ? (
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none" }}>
          <span
            style={{
              fontFamily: "ui-monospace,Menlo,monospace",
              fontSize: 10.5,
              letterSpacing: ".08em",
              color: "rgba(251,249,243,.8)",
              textAlign: "center",
              lineHeight: 1.8,
            }}
          >
            [ เปิดกล้องเพื่อถ่ายลวดลาย ]
            <br />
            หรือกดปุ่มอัปโหลดรูป
          </span>
        </div>
      ) : null}

      {[33, 66].map((pos) => (
        <div
          key={`h${pos}`}
          style={{ position: "absolute", left: 0, right: 0, top: `${pos}%`, height: 1, background: "rgba(251,249,243,.16)", pointerEvents: "none" }}
        />
      ))}
      {[33, 66].map((pos) => (
        <div
          key={`v${pos}`}
          style={{ position: "absolute", top: 0, bottom: 0, left: `${pos}%`, width: 1, background: "rgba(251,249,243,.16)", pointerEvents: "none" }}
        />
      ))}

      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 18px",
          color: "#FBF9F3",
          flex: "none",
          textShadow: "0 1px 4px rgba(0,0,0,.5)",
        }}
      >
        <span style={{ fontSize: 17, lineHeight: 1 }}>☰</span>
        <span
          style={{
            fontSize: 11,
            padding: "4px 12px",
            borderRadius: 999,
            background: "rgba(20,20,20,.35)",
            backdropFilter: "blur(4px)",
            letterSpacing: ".04em",
          }}
        >
          6:7
        </span>
        <span style={{ fontSize: 15, lineHeight: 1 }}>⚡</span>
      </div>

      <div style={{ flex: 1, minHeight: 120 }} />

      <div style={{ position: "relative", display: "flex", justifyContent: "center", padding: "0 0 14px", flex: "none" }}>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            fontSize: 11,
            color: "#FBF9F3",
            background: "rgba(20,20,20,.35)",
            backdropFilter: "blur(4px)",
            padding: "6px 13px",
            borderRadius: 999,
          }}
        >
          <span style={{ width: 13, height: 13, borderRadius: 3, background: "var(--gold)", display: "inline-block" }} />
          History ⌄
        </span>
      </div>

      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          padding: "6px 34px 24px",
          flex: "none",
        }}
      >
        <button
          type="button"
          title="อัปโหลดรูปจากเครื่อง"
          onClick={() => setUploadOpen(true)}
          style={{
            width: 42,
            height: 42,
            borderRadius: 7,
            border: "1.5px solid rgba(251,249,243,.8)",
            background: "rgba(20,20,20,.32)",
            backdropFilter: "blur(4px)",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            color: "#FBF9F3",
            boxShadow: "0 2px 10px rgba(0,0,0,.35)",
          }}
        >
          <span style={{ fontSize: 14, lineHeight: 1 }}>↑</span>
          <span style={{ fontSize: 7, lineHeight: 1 }}>อัปโหลด</span>
        </button>

        <button
          type="button"
          aria-label="ถ่ายภาพ"
          onClick={shoot}
          disabled={busy}
          style={{
            width: 68,
            height: 68,
            borderRadius: "50%",
            border: "3px solid rgba(251,249,243,.95)",
            background: "#FBF9F3",
            cursor: "pointer",
            boxShadow: "0 3px 16px rgba(0,0,0,.4)",
            opacity: busy ? 0.6 : 1,
          }}
        />

        <button
          type="button"
          aria-label="สลับกล้อง"
          onClick={() => setFacing((f) => (f === "environment" ? "user" : "environment"))}
          style={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            border: "none",
            background: "transparent",
            color: "#FBF9F3",
            fontSize: 20,
            cursor: "pointer",
            textShadow: "0 1px 5px rgba(0,0,0,.5)",
          }}
        >
          ⟳
        </button>
      </div>

      {uploadOpen ? (
        <UploadSheet
          title="อัปโหลดรูปแทนการถ่าย"
          description="เลือกรูปลวดลายจากเครื่องของคุณ รองรับ JPG PNG และ HEIC ขนาดไม่เกิน 20 MB"
          recent={recentPhotos}
          busy={busy}
          onClose={() => setUploadOpen(false)}
          onPickExisting={(image) => {
            setUploadOpen(false);
            goVerify({ path: image.path, url: image.url });
          }}
          onPickFile={useFile}
          extraSources={[
            {
              icon: "☁",
              label: "นำเข้าจากคลังลายของฉัน",
              hint: "ใช้ภาพที่เคยบันทึกไว้เป็นต้นแบบ",
              onSelect: () => router.push("/gallery"),
            },
          ]}
        />
      ) : null}
    </div>
  );
}
