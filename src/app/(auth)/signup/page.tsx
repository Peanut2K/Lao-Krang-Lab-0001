"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/Icons";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const mismatch = confirm.length > 0 && confirm !== password;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (password !== confirm) {
      setError("รหัสผ่านทั้งสองช่องไม่ตรงกัน");
      return;
    }
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
    // With email confirmation switched off in Supabase, signUp already returns a
    // session. If the project still has it on, sign in with the same credentials
    // so the person lands in the app instead of waiting on an inbox.
    if (!data.session) {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(
          "สมัครสำเร็จแล้ว แต่เข้าสู่ระบบอัตโนมัติไม่ได้ — ปิด Confirm email ใน Supabase แล้วลองเข้าสู่ระบบอีกครั้ง",
        );
        setBusy(false);
        return;
      }
    }
    router.replace("/capture");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="fade-in" style={{ padding: "48px 24px 0" }}>
      <Logo size={40} title="คลังลวดลายไทย" />
      <div
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 21,
          fontWeight: 600,
          color: "var(--ink)",
          marginTop: 14,
        }}
      >
        สมัครสมาชิก
      </div>
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
        <label className="field">
          <span className="field-label">ยืนยันรหัสผ่านอีกครั้ง</span>
          <input
            className={`input${mismatch ? " invalid" : ""}`}
            type="password"
            autoComplete="new-password"
            minLength={6}
            required
            aria-invalid={mismatch}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          {mismatch ? (
            <span className="field-hint" style={{ color: "var(--err)" }}>
              รหัสผ่านทั้งสองช่องไม่ตรงกัน
            </span>
          ) : null}
        </label>
      </div>

      {error ? <div style={{ marginTop: 12, fontSize: 11, color: "var(--err)" }}>{error}</div> : null}

      <button
        type="submit"
        className="btn btn-primary"
        style={{ width: "100%", marginTop: 22 }}
        disabled={busy || mismatch}
      >
        {busy ? "กำลังสมัคร…" : "สมัครสมาชิก"}
      </button>

      <div style={{ marginTop: 16, fontSize: 11.5, color: "var(--ink-3)", textAlign: "center" }}>
        มีบัญชีแล้ว? <Link href="/login">เข้าสู่ระบบ</Link>
      </div>
    </form>
  );
}
