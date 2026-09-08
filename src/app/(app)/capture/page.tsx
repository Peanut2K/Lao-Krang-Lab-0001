import { redirect } from "next/navigation";
import { createClient, getUser } from "@/lib/supabase/server";
import { publicUrl } from "@/lib/media";
import { CameraScreen } from "./CameraScreen";

export const dynamic = "force-dynamic";

export default async function CapturePage() {
  const [supabase, user] = await Promise.all([createClient(), getUser()]);
  if (!user) redirect("/login");

  const { data: recent } = await supabase
    .from("patterns")
    .select("id, name, photo_path, created_at")
    .eq("owner_id", user.id)
    .not("photo_path", "is", null)
    .order("created_at", { ascending: false })
    .limit(5);

  const recentPhotos = (recent ?? []).map((row, index) => ({
    id: row.id,
    name: row.name || `ภาพที่ ${index + 1}`,
    path: row.photo_path as string,
    url: publicUrl("pattern-photos", row.photo_path) ?? "",
  }));

  return <CameraScreen userId={user.id} recentPhotos={recentPhotos} />;
}
