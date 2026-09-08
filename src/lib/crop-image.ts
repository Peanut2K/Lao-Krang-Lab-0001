"use client";

import type { Crop } from "./supabase/types";

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("โหลดภาพต้นฉบับไม่สำเร็จ"));
    image.src = url;
  });
}

/** Cuts the selected region out of the photograph, as JPEG data for the AI request. */
export async function cropToDataUrl(url: string, crop: Crop, maxEdge = 1400) {
  const image = await loadImage(url);
  const sx = (crop.x1 / 100) * image.naturalWidth;
  const sy = (crop.y1 / 100) * image.naturalHeight;
  const sw = ((crop.x2 - crop.x1) / 100) * image.naturalWidth;
  const sh = ((crop.y2 - crop.y1) / 100) * image.naturalHeight;

  const scale = Math.min(1, maxEdge / Math.max(sw, sh));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(sw * scale));
  canvas.height = Math.max(1, Math.round(sh * scale));

  const context = canvas.getContext("2d");
  if (!context) throw new Error("เบราว์เซอร์ไม่รองรับการครอบภาพ");
  context.drawImage(image, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL("image/jpeg", 0.92);
}

export function splitDataUrl(dataUrl: string) {
  const [header, data] = dataUrl.split(",");
  const mimeType = /data:([^;]+)/.exec(header)?.[1] ?? "image/jpeg";
  return { mimeType, data };
}
