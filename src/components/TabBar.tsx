"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CaptureIcon, ExploreIcon, GalleryIcon, ProfileIcon } from "./Icons";

const TABS = [
  { href: "/capture", label: "บันทึก", Icon: CaptureIcon },
  { href: "/gallery", label: "คลังของฉัน", Icon: GalleryIcon },
  { href: "/explore", label: "สำรวจ", Icon: ExploreIcon },
  { href: "/profile", label: "โปรไฟล์", Icon: ProfileIcon },
];

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="tabbar">
      {TABS.map(({ href, label, Icon }) => {
        const on = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link key={href} href={href} data-on={on} aria-current={on ? "page" : undefined}>
            <span className="glyph">
              <Icon size={21} />
            </span>
            <span className="label">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
