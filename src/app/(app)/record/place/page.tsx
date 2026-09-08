"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ComboField } from "@/components/ComboField";
import { MapPicker } from "@/components/MapPicker";
import { WizardFooter } from "@/components/WizardFooter";
import { useToast } from "@/components/Toast";
import { COMMUNITIES, DISTRICTS, PROVINCES } from "@/lib/design";
import { reverseGeocode, searchPlaces, type PlaceHit } from "@/lib/geocode";
import { useWizard } from "@/state/wizard";

export default function PlacePage() {
  const router = useRouter();
  const { flash } = useToast();
  const { province, district, community, latitude, longitude, locationMode, patch } = useWizard();
  const [locating, setLocating] = useState(false);
  const [filling, setFilling] = useState(false);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<PlaceHit[] | null>(null);
  const [searching, setSearching] = useState(false);
  const geocodeToken = useRef(0);

  // Turn a dropped pin into จังหวัด / อำเภอ / ชุมชน. Only fills the parts Google
  // can answer, so a value typed before picking the pin is not wiped out.
  const autoFill = useCallback(
    async (lat: number, lng: number) => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) return;
      const current = ++geocodeToken.current;
      setFilling(true);
      try {
        const parts = await reverseGeocode(lat, lng, apiKey);
        if (current !== geocodeToken.current) return;
        const found = Object.fromEntries(
          Object.entries(parts).filter(([, value]) => value),
        ) as Partial<typeof parts>;
        if (!Object.keys(found).length) {
          flash("ไม่พบที่อยู่ของพิกัดนี้ — เลือกเองด้านล่างได้");
          return;
        }
        patch(found);
        flash(
          `เติมที่อยู่จากพิกัดแล้ว · ${[found.community, found.district, found.province]
            .filter(Boolean)
            .join(" ")}`,
        );
      } catch {
        if (current === geocodeToken.current) flash("ค้นหาที่อยู่จากพิกัดไม่สำเร็จ — เลือกเองด้านล่างได้");
      } finally {
        if (current === geocodeToken.current) setFilling(false);
      }
    },
    [flash, patch],
  );

  async function runSearch(event: React.FormEvent) {
    event.preventDefault();
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const term = query.trim();
    if (!apiKey || !term) return;
    setSearching(true);
    setHits(null);
    try {
      const found = await searchPlaces(term, apiKey);
      setHits(found);
      if (!found.length) flash("ไม่พบสถานที่นี้ — ลองพิมพ์ชื่อตำบล อำเภอ หรือจังหวัดเพิ่ม");
    } catch {
      flash("ค้นหาสถานที่ไม่สำเร็จ ลองอีกครั้ง");
    } finally {
      setSearching(false);
    }
  }

  // Picking a search result moves the pin and fills the address from that same
  // result, so no extra reverse lookup is needed.
  function pickHit(hit: PlaceHit) {
    geocodeToken.current += 1;
    const found = Object.fromEntries(
      Object.entries({ province: hit.province, district: hit.district, community: hit.community }).filter(
        ([, value]) => value,
      ),
    );
    patch({ latitude: hit.latitude, longitude: hit.longitude, locationMode: "map", ...found });
    setHits(null);
    setQuery(hit.label);
    flash(`ปักหมุดที่ ${hit.label} แล้ว`);
  }

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
        void autoFill(position.coords.latitude, position.coords.longitude);
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
    {
      label: "จังหวัด",
      value: province,
      options: PROVINCES,
      placeholder: "เช่น เชียงใหม่",
      onPick: (v: string) => patch({ province: v }),
    },
    {
      label: "อำเภอ / เขต",
      value: district,
      options: DISTRICTS,
      placeholder: "เช่น แม่ริม",
      onPick: (v: string) => patch({ district: v }),
    },
    {
      label: "ตำบล / ชุมชน",
      value: community,
      options: COMMUNITIES,
      placeholder: "เช่น บ้านแม่สาใหม่",
      onPick: (v: string) => patch({ community: v }),
    },
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
          ไม่บังคับ — ดึงพิกัด ค้นหาชื่อสถานที่ หรือปักหมุดเอง ระบบจะเติมที่อยู่ให้อัตโนมัติ แก้เองด้านล่างได้
        </div>

        <form onSubmit={runSearch} style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <input
            className="input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ค้นหาสถานที่ เช่น วัดพระธาตุดอยสุเทพ"
            style={{ flex: 1 }}
          />
          <button
            type="submit"
            className="btn btn-outline"
            disabled={searching || !query.trim()}
            style={{ flex: "none", padding: "0 16px", fontSize: 12 }}
          >
            {searching ? "กำลังค้นหา…" : "ค้นหา"}
          </button>
        </form>

        {hits?.length ? (
          <div
            style={{
              marginTop: 8,
              border: "1px solid var(--line-2)",
              borderRadius: 8,
              overflow: "hidden",
              background: "var(--surface)",
            }}
          >
            {hits.map((hit) => (
              <button
                key={`${hit.latitude},${hit.longitude}`}
                type="button"
                onClick={() => pickHit(hit)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  border: "none",
                  borderBottom: "1px solid var(--line)",
                  background: "transparent",
                  color: "var(--ink)",
                  fontSize: 11.5,
                  lineHeight: 1.6,
                  padding: "10px 12px",
                  cursor: "pointer",
                }}
              >
                {hit.label}
              </button>
            ))}
          </div>
        ) : null}

        {locationMode ? (
          <MapPicker
            latitude={latitude}
            longitude={longitude}
            interactive={locationMode === "map"}
            height={locationMode === "map" ? 200 : 110}
            caption={pinCaption}
            onPick={(position) => {
              patch({ latitude: position.lat, longitude: position.lng });
              void autoFill(position.lat, position.lng);
            }}
          />
        ) : null}

        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
          {selects.map((field) => (
            <ComboField
              key={field.label}
              label={field.label}
              value={field.value}
              options={field.options}
              placeholder={field.placeholder}
              hint={filling ? "กำลังเติมจากพิกัด…" : undefined}
              onChange={field.onPick}
            />
          ))}
        </div>
      </div>

      <WizardFooter onNext={() => router.push("/record/object")} />
    </>
  );
}
