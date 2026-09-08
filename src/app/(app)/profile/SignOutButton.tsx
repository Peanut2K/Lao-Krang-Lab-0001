"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      className="btn btn-outline"
      style={{ width: "100%", marginTop: 12, fontSize: 12 }}
      onClick={async () => {
        await createClient().auth.signOut();
        router.replace("/login");
        router.refresh();
      }}
    >
      ออกจากระบบ
    </button>
  );
}
