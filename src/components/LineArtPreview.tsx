"use client";

import { useEffect, useRef, useState } from "react";
import { renderPreview, type LineArtOptions } from "@/lib/line-art";
import { LINE_ART_PLACEHOLDER } from "@/lib/media";

export function LineArtPreview({
  url,
  options,
  height,
}: {
  url: string | null;
  options: LineArtOptions;
  height: number;
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const token = useRef(0);

  useEffect(() => {
    if (!url) return;
    const current = ++token.current;
    let cancelled = false;

    renderPreview(url, options)
      .then((canvas) => {
        if (!cancelled && current === token.current) setDataUrl(canvas.toDataURL("image/png"));
      })
      .catch(() => !cancelled && setFailed(true));

    return () => {
      cancelled = true;
    };
  }, [url, options]);

  const background =
    dataUrl && !failed
      ? `url(${dataUrl}) center/contain no-repeat ${options.background === "สีขาว" ? "#FFFFFF" : "transparent"}`
      : LINE_ART_PLACEHOLDER;

  return (
    <div
      style={{
        height,
        borderRadius: 5,
        background,
        border: "1px solid rgba(42,42,38,.12)",
        display: "grid",
        placeItems: "center",
      }}
    >
      {!dataUrl || failed ? (
        <span className="placeholder-note">
          {failed ? "[ แสดงตัวอย่างลายเส้นไม่ได้ ]" : "[ กำลังเตรียมลายเส้น ]"}
        </span>
      ) : null}
    </div>
  );
}
