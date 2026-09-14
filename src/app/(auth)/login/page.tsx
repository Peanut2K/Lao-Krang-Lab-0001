"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Wordmark } from "@/components/Icons";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      setBusy(false);
      return;
    }
    router.replace(params.get("next") || "/capture");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="fade-in" style={{ padding: "48px 24px 0" }}>
      <Wordmark />
      <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 14, lineHeight: 1.7, maxWidth: "34ch" }}>
        บันทึกลวดลายจากชุมชน แกะลายเส้นด้วย AI และสืบค้นจากคลังกลาง
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 28 }}>
        <label className="field">
          <span className="field-label">อีเมล</span>
          <input
            className="input"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="field">
          <span className="field-label">รหัสผ่าน</span>
          <input
            className="input"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
      </div>

      {error ? (
        <div style={{ marginTop: 12, fontSize: 11, color: "var(--err)" }}>{error}</div>
      ) : null}

      <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: 22 }} disabled={busy}>
        {busy ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
      </button>

      <div style={{ marginTop: 16, fontSize: 11.5, color: "var(--ink-3)", textAlign: "center" }}>
        ยังไม่มีบัญชี? <Link href="/signup">สมัครสมาชิก</Link>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
