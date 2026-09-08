"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FlowHeader } from "@/components/Headers";
import { STEP_TITLES } from "@/lib/design";
import { stepFromPathname } from "@/lib/flow";
import { useWizard, useWizardHydrated } from "@/state/wizard";

export default function RecordLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useWizardHydrated();
  const photoPath = useWizard((state) => state.photoPath);
  const step = stepFromPathname(pathname);

  useEffect(() => {
    if (hydrated && !photoPath) router.replace("/capture");
  }, [hydrated, photoPath, router]);

  return (
    <>
      <FlowHeader title={step ? STEP_TITLES[step] ?? "" : ""} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", paddingBottom: 86 }}>
        {hydrated ? children : <div className="note" style={{ padding: "40px 16px" }}>กำลังโหลดข้อมูลที่บันทึกไว้…</div>}
      </div>
    </>
  );
}
