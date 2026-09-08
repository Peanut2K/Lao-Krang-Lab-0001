"use client";

import { APIProvider, Map, Marker, type MapMouseEvent } from "@vis.gl/react-google-maps";

const CHIANG_MAI = { lat: 18.7883, lng: 98.9853 };

export function MapPicker({
  latitude,
  longitude,
  interactive,
  height,
  caption,
  onPick,
}: {
  latitude: number | null;
  longitude: number | null;
  interactive: boolean;
  height: number;
  caption: string;
  onPick?: (position: { lat: number; lng: number }) => void;
}) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const center = latitude !== null && longitude !== null ? { lat: latitude, lng: longitude } : CHIANG_MAI;

  if (!apiKey) {
    return (
      <div
        style={{
          position: "relative",
          height,
          borderRadius: 7,
          marginTop: 10,
          overflow: "hidden",
          background: "repeating-linear-gradient(120deg,#E3E0D2 0 16px,#DAD6C6 16px 32px)",
        }}
      >
        <span
          style={{
            position: "absolute",
            left: "50%",
            top: "44%",
            transform: "translate(-50%,-50%)",
            width: 15,
            height: 15,
            borderRadius: "50%",
            background: "#B3402E",
            border: "3px solid var(--surface)",
          }}
        />
        <span
          style={{
            position: "absolute",
            left: 8,
            bottom: 7,
            fontSize: 9,
            color: "rgba(42,42,38,.6)",
            fontFamily: "ui-monospace,Menlo,monospace",
          }}
        >
          [ ตั้งค่า NEXT_PUBLIC_GOOGLE_MAPS_API_KEY เพื่อใช้แผนที่จริง ] {caption}
        </span>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", height, borderRadius: 7, marginTop: 10, overflow: "hidden" }}>
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={center}
          center={interactive ? undefined : center}
          defaultZoom={15}
          gestureHandling={interactive ? "greedy" : "none"}
          disableDefaultUI
          zoomControl={interactive}
          clickableIcons={false}
          onClick={(event: MapMouseEvent) => {
            const position = event.detail.latLng;
            if (interactive && position && onPick) onPick(position);
          }}
          style={{ width: "100%", height: "100%" }}
        >
          {latitude !== null && longitude !== null ? (
            <Marker
              position={{ lat: latitude, lng: longitude }}
              draggable={interactive}
              onDragEnd={(event) => {
                const position = event.latLng;
                if (position && onPick) onPick({ lat: position.lat(), lng: position.lng() });
              }}
            />
          ) : null}
        </Map>
      </APIProvider>
      <span
        style={{
          position: "absolute",
          left: 8,
          bottom: 7,
          fontSize: 9,
          color: "var(--ink)",
          background: "rgba(251,249,243,.85)",
          padding: "2px 6px",
          borderRadius: 4,
          fontFamily: "ui-monospace,Menlo,monospace",
        }}
      >
        {caption}
      </span>
    </div>
  );
}
