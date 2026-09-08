export type PatternStatus = "draft" | "pending" | "published";
export type AlbumKind = "uploaded" | "saved";
export type UpdateStatus = "pending" | "accepted" | "rejected";

export type Crop = { x1: number; y1: number; x2: number; y2: number };

export type Profile = {
  id: string;
  display_name: string;
  role_title: string;
  avatar_path: string | null;
  created_at: string;
};

export type Pattern = {
  id: string;
  owner_id: string;
  status: PatternStatus;
  name: string | null;
  alt_name: string | null;
  description: string | null;
  meaning: string | null;
  feature: string | null;
  usage_context: string | null;
  source_type: string | null;
  source_type_other: string | null;
  object_name: string | null;
  object_type: string | null;
  object_owner: string | null;
  object_owner_unknown: boolean;
  occasion: string | null;
  province: string | null;
  district: string | null;
  community: string | null;
  latitude: number | null;
  longitude: number | null;
  location_mode: string | null;
  informant_type: string | null;
  informant_type_other: string | null;
  informant_name: string | null;
  informant_is_self: boolean;
  informant_portrait_path: string | null;
  photo_path: string | null;
  crop: Crop | null;
  line_art_path: string | null;
  line_weight: number;
  line_style: string;
  ink_color: string;
  export_format: string;
  export_background: string;
  export_size: string;
  license: string | null;
  tags: string[];
  saved_count: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

export type PatternInsert = Partial<Omit<Pattern, "id" | "created_at" | "updated_at">> & {
  owner_id: string;
};

export type Album = {
  id: string;
  owner_id: string;
  name: string;
  kind: AlbumKind;
  icon: string;
  created_at: string;
};

export type AlbumItem = { album_id: string; pattern_id: string; added_at: string };

export type SavedPattern = { user_id: string; pattern_id: string; created_at: string };

export type PatternUpdateSubmission = {
  id: string;
  target_pattern_id: string;
  submitted_by: string;
  fields: string[];
  payload: Record<string, unknown>;
  status: UpdateStatus;
  created_at: string;
};

type Table<Row, Insert = Row, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<Profile, Omit<Profile, "created_at" | "role_title"> & { role_title?: string }>;
      patterns: Table<Pattern, PatternInsert>;
      albums: Table<Album, Omit<Album, "id" | "created_at"> & { id?: string }>;
      album_items: Table<AlbumItem, Omit<AlbumItem, "added_at">>;
      saved_patterns: Table<SavedPattern, Omit<SavedPattern, "created_at">>;
      pattern_updates: Table<
        PatternUpdateSubmission,
        Omit<PatternUpdateSubmission, "id" | "created_at" | "status"> & { status?: UpdateStatus }
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      pattern_status: PatternStatus;
      album_kind: AlbumKind;
      update_status: UpdateStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
