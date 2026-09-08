"use client";

import { useRouter } from "next/navigation";

export function TabHeader({ title }: { title: string }) {
  return (
    <header className="header-tab">
      <span className="title">{title}</span>
      <span className="actions">🔍 ☰</span>
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
        ‹
      </button>
      <span className="title">{title}</span>
      <span />
    </header>
  );
}
