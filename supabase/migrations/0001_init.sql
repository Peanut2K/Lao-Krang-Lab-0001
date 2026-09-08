-- Lai Thai Archive — initial schema
-- Run with: supabase db push   (or paste into the SQL editor of your project)

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- enums

create type pattern_status as enum ('draft', 'pending', 'published');
create type album_kind as enum ('uploaded', 'saved');
create type update_status as enum ('pending', 'accepted', 'rejected');

-- ---------------------------------------------------------------- profiles

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text not null,
  role_title text not null default 'นักถ่ายภาพ / นักสืบลาย',
  avatar_path text,
  created_at timestamptz not null default now()
);

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------- patterns

create table patterns (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles (id) on delete cascade,
  status pattern_status not null default 'draft',

  -- ข้อมูลลวดลาย
  name text,
  alt_name text,
  description text,
  meaning text,
  feature text,
  usage_context text,

  -- ประเภทแหล่งที่มา / วัตถุ
  source_type text,
  source_type_other text,
  object_name text,
  object_type text,
  object_owner text,
  object_owner_unknown boolean not null default false,
  occasion text,

  -- ข้อมูลพื้นที่
  province text,
  district text,
  community text,
  latitude double precision,
  longitude double precision,
  location_mode text,

  -- ผู้ให้ข้อมูล
  informant_type text,
  informant_type_other text,
  informant_name text,
  informant_is_self boolean not null default false,
  informant_portrait_path text,

  -- ภาพและลายเส้น
  photo_path text,
  crop jsonb,
  line_art_path text,
  line_weight smallint not null default 3,
  line_style text not null default 'เส้นเดี่ยว',
  ink_color text not null default '#1B1B18',

  -- ไฟล์ส่งออก
  export_format text not null default 'SVG',
  export_background text not null default 'ไม่มีพื้น',
  export_size text not null default 'ใหญ่',

  license text,
  tags text[] not null default '{}',
  saved_count integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create index patterns_owner_idx on patterns (owner_id, status, updated_at desc);
create index patterns_public_idx on patterns (status, published_at desc);
create index patterns_search_idx on patterns using gin (
  to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' ||
    coalesce(province, '') || ' ' || coalesce(district, '') || ' ' || coalesce(community, ''))
);

create function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger patterns_touch before update on patterns
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------- albums

create table albums (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles (id) on delete cascade,
  name text not null,
  kind album_kind not null default 'uploaded',
  icon text not null default '✦',
  created_at timestamptz not null default now()
);

create index albums_owner_idx on albums (owner_id, created_at);

create table album_items (
  album_id uuid not null references albums (id) on delete cascade,
  pattern_id uuid not null references patterns (id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (album_id, pattern_id)
);

-- ---------------------------------------------------------------- saved (♥)

create table saved_patterns (
  user_id uuid not null references profiles (id) on delete cascade,
  pattern_id uuid not null references patterns (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, pattern_id)
);

create function public.sync_saved_count() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update patterns set saved_count = saved_count + 1 where id = new.pattern_id;
  elsif tg_op = 'DELETE' then
    update patterns set saved_count = greatest(saved_count - 1, 0) where id = old.pattern_id;
  end if;
  return null;
end;
$$;

create trigger saved_patterns_count
  after insert or delete on saved_patterns
  for each row execute function public.sync_saved_count();

-- ---------------------------------------------------------------- update submissions
-- "อัพเดทข้อมูล" — contributions sent into an existing pattern, held for review.

create table pattern_updates (
  id uuid primary key default gen_random_uuid(),
  target_pattern_id uuid not null references patterns (id) on delete cascade,
  submitted_by uuid not null references profiles (id) on delete cascade,
  fields text[] not null default '{}',
  payload jsonb not null default '{}'::jsonb,
  status update_status not null default 'pending',
  created_at timestamptz not null default now()
);

create index pattern_updates_target_idx on pattern_updates (target_pattern_id, status);

-- ---------------------------------------------------------------- RLS

alter table profiles enable row level security;
alter table patterns enable row level security;
alter table albums enable row level security;
alter table album_items enable row level security;
alter table saved_patterns enable row level security;
alter table pattern_updates enable row level security;

create policy "profiles readable by signed-in users"
  on profiles for select to authenticated using (true);
create policy "profiles updatable by owner"
  on profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "published patterns readable, own patterns always"
  on patterns for select to authenticated
  using (status = 'published' or owner_id = (select auth.uid()));
create policy "patterns insertable by owner"
  on patterns for insert to authenticated with check (owner_id = (select auth.uid()));
create policy "patterns updatable by owner"
  on patterns for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "patterns deletable by owner"
  on patterns for delete to authenticated using (owner_id = (select auth.uid()));

create policy "albums owned"
  on albums for all to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));

create policy "album items follow album ownership"
  on album_items for all to authenticated
  using (exists (select 1 from albums a where a.id = album_id and a.owner_id = (select auth.uid())))
  with check (exists (select 1 from albums a where a.id = album_id and a.owner_id = (select auth.uid())));

create policy "saved patterns owned"
  on saved_patterns for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "update submissions insertable by author"
  on pattern_updates for insert to authenticated with check (submitted_by = (select auth.uid()));
create policy "update submissions visible to author and pattern owner"
  on pattern_updates for select to authenticated
  using (
    submitted_by = (select auth.uid())
    or exists (select 1 from patterns p where p.id = target_pattern_id and p.owner_id = (select auth.uid()))
  );

-- ---------------------------------------------------------------- storage

insert into storage.buckets (id, name, public)
values ('pattern-photos', 'pattern-photos', true), ('line-art', 'line-art', true)
on conflict (id) do nothing;

-- Portraits identify real people, so they are private and served through signed URLs.
insert into storage.buckets (id, name, public)
values ('portraits', 'portraits', false)
on conflict (id) do nothing;

create policy "pattern media readable by anyone"
  on storage.objects for select
  using (bucket_id in ('pattern-photos', 'line-art'));

create policy "portraits readable by signed-in users"
  on storage.objects for select to authenticated
  using (bucket_id = 'portraits');

create policy "media writable in own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id in ('pattern-photos', 'line-art', 'portraits')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "media updatable in own folder"
  on storage.objects for update to authenticated
  using (
    bucket_id in ('pattern-photos', 'line-art', 'portraits')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "media deletable in own folder"
  on storage.objects for delete to authenticated
  using (
    bucket_id in ('pattern-photos', 'line-art', 'portraits')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
