"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [checkEmail, setCheckEmail] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    if (authError) {
      setError(authError.message);
      setBusy(false);
      return;
    }
    if (!data.session) {
      setCheckEmail(true);
      setBusy(false);
      return;
    }
    router.replace("/capture");
    router.refresh();
  }

  if (checkEmail) {
    return (
      <div className="fade-in" style={{ padding: "64px 24px 0" }}>
        <div style={{ fontSize: 17, fontWeight: 600, color: "var(--ink)" }}>ยืนยันอีเมลของคุณ</div>
        <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 8, lineHeight: 1.8 }}>
          เราส่งลิงก์ยืนยันไปที่ {email} แล้ว เปิดลิงก์ในอีเมลเพื่อเริ่มใช้งานคลังลวดลาย
        </div>
        <div style={{ marginTop: 20, fontSize: 11.5 }}>
          <Link href="/login">กลับไปหน้าเข้าสู่ระบบ</Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="fade-in" style={{ padding: "48px 24px 0" }}>
      <div style={{ fontSize: 21, fontWeight: 600, color: "var(--ink)" }}>สมัครสมาชิก</div>
      <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 6, lineHeight: 1.7 }}>
        ชื่อที่กรอกจะแสดงเป็นชื่อผู้บันทึกลวดลายในคลัง
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 28 }}>
        <label className="field">
          <span className="field-label">ชื่อ-นามสกุล</span>
          <input
            className="input"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="เช่น กาลตาว วิจารณ์ปรีชา"
          />
        </label>
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
          <span className="field-label">รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)</span>
          <input
            className="input"
            type="password"
            autoComplete="new-password"
            minLength={6}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
      </div>

      {error ? <div style={{ marginTop: 12, fontSize: 11, color: "var(--err)" }}>{error}</div> : null}

      <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: 22 }} disabled={busy}>
        {busy ? "กำลังสมัคร…" : "สมัครสมาชิก"}
      </button>

      <div style={{ marginTop: 16, fontSize: 11.5, color: "var(--ink-3)", textAlign: "center" }}>
        มีบัญชีแล้ว? <Link href="/login">เข้าสู่ระบบ</Link>
      </div>
    </form>
  );
}
