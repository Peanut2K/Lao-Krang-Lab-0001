-- Indexes matching the queries the app actually runs.
-- 0001 indexed (owner_id, status, updated_at) and (status, published_at), but the
-- gallery/profile/explore screens sort by created_at and saved_count, so those
-- sorts fell back to a heap scan + sort on every page load.

-- gallery grid + profile recent list: owner's patterns, newest first.
-- Also serves the owner_id/status count queries (leftmost columns).
create index if not exists patterns_owner_created_idx
  on patterns (owner_id, status, created_at desc);

-- explore "ล่าสุด" default tab: published, newest first.
create index if not exists patterns_published_created_idx
  on patterns (status, created_at desc)
  where status = 'published';

-- explore "ยอดนิยม" tab: published, most-saved first.
create index if not exists patterns_published_saved_idx
  on patterns (status, saved_count desc)
  where status = 'published';

-- explore facet filters, each combined with status = 'published'.
create index if not exists patterns_province_idx
  on patterns (province) where status = 'published' and province is not null;
create index if not exists patterns_object_type_idx
  on patterns (object_type) where status = 'published' and object_type is not null;
create index if not exists patterns_source_type_idx
  on patterns (source_type) where status = 'published' and source_type is not null;

-- pattern detail page: "is this one saved by me?" — the PK is (user_id, pattern_id)
-- so the reverse lookup for the saved_count trigger had no index.
create index if not exists saved_patterns_pattern_idx
  on saved_patterns (pattern_id);

-- album grid: items of an album, newest first.
create index if not exists album_items_album_added_idx
  on album_items (album_id, added_at desc);

-- explore free-text search uses ILIKE '%…%', which no btree can serve.
-- pg_trgm makes those leading-wildcard matches indexable.
create extension if not exists pg_trgm;

-- One per column: the query ORs five separate `col ilike '%q%'` terms, and a
-- concatenated expression index would only match a query written the same way.
create index if not exists patterns_name_trgm_idx on patterns using gin (name gin_trgm_ops);
create index if not exists patterns_desc_trgm_idx on patterns using gin (description gin_trgm_ops);
create index if not exists patterns_province_trgm_idx on patterns using gin (province gin_trgm_ops);
create index if not exists patterns_district_trgm_idx on patterns using gin (district gin_trgm_ops);
create index if not exists patterns_community_trgm_idx on patterns using gin (community gin_trgm_ops);
