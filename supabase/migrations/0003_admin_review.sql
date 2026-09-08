-- Reviewer role: patterns are saved as 'pending' and nothing in the app could
-- move them to 'published', so the archive could never show anything.

alter table profiles add column if not exists is_admin boolean not null default false;

-- Used by the policies below. SECURITY DEFINER so the lookup is not itself
-- filtered by the profiles policies (which would recurse).
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select p.is_admin from public.profiles p where p.id = auth.uid()), false);
$$;

-- Reviewers see every pattern, not just published + their own.
drop policy if exists "published patterns readable, own patterns always" on patterns;
create policy "published patterns readable, own patterns always"
  on patterns for select to authenticated
  using (status = 'published' or owner_id = (select auth.uid()) or public.is_admin());

-- Reviewers may publish or send a record back; owners keep editing their own.
drop policy if exists "patterns updatable by owner" on patterns;
create policy "patterns updatable by owner"
  on patterns for update to authenticated
  using (owner_id = (select auth.uid()) or public.is_admin())
  with check (owner_id = (select auth.uid()) or public.is_admin());

-- Reviewers read and resolve submitted updates.
drop policy if exists "update submissions visible to author and pattern owner" on pattern_updates;
create policy "update submissions visible to author and pattern owner"
  on pattern_updates for select to authenticated
  using (
    submitted_by = (select auth.uid())
    or exists (select 1 from patterns p where p.id = target_pattern_id and p.owner_id = (select auth.uid()))
    or public.is_admin()
  );

drop policy if exists "update submissions resolvable by reviewer" on pattern_updates;
create policy "update submissions resolvable by reviewer"
  on pattern_updates for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Review queue: pending first, oldest first.
create index if not exists patterns_pending_idx
  on patterns (status, created_at) where status = 'pending';
