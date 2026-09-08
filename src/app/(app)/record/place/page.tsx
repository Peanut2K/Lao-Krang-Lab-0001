"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPicker } from "@/components/MapPicker";
import { WizardFooter } from "@/components/WizardFooter";
import { useToast } from "@/components/Toast";
import { COMMUNITIES, DISTRICTS, PROVINCES } from "@/lib/design";
import { useWizard } from "@/state/wizard";

export default function PlacePage() {
  const router = useRouter();
  const { flash } = useToast();
  const { province, district, community, latitude, longitude, locationMode, patch } = useWizard();
  const [locating, setLocating] = useState(false);

  function useGps() {
    if (!navigator.geolocation) {
      flash("อุปกรณ์นี้ไม่รองรับการดึงพิกัด");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        patch({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          locationMode: "gps",
        });
        setLocating(false);
        flash(
          `ดึงพิกัดปัจจุบันแล้ว · ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
        );
      },
      () => {
        setLocating(false);
        flash("ดึงพิกัดไม่สำเร็จ — อนุญาตการเข้าถึงตำแหน่งก่อน");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  const pinCaption =
    latitude !== null && longitude !== null
      ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
      : "แตะบนแผนที่เพื่อปักหมุด";

  const selects = [
    { label: "จังหวัด", value: province, options: PROVINCES, onPick: (v: string) => patch({ province: v }) },
    { label: "อำเภอ", value: district, options: DISTRICTS, onPick: (v: string) => patch({ district: v }) },
    { label: "ชุมชน", value: community, options: COMMUNITIES, onPick: (v: string) => patch({ community: v }) },
  ];

  return (
    <>
      <div className="fade-in pad">
        <div className="step-title">ข้อมูลพื้นที่ที่พบวัตถุ</div>

        <div style={{ display: "flex", gap: 9, marginTop: 12 }}>
          <button
            type="button"
            onClick={useGps}
            disabled={locating}
            style={{
              flex: 1,
              padding: "11px 8px",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 11,
              lineHeight: 1.4,
              border: `1px solid ${locationMode === "gps" ? "var(--green)" : "rgba(42,42,38,.18)"}`,
              background: locationMode === "gps" ? "rgba(47,81,54,.08)" : "var(--surface)",
              color: "var(--ink)",
            }}
          >
            ดึงพิกัดจาก GPS
            <br />
            <span style={{ fontSize: 9.5, color: "var(--ink-3)" }}>
              {locating ? "กำลังค้นหาตำแหน่ง…" : "ตำแหน่งปัจจุบัน"}
            </span>
          </button>
          <button
            type="button"
            onClick={() => patch({ locationMode: "map" })}
            style={{
              flex: 1,
              padding: "11px 8px",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 11,
              lineHeight: 1.4,
              border: `1px solid ${locationMode === "map" ? "var(--green)" : "rgba(42,42,38,.18)"}`,
              background: locationMode === "map" ? "rgba(47,81,54,.08)" : "var(--surface)",
              color: "var(--ink)",
            }}
          >
            ระบุผ่าน Google Map
            <br />
            <span style={{ fontSize: 9.5, color: "var(--ink-3)" }}>ปักหมุดเอง</span>
          </button>
        </div>

        <div className="note" style={{ marginTop: 7 }}>
          ไม่บังคับ — เลือกดึงพิกัดอย่างใดอย่างหนึ่ง หรือกรอกข้อมูลด้านล่างเองก็ได้
        </div>

        {locationMode ? (
          <MapPicker
            latitude={latitude}
            longitude={longitude}
            interactive={locationMode === "map"}
            height={locationMode === "map" ? 200 : 110}
            caption={pinCaption}
            onPick={(position) => patch({ latitude: position.lat, longitude: position.lng })}
          />
        ) : null}

        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
          {selects.map((field) => (
            <label key={field.label} className="field">
              <span className="field-label">{field.label}</span>
              <select
                className="select"
                value={field.value}
                onChange={(event) => field.onPick(event.target.value)}
              >
                {field.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </div>

      <WizardFooter onNext={() => router.push("/record/object")} />
    </>
  );
}
