import { notFound, redirect } from "next/navigation";
import { thaiDate } from "@/lib/design";
import { publicUrl } from "@/lib/media";
import { createClient } from "@/lib/supabase/server";
import { PatternDetail } from "./PatternDetail";

export const dynamic = "force-dynamic";

export default async function PatternPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: pattern } = await supabase.from("patterns").select("*").eq("id", id).maybeSingle();
  if (!pattern) notFound();

  const [{ data: owner }, { data: saved }, { data: albums }] = await Promise.all([
    supabase.from("profiles").select("display_name").eq("id", pattern.owner_id).maybeSingle(),
    supabase
      .from("saved_patterns")
      .select("pattern_id")
      .eq("user_id", user.id)
      .eq("pattern_id", id)
      .maybeSingle(),
    supabase
      .from("albums")
      .select("id, name, album_items(pattern_id, patterns(photo_path))")
      .eq("owner_id", user.id)
      .order("created_at"),
  ]);

  let portraitUrl: string | null = null;
  if (pattern.informant_portrait_path) {
    const { data } = await supabase.storage
      .from("portraits")
      .createSignedUrl(pattern.informant_portrait_path, 60 * 60);
    portraitUrl = data?.signedUrl ?? null;
  }

  type AlbumRow = {
    id: string;
    name: string;
    album_items: { pattern_id: string; patterns: { photo_path: string | null } | null }[];
  };

  return (
    <PatternDetail
      pattern={pattern}
      ownerName={owner?.display_name ?? ""}
      isSaved={Boolean(saved)}
      photoUrl={publicUrl("pattern-photos", pattern.photo_path)}
      lineArtUrl={publicUrl("line-art", pattern.line_art_path)}
      portraitUrl={portraitUrl}
      recordedOn={thaiDate(pattern.created_at)}
      albums={((albums ?? []) as AlbumRow[]).map((album) => ({
        id: album.id,
        name: album.name,
        count: album.album_items?.length ?? 0,
        cover: publicUrl(
          "pattern-photos",
          album.album_items?.find((item) => item.patterns?.photo_path)?.patterns?.photo_path ?? null,
        ),
      }))}
    />
  );
}
