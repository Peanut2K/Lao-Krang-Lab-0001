export const GREEN = "#2F5136";
export const GREEN_DARK = "#24402A";
export const GOLD = "#C9A15B";
export const ERR = "#B3402E";
export const RING = "rgba(42,42,38,.3)";

/** Placeholder weave used wherever a real photograph has not been uploaded yet. */
export const tex = (a: string, b: string, ang: number) =>
  `repeating-linear-gradient(${ang}deg,${a} 0 12px,${b} 12px 24px)`;

export const TONES: [string, string][] = [
  ["#8B7F6A", "#7E7260"],
  ["#6E6A5E", "#615D52"],
  ["#9A8B6E", "#8D7F63"],
  ["#7A6E5C", "#6D6251"],
  ["#8E8272", "#817566"],
  ["#6B6455", "#5E584B"],
  ["#A08D6D", "#937F60"],
  ["#7C7566", "#6F695B"],
  ["#8A7C63", "#7D7057"],
  ["#736A5A", "#665E4F"],
  ["#95866B", "#88795F"],
  ["#6A6252", "#5D5646"],
];

export const toneAt = (i: number) => TONES[Math.abs(i) % TONES.length];
export const texAt = (i: number, ang = 25) => tex(toneAt(i)[0], toneAt(i)[1], ang + i * 29);

export const SOURCE_TYPES = [
  "สถาปัตยกรรม",
  "สิ่งของเครื่องใช้ในบ้าน",
  "วัตถุในพิธีกรรม",
  "เครื่องแต่งกายและผ้า",
  "เครื่องจักสาน",
  "เครื่องประดับ",
  "ภาชนะ",
  "เครื่องดนตรี",
  "อื่น ๆ",
] as const;

export const SRC_TO_OBJTYPE: Record<string, string> = {
  สถาปัตยกรรม: "สถาปัตยกรรม",
  สิ่งของเครื่องใช้ในบ้าน: "เครื่องใช้",
  วัตถุในพิธีกรรม: "วัตถุพิธีกรรม",
  เครื่องแต่งกายและผ้า: "เครื่องแต่งกาย",
  เครื่องจักสาน: "เครื่องจักสาน",
  เครื่องประดับ: "เครื่องประดับ",
  ภาชนะ: "ภาชนะ",
  เครื่องดนตรี: "เครื่องดนตรี",
  "อื่น ๆ": "อื่น ๆ",
};

export const CAT_ICON: Record<string, string> = {
  สถาปัตยกรรม: "⌂",
  เครื่องใช้: "⌘",
  วัตถุพิธีกรรม: "✽",
  เครื่องแต่งกาย: "✂",
  เครื่องจักสาน: "⌗",
  เครื่องประดับ: "◈",
  ภาชนะ: "◡",
  เครื่องดนตรี: "♪",
  "อื่น ๆ": "✦",
};

export const iconForObjectType = (t: string | null | undefined) =>
  (t && CAT_ICON[t]) || CAT_ICON["อื่น ๆ"];

export const INFORMANT_TYPES = [
  "เจ้าของวัตถุ",
  "ช่าง / ผู้ผลิต",
  "ผู้สืบทอดองค์ความรู้",
  "ผู้นำชุมชน",
  "นักวิชาการ",
  "อื่น ๆ",
] as const;

export type LicenseOption = { code: string; marks: string[]; desc: string };

