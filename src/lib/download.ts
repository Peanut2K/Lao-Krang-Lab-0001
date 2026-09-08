"use client";

export function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function downloadFrom(url: string, filename: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("ดาวน์โหลดไฟล์ไม่สำเร็จ");
  saveBlob(await response.blob(), filename);
}
