-- Web Push: reviewers ask to be told when a pattern lands in the queue.
--
-- One row per browser, not per person: a reviewer who turns notifications on
-- for their phone and their laptop gets both, and the endpoint (unique per
-- browser + push service) is the natural key.

create table if not exists push_subscriptions (
  endpoint text primary key,
  user_id uuid not null references auth.users on delete cascade,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

create index if not exists push_subscriptions_user_idx on push_subscriptions (user_id);

alter table push_subscriptions enable row level security;

-- A subscription is a device credential, so it stays private to its owner. The
-- server reads every reviewer's row through the service role when it sends.
create policy "push subscriptions readable by owner"
  on push_subscriptions for select to authenticated
  using (user_id = (select auth.uid()));

create policy "push subscriptions writable by owner"
  on push_subscriptions for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "push subscriptions updatable by owner"
  on push_subscriptions for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "push subscriptions deletable by owner"
  on push_subscriptions for delete to authenticated
  using (user_id = (select auth.uid()));