export const LICENSES: LicenseOption[] = [
  {
    code: "CC BY · แสดงที่มา",
    marks: ["CC", "BY"],
    desc: "ผู้อื่นนำไปทำซ้ำ ดัดแปลง เผยแพร่ และใช้เชิงพาณิชย์ได้ โดยต้องอ้างอิงแหล่งที่มาและชื่อผู้บันทึก",
  },
  {
    code: "CC BY-SA · แสดงที่มา-อนุญาตแบบเดียวกัน",
    marks: ["CC", "BY", "SA"],
    desc: "ใช้และดัดแปลงได้ ต้องอ้างอิงที่มา และงานที่ดัดแปลงต้องเผยแพร่ด้วยสัญญาอนุญาตแบบเดียวกัน",
  },
  {
    code: "CC BY-NC · แสดงที่มา-ไม่ใช้เชิงพาณิชย์",
    marks: ["CC", "BY", "NC"],
    desc: "ใช้และดัดแปลงได้เพื่อการศึกษาและงานไม่แสวงกำไร ต้องอ้างอิงที่มา ห้ามใช้เชิงพาณิชย์",
  },
  {
    code: "CC BY-ND · แสดงที่มา-ไม่ดัดแปลง",
    marks: ["CC", "BY", "ND"],
    desc: "เผยแพร่ต่อได้ทั้งฉบับโดยอ้างอิงที่มา แต่ห้ามดัดแปลงหรือตัดต่อลวดลาย",
  },
];

export const EXPORT_FORMATS = ["PNG", "SVG", "PDF"] as const;
export const EXPORT_BACKGROUNDS = ["ไม่มีพื้น", "สีขาว"] as const;
export const EXPORT_SIZES = ["เล็ก", "กลาง", "ใหญ่"] as const;

export type ExportFormat = (typeof EXPORT_FORMATS)[number];
export type ExportSize = (typeof EXPORT_SIZES)[number];

/** Longest edge in pixels for each size step. */
export const SIZE_PX: Record<ExportSize, number> = { เล็ก: 720, กลาง: 1600, ใหญ่: 3000 };

export const SIZE_MB: Record<ExportFormat, [string, string, string]> = {
  PNG: ["0.6 MB", "1.8 MB", "4.2 MB"],
  SVG: ["0.2 MB", "0.4 MB", "0.9 MB"],
  PDF: ["0.5 MB", "1.2 MB", "2.8 MB"],
};

export const sizeLabel = (format: ExportFormat, size: ExportSize) =>
  `${size} · ${SIZE_MB[format][EXPORT_SIZES.indexOf(size)]}`;

export const LINE_STYLES = ["เส้นเดี่ยว", "เส้นทึบ"] as const;
export const INK_COLORS = ["#1B1B18", "#FFFFFF", "#8C8C86", "#C9A15B"];

export const PROVINCES = ["เชียงใหม่", "ลำปาง", "ลำพูน", "น่าน"];
export const DISTRICTS = ["แม่ริม", "สันทราย", "หางดง", "แม่แจ่ม", "เมือง", "สารภี"];
export const COMMUNITIES = ["บ้านแม่สาใหม่", "บ้านป่าแดด", "บ้านริมใต้", "บ้านทำหลวงเหนือ"];

export const STEP_TITLES: Record<string, string> = {
  verify: "ตรวจสอบภาพ",
  "source-type": "เลือกประเภทแหล่งที่มา",
  place: "ข้อมูลพื้นที่",
  object: "ข้อมูลวัตถุ",
  pattern: "ข้อมูลลวดลาย",
  informant: "ผู้ให้ข้อมูล",
  similar: "ตรวจสอบลายที่ใกล้เคียง",
  compare: "เปรียบเทียบลวดลาย",
  ai: "AI แกะลวดลาย",
  "ai-result": "ผลลัพธ์จาก AI",
  "edit-line": "ปรับแต่งลวดลาย",
  "save-file": "บันทึกเพื่อนำไปใช้ต่อ",
  license: "สิทธิ์การใช้งานลวดลาย",
  confirm: "ตรวจสอบก่อนบันทึก",
};

export const thaiDate = (iso: string | null | undefined) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("th-TH", { day: "2-digit", month: "2-digit", year: "numeric" });
};

export const thaiDateTime = (iso: string | null | undefined) => {
  if (!iso) return "";
  const d = new Date(iso);
  const time = d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
  return `${thaiDate(iso)} เวลา ${time} น.`;
};
