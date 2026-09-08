import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";
import { publicUrl } from "@/lib/media";

export const maxDuration = 60;

const PROMPT = [
  "Trace the ornamental Thai pattern in this photograph as clean black line art.",
  "Keep every motif, petal count, stem direction and spacing faithful to the photograph — this is documentation of a real cultural artifact, not a reinterpretation.",
  "Output: pure black strokes of even weight on a plain white background, no shading, no colour, no texture, no background scenery, no added ornament, no text or watermark.",
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

    const bytes = Buffer.from(generated.data, "base64");
    const path = `${user.id}/${crypto.randomUUID()}.png`;
    const { error } = await supabase.storage.from("line-art").upload(path, bytes, {
      contentType: generated.mimeType || "image/png",
      upsert: false,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ path, url: publicUrl("line-art", path) });
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
