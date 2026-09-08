"use client";

import { useState } from "react";
import { Sheet, SheetActions } from "./Sheet";
import { texAt } from "@/lib/design";

export type AlbumChoice = { id: string; name: string; count: number; cover: string | null };

export function AlbumSheet({
  albums,
  busy,
  onClose,
  onConfirm,
}: {
  albums: AlbumChoice[];
  busy?: boolean;
  onClose: () => void;
  onConfirm: (albumIds: string[], newAlbumName: string) => void;
}) {
  const [picked, setPicked] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  const canSave = picked.length > 0 || newName.trim().length > 0;

  return (
    <Sheet
      title="บันทึกลายนี้ไว้ในอัลบั้ม"
      description="เลือกอัลบั้มที่ต้องการเก็บ ลายจะไปอยู่ในคลังของฉัน · ลายที่บันทึกไว้"
      onClose={onClose}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 14 }}>
        {albums.map((album, index) => {
          const on = picked.includes(album.id);
          return (
            <button
              key={album.id}
              type="button"
              onClick={() =>
                setPicked((current) =>
                  current.includes(album.id)
                    ? current.filter((id) => id !== album.id)
                    : [...current, album.id],
                )
              }
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
                padding: 10,
                borderRadius: 9,
                cursor: "pointer",
                textAlign: "left",
                border: `1.5px solid ${on ? "var(--green)" : "rgba(42,42,38,.14)"}`,
                background: on ? "rgba(47,81,54,.06)" : "var(--surface)",
              }}
            >
              <span className="check-box" data-on={on}>
                {on ? "✓" : ""}
              </span>
              <span
                style={{
                  width: 44,
                  height: 44,
                  flex: "none",
                  borderRadius: 5,
                  background: album.cover ? `url(${album.cover}) center/cover` : texAt(index, 25),
                }}
              />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>
                  {album.name}
                </span>
                <span style={{ display: "block", fontSize: 10, color: "var(--ink-3)", marginTop: 2 }}>
                  {album.count} ลาย
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {creating ? (
        <input
          className="input"
          style={{ marginTop: 11 }}
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          placeholder="ชื่ออัลบั้มใหม่ เช่น ลายผ้าล้านนา"
        />
      ) : null}

      <button
        type="button"
        onClick={() => {
          setCreating((value) => !value);
          setNewName("");
        }}
        style={{
          width: "100%",
          marginTop: 11,
          padding: 11,
          borderRadius: 9,
          border: "1px dashed rgba(42,42,38,.3)",
          background: "transparent",
          color: "var(--green)",
          fontSize: 12,
          cursor: "pointer",
        }}
      >
        {creating ? "ยกเลิกการสร้างอัลบั้มใหม่" : "+ สร้างอัลบั้มใหม่"}
      </button>

      <SheetActions
        onCancel={onClose}
        onConfirm={() => onConfirm(picked, newName.trim())}
        confirmLabel={busy ? "กำลังบันทึก…" : "บันทึกลงอัลบั้ม"}
        confirmDisabled={!canSave || busy}
      />
    </Sheet>
  );
}
