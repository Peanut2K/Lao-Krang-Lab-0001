"use client";

import { useRef, useState } from "react";
import { Sheet, SheetActions } from "./Sheet";
import { texAt } from "@/lib/design";

export type RecentImage = { id: string; name: string; path: string; url: string };

export function UploadSheet({
  title,
  description,
  recent,
  busy,
  onClose,
  onPickExisting,
  onPickFile,
  extraSources = [],
}: {
  title: string;
  description: string;
  recent: RecentImage[];
  busy?: boolean;
  onClose: () => void;
  onPickExisting: (image: RecentImage) => void;
  onPickFile: (file: File) => void;
  extraSources?: { icon: string; label: string; hint: string; onSelect: () => void }[];
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const galleryInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const sources: { icon: string; label: string; hint: string; picker?: "gallery" | "files"; onSelect?: () => void }[] = [
    {
      icon: "⌸",
      label: "เลือกจากคลังรูปในเครื่อง",
      hint: "รูปทั้งหมดในอัลบั้มของคุณ",
      picker: "gallery",
    },
    {
      icon: "⌘",
      label: "เลือกจากไฟล์",
      hint: "ไฟล์ที่ดาวน์โหลดหรือสแกนไว้",
      picker: "files",
    },
    ...extraSources,
  ];

  return (
    <Sheet title={title} description={description} onClose={onClose}>
      <input
        ref={galleryInput}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => e.target.files?.[0] && onPickFile(e.target.files[0])}
      />
      <input
        ref={fileInput}
        type="file"
        accept="image/*,.heic,.heif"
        hidden
        onChange={(e) => e.target.files?.[0] && onPickFile(e.target.files[0])}
      />

      {recent.length > 0 ? (
        <div style={{ display: "flex", gap: 8, overflowX: "auto", marginTop: 14, paddingBottom: 2 }}>
          {recent.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setPicked(image.path)}
              style={{
                flex: "none",
                width: 76,
                padding: 0,
                borderRadius: 7,
                overflow: "hidden",
                cursor: "pointer",
                border: `2px solid ${picked === image.path ? "var(--green)" : "rgba(42,42,38,.14)"}`,
                background: "var(--surface)",
              }}
            >
              <span
                style={{
                  display: "block",
                  height: 76,
                  background: image.url ? `url(${image.url}) center/cover` : texAt(index, 35),
                }}
              />
              <span
                style={{
                  display: "block",
                  padding: "5px 4px",
                  fontSize: 8.5,
                  color: "var(--ink-2)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {image.name}
              </span>
            </button>
          ))}
        </div>
      ) : null}

      <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 14 }}>
        {sources.map((source) => (
          <button
            key={source.label}
            type="button"
            onClick={() => {
              if (source.picker === "gallery") galleryInput.current?.click();
              else if (source.picker === "files") fileInput.current?.click();
              else source.onSelect?.();
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 11,
              padding: 12,
              borderRadius: 9,
              cursor: "pointer",
              textAlign: "left",
              border: "1px solid rgba(42,42,38,.14)",
              background: "var(--surface)",
            }}
          >
            <span
              style={{
                width: 30,
                height: 30,
                flex: "none",
                borderRadius: 8,
                background: "var(--chip)",
                display: "grid",
                placeItems: "center",
                fontSize: 13,
                color: "var(--green)",
              }}
            >
              {source.icon}
            </span>
            <span style={{ flex: 1 }}>
              <span style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>
                {source.label}
              </span>
              <span style={{ display: "block", fontSize: 9.5, color: "var(--ink-3)", marginTop: 1 }}>
                {source.hint}
              </span>
            </span>
            <span style={{ fontSize: 12, color: "var(--ink-4)" }}>›</span>
          </button>
        ))}
      </div>

      <SheetActions
        onCancel={onClose}
        onConfirm={() => {
          const image = recent.find((r) => r.path === picked);
          if (image) onPickExisting(image);
        }}
        confirmLabel={busy ? "กำลังอัปโหลด…" : "ใช้รูปนี้"}
        confirmDisabled={!picked || busy}
      />
    </Sheet>
  );
}
