"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/capture", label: "บันทึก", radius: "4px" },
  { href: "/gallery", label: "คลังของฉัน", radius: "3px" },
  { href: "/explore", label: "สำรวจ", radius: "50%" },
  { href: "/profile", label: "โปรไฟล์", radius: "50%" },
];

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="tabbar">
      {TABS.map((tab) => {
        const on = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link key={tab.href} href={tab.href} style={{ textDecoration: "none" }}>
            <button data-on={on} type="button" style={{ width: "100%" }}>
              <span className="glyph" style={{ borderRadius: tab.radius }} />
              <span className="label">{tab.label}</span>
            </button>
          </Link>
        );
      })}
    </nav>
  );
}
