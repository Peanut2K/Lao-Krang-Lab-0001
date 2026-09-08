import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InformantForm } from "./InformantForm";

export const dynamic = "force-dynamic";

export default async function InformantPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  return <InformantForm userId={user.id} userName={profile?.display_name ?? ""} />;
}
