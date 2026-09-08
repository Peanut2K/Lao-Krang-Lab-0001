"use client";

import { useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDismiss } from "@/components/Headers";
import { PROVINCES, SOURCE_TYPES, SRC_TO_OBJTYPE } from "@/lib/design";

const OBJECT_TYPES = Array.from(new Set(Object.values(SRC_TO_OBJTYPE)));

const FILTERS = [
  { key: "source", label: "กลุ่มลายที่พบ", options: [...SOURCE_TYPES] },
  { key: "province", label: "จังหวัด", options: PROVINCES },
  { key: "object", label: "ประเภทวัตถุ", options: OBJECT_TYPES },
];

const TABS = [
  { key: "all", label: "ทั้งหมด" },
  { key: "recent", label: "ล่าสุด" },
  { key: "popular", label: "ยอดนิยม" },
];

export function ExploreControls() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const filterBar = useRef<HTMLDivElement>(null);

  useDismiss(openFilter !== null, () => setOpenFilter(null), filterBar);

  function apply(changes: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    Object.entries(changes).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    router.replace(`${pathname}?${next.toString()}`);
  }

  const activeTab = params.get("tab") ?? "all";
  const hasFilters = FILTERS.some((filter) => params.get(filter.key)) || Boolean(params.get("q"));

  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          apply({ q: query.trim() || null });
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "var(--panel)",
          border: "1px solid rgba(42,42,38,.12)",
          borderRadius: 8,
          padding: "10px 12px",
        }}
      >
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onBlur={() => apply({ q: query.trim() || null })}
          placeholder="ค้นหาชื่อลาย จุดเด่น หรือพื้นที่"
          style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontSize: 12.5, color: "var(--ink)" }}
        />
        <button type="submit" aria-label="ค้นหา" style={{ border: "none", background: "transparent", fontSize: 13, color: "var(--ink-3)", cursor: "pointer" }}>
          ⚲
        </button>
      </form>

      <div ref={filterBar} style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 10, position: "relative" }}>
        {FILTERS.map((filter) => {
          const value = params.get(filter.key);
          return (
            <div key={filter.key} style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => setOpenFilter(openFilter === filter.key ? null : filter.key)}
                style={{
                  flex: "none",
                  fontSize: 11,
                  padding: "7px 11px",
                  borderRadius: 7,
                  cursor: "pointer",
                  border: `1px solid ${value ? "var(--green)" : "rgba(42,42,38,.16)"}`,
                  background: value ? "rgba(47,81,54,.08)" : "var(--surface)",
                  color: "var(--ink)",
                  whiteSpace: "nowrap",
                }}
              >
                {value ?? filter.label} ⌄
              </button>

              {openFilter === filter.key ? (
                <div
                  style={{
                    position: "absolute",
                    zIndex: 20,
                    top: "calc(100% + 6px)",
                    left: 0,
                    minWidth: 168,
                    background: "var(--surface)",
                    border: "1px solid rgba(42,42,38,.14)",
                    borderRadius: 9,
                    boxShadow: "0 8px 24px rgba(16,16,14,.16)",
                    padding: 6,
                    maxHeight: 260,
                    overflowY: "auto",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      apply({ [filter.key]: null });
                      setOpenFilter(null);
                    }}
                    style={optionStyle(!value)}
                  >
                    ทั้งหมด
                  </button>
                  {filter.options.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        apply({ [filter.key]: option });
                        setOpenFilter(null);
                      }}
                      style={optionStyle(value === option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
        <button
          type="button"
          className="icon-btn"
          aria-label="ล้างตัวกรองทั้งหมด"
          title="ล้างตัวกรองทั้งหมด"
          disabled={!hasFilters}
          style={{ marginLeft: "auto", fontSize: 13, color: hasFilters ? "var(--green)" : "#4A4A42" }}
          onClick={() => {
            setOpenFilter(null);
            setQuery("");
            apply({ source: null, province: null, object: null, q: null });
          }}
        >
          ⌫
        </button>
      </div>

      <div className="tabs" style={{ padding: "12px 0 8px", marginTop: 6 }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className="tab-btn"
            data-on={activeTab === tab.key}
            onClick={() => apply({ tab: tab.key === "all" ? null : tab.key })}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </>
  );
}

function optionStyle(on: boolean): React.CSSProperties {
  return {
    display: "block",
    width: "100%",
    textAlign: "left",
    border: "none",
    background: on ? "rgba(47,81,54,.08)" : "transparent",
    color: on ? "var(--green)" : "var(--ink)",
    fontSize: 11.5,
    padding: "8px 10px",
    borderRadius: 6,
    cursor: "pointer",
  };
}
