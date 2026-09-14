import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

/*
 * The model reliably drifts two ways unless it is told not to: it colours the
 * motif in (returning the photo's palette) and it "tidies" the ornament into a
 * neater, more symmetrical design of its own. Both are wrong here — the output
 * is a record of a real artifact, so the instructions name each drift directly.
 * The client binarizes the result afterwards regardless; see normalizeLineArt.
 */
const PROMPT = [
  "You are tracing a real cultural artifact for an archive. Reproduce the ornamental pattern in this photograph exactly as it appears.",
  "STRICTLY MONOCHROME: output pure black (#000000) strokes on a pure white (#FFFFFF) background.",
  "Use no colour of any kind — no green, no red, no gold, no grey fills, no shading, no gradients, no tinting.",
  "If the photograph is colourful, ignore the colours completely and draw only the outlines of the shapes.",
  "TRACE, DO NOT REDESIGN: follow the actual contours in the photograph line for line.",
  "Keep the exact motif count, petal count, leaf count, stem direction, proportions, spacing and any irregularities or asymmetry exactly as photographed.",
  "Do not straighten, do not symmetrise, do not simplify, do not stylise, do not beautify, do not complete damaged or worn areas, and do not invent any element that is not visible in the photograph.",
  "Fill the frame with the traced pattern only: no background scenery, no border, no frame, no added ornament, no text, no caption, no watermark, no signature.",
].join(" ");

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "ต้องเข้าสู่ระบบก่อน" }, { status: 401 });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ยังไม่ได้ตั้งค่า GEMINI_API_KEY สำหรับการแกะลายด้วย AI" },
      { status: 503 },
    );
  }

  let payload: { imageBase64?: string; mimeType?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "รูปแบบคำขอไม่ถูกต้อง" }, { status: 400 });
  }

  const { imageBase64, mimeType } = payload;
  if (!imageBase64) return NextResponse.json({ error: "ไม่พบภาพที่จะแกะลาย" }, { status: 400 });

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image",
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType: mimeType || "image/jpeg", data: imageBase64 } },
            { text: PROMPT },
          ],
        },
      ],
    });

    const parts = response.candidates?.[0]?.content?.parts ?? [];
    const generated = parts.find((part) => part.inlineData?.data)?.inlineData;
    if (!generated?.data) {
      return NextResponse.json({ error: "AI ยังแกะลายจากภาพนี้ไม่ได้ ลองเลือกพื้นที่ใหม่" }, { status: 502 });
    }

    // Returned rather than stored here: the client binarizes the result to pure
    // black-on-white before uploading it, so no coloured output reaches storage.
    return NextResponse.json({
      imageBase64: generated.data,
      mimeType: generated.mimeType || "image/png",
    });
  } catch (error) {
    // Google's SDK throws with the raw upstream JSON in the message; surfacing
    // that leaks quota/billing internals into the UI, so map the known cases.
    const raw = error instanceof Error ? error.message : "";
    console.error("[line-art]", raw);

    if (raw.includes("RESOURCE_EXHAUSTED") || raw.includes("429")) {
      return NextResponse.json(
        { error: "โควตา AI ของโปรเจกต์หมด — เปิดการเรียกเก็บเงินใน Google AI Studio หรือลองใหม่ภายหลัง" },
        { status: 429 },
      );
    }
    if (raw.includes("API key") || raw.includes("PERMISSION_DENIED") || raw.includes("401")) {
      return NextResponse.json({ error: "ตั้งค่า GEMINI_API_KEY ไม่ถูกต้อง" }, { status: 503 });
    }
    if (raw.includes("404") || raw.includes("NOT_FOUND")) {
      return NextResponse.json(
        { error: "ไม่พบโมเดลที่ตั้งค่าไว้ — ตรวจสอบ GEMINI_IMAGE_MODEL" },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: "แกะลายไม่สำเร็จ ลองใหม่อีกครั้ง" }, { status: 502 });
  }
}
