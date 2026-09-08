import type { Crop } from "./supabase/types";
import type { ExportFormat, ExportSize } from "./design";

export const DEFAULT_CROP: Crop = { x1: 22, y1: 26, x2: 74, y2: 72 };

export const UPDATE_FIELD_LABELS = [
  "ภาพถ่ายและลายเส้นที่แกะได้",
  "ข้อมูลพื้นที่และวัตถุ",
  "ลักษณะลวดลายและความหมาย",
  "ผู้ให้ข้อมูล",
];

export type PatternDraft = {
  draftId: string | null;

  photoPath: string | null;
  photoUrl: string | null;
  crop: Crop;
  cropTouched: boolean;

  sourceType: string;
  sourceTypeOther: string;

  province: string;
  district: string;
  community: string;
  latitude: number | null;
  longitude: number | null;
  locationMode: "" | "gps" | "map";

  objectName: string;
  objectOwner: string;
  objectOwnerUnknown: boolean;
  occasion: string;

  patternName: string;
  patternDescription: string;
  patternMeaning: string;

  informantType: string;
  informantTypeOther: string;
  informantName: string;
  informantIsSelf: boolean;
  portraitPath: string | null;

  lineArtPath: string | null;
  lineArtUrl: string | null;
  aiSaved: boolean;

  lineWeight: number;
  lineStyle: string;
  inkColor: string;

  exportFormat: ExportFormat;
  exportBackground: string;
  exportSize: ExportSize;

  license: string;

  saveMode: "new" | "update";
  updateTargetId: string | null;
  updateTargetName: string | null;
  updateFields: string[];
  compareTargetId: string | null;
};

export const EMPTY_DRAFT: PatternDraft = {
  draftId: null,
  photoPath: null,
  photoUrl: null,
  crop: DEFAULT_CROP,
  cropTouched: false,

  sourceType: "สถาปัตยกรรม",
  sourceTypeOther: "",

  province: "เชียงใหม่",
  district: "แม่ริม",
  community: "บ้านแม่สาใหม่",
  latitude: null,
  longitude: null,
  locationMode: "",

  objectName: "",
  objectOwner: "",
  objectOwnerUnknown: false,
  occasion: "",

  patternName: "",
  patternDescription: "",
  patternMeaning: "",

  informantType: "ผู้สืบทอดองค์ความรู้",
  informantTypeOther: "",
  informantName: "",
  informantIsSelf: false,
  portraitPath: null,

  lineArtPath: null,
  lineArtUrl: null,
  aiSaved: false,

  lineWeight: 3,
  lineStyle: "เส้นเดี่ยว",
  inkColor: "#1B1B18",

  exportFormat: "SVG",
  exportBackground: "ไม่มีพื้น",
  exportSize: "ใหญ่",

  license: "CC BY · แสดงที่มา",

  saveMode: "new",
  updateTargetId: null,
  updateTargetName: null,
  updateFields: [...UPDATE_FIELD_LABELS],
  compareTargetId: null,
};

/** Object type shown in the object form and summaries — locked from the source-type step. */
export function objectTypeOf(draft: Pick<PatternDraft, "sourceType" | "sourceTypeOther">) {
  if (draft.sourceType !== "อื่น ๆ") return draft.sourceType;
  return draft.sourceTypeOther.trim() || "อื่น ๆ";
}

export function placeLine(draft: Pick<PatternDraft, "community" | "district" | "province">) {
  return `${draft.community} อ.${draft.district} จ.${draft.province}`;
}
