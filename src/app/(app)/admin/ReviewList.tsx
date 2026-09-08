"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { publishPatternAction, rejectPatternAction } from "@/app/actions/review";
import { Sheet, SheetActions } from "@/components/Sheet";
import { useToast } from "@/components/Toast";
import { LINE_ART_PLACEHOLDER } from "@/lib/media";

export type ReviewItem = {
  id: string;
  name: string;
  description: string;
  place: string;
  object: string;
  sourceType: string;
  license: string;
  owner: string;
  submittedAt: string;
  photoUrl: string | null;
  lineArtUrl: string | null;
};

type Pending = { item: ReviewItem; action: "publish" | "reject" };

export function ReviewList({ items }: { items: ReviewItem[] }) {
  const router = useRouter();
  const { flash } = useToast();
  const [confirming, setConfirming] = useState<Pending | null>(null);
  const [busy, setBusy] = useState(false);

  // Publishing is public and sending back un-files someone's work, so both go
  // through a confirmation naming the pattern rather than firing on one tap.
  async function run({ item, action }: Pending) {
    setBusy(true);
    try {
      if (action === "publish") {
        await publishPatternAction(item.id);
        flash(`เผยแพร่ “${item.name}” ขึ้นคลังสาธารณะแล้ว`);
      } else {
        await rejectPatternAction(item.id);
        flash(`ส่ง “${item.name}” กลับให้เจ้าของแก้ไขแล้ว`);
      }
      setConfirming(null);
      router.refresh();
    } catch (error) {
      flash(error instanceof Error ? error.message : "ทำรายการไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              border: "1px solid var(--line-2)",
              borderRadius: 9,
              padding: 12,
              background: "var(--surface)",
            }}
          >
            <div style={{ display: "flex", gap: 11 }}>
              <span
                style={{
                  width: 66,
                  height: 66,
                  flex: "none",
                  borderRadius: 5,
                  background: item.photoUrl
                    ? `url(${item.photoUrl}) center/cover`
                    : "repeating-linear-gradient(150deg,#8B7F6A 0 12px,#7E7260 12px 24px)",
                }}
              />
              <span
                style={{
                  width: 66,
                  height: 66,
                  flex: "none",
                  borderRadius: 5,
                  border: "1px solid var(--line-2)",
                  background: item.lineArtUrl
                    ? `url(${item.lineArtUrl}) center/contain no-repeat #fff`
                    : LINE_ART_PLACEHOLDER,
                }}
              />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--ink)" }}>
                  {item.name}
                </span>
                <span
                  style={{
                    display: "block",
                    fontSize: 10.5,
                    color: "var(--ink-3)",
                    lineHeight: 1.6,
                    marginTop: 3,
                  }}
                >
                  {item.place}
                  <br />
                  {item.object}
                </span>
              </span>
            </div>

            <div style={{ fontSize: 11, color: "var(--ink-2)", lineHeight: 1.7, marginTop: 9 }}>
              {item.description}
            </div>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 9 }}>
              <span className="tag">{item.sourceType}</span>
              <span className="tag">{item.license}</span>
            </div>

            <div className="note" style={{ marginTop: 9 }}>
              บันทึกโดย {item.owner} · ส่งเมื่อ {item.submittedAt}
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 11 }}>
              <Link href={`/pattern/${item.id}`} className="btn-link" style={{ fontSize: 11 }}>
                ดูรายละเอียดเต็ม
              </Link>
              <button
                type="button"
                className="btn btn-outline"
                style={{ marginLeft: "auto", flex: "none", padding: "9px 14px", fontSize: 11.5 }}
                onClick={() => setConfirming({ item, action: "reject" })}
              >
                ส่งกลับแก้ไข
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: "none", padding: "9px 16px", fontSize: 11.5 }}
                onClick={() => setConfirming({ item, action: "publish" })}
              >
                เผยแพร่
              </button>
            </div>
          </div>
        ))}
      </div>

      {confirming ? (
        <Sheet
          title={confirming.action === "publish" ? "ยืนยันการเผยแพร่" : "ยืนยันการส่งกลับแก้ไข"}
          description={
            confirming.action === "publish"
              ? `“${confirming.item.name}” จะขึ้นคลังสาธารณะ ให้ผู้ใช้ทุกคนค้นหาและนำลวดลายไปใช้ได้ตามสิทธิ์ ${confirming.item.license}`
              : `“${confirming.item.name}” จะกลับไปเป็นฉบับร่างของ ${confirming.item.owner} และหายจากคิวตรวจสอบ เจ้าของแก้แล้วส่งเข้ามาใหม่ได้`
          }
          onClose={() => (busy ? undefined : setConfirming(null))}
        >
          <div className="callout" style={{ marginTop: 14 }}>
            {confirming.item.place} · {confirming.item.object}
            <br />
            บันทึกโดย {confirming.item.owner}
          </div>

          <SheetActions
            onCancel={() => setConfirming(null)}
            onConfirm={() => void run(confirming)}
            confirmDisabled={busy}
            confirmLabel={
              busy
                ? "กำลังทำรายการ…"
                : confirming.action === "publish"
                  ? "ยืนยันเผยแพร่"
                  : "ยืนยันส่งกลับ"
            }
          />
        </Sheet>
      ) : null}
    </>
  );
}
