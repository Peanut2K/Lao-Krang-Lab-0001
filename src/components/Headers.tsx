"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BackIcon, MenuIcon, SearchIcon } from "./Icons";

const MENU_LINKS = [
  { href: "/capture", label: "บันทึกลายใหม่" },
  { href: "/gallery", label: "คลังของฉัน" },
  { href: "/explore", label: "สำรวจลวดลาย" },
  { href: "/profile", label: "โปรไฟล์" },
];

export function TabHeader({ title, isAdmin }: { title: string; isAdmin?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLSpanElement>(null);

  useDismiss(open, () => setOpen(false), wrap);

  return (
    <header className="header-tab">
      <span className="title">{title}</span>
      <span className="actions" ref={wrap}>
        <button type="button" className="icon-btn" aria-label="ค้นหาลวดลาย" onClick={() => router.push("/explore")}>
          <SearchIcon />
        </button>
        <button
          type="button"
          className="icon-btn"
          aria-label="เมนู"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <MenuIcon />
        </button>

        {open ? (
          <span className="menu-pop">
            {(isAdmin ? [...MENU_LINKS, { href: "/admin", label: "ตรวจสอบลวดลาย" }] : MENU_LINKS).map((link) => (
              <Link key={link.href} href={link.href} className="menu-item" onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
            <button
              type="button"
              className="menu-item"
              onClick={async () => {
                setOpen(false);
                await createClient().auth.signOut();
                router.replace("/login");
                router.refresh();
              }}
            >
              ออกจากระบบ
            </button>
          </span>
        ) : null}
      </span>
    </header>
  );
}

export function FlowHeader({ title, href }: { title: string; href?: string }) {
  const router = useRouter();
  return (
    <header className="header-flow">
      <button
        type="button"
        className="back"
        aria-label="ย้อนกลับ"
        onClick={() => (href ? router.push(href) : router.back())}
      >
        <BackIcon />
      </button>
      <span className="title">{title}</span>
      <span />
    </header>
  );
}

/** Close an open popover on outside click or Escape. */
export function useDismiss(
  open: boolean,
  close: () => void,
  ref: React.RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) close();
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close, ref]);
}
