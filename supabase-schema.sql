-- Football Auction: minimal free Supabase setup
-- Run this in Supabase Dashboard -> SQL Editor.

create table if not exists public.auction_state (
  id text primary key,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.auction_state enable row level security;

drop policy if exists "auction state readable by everyone" on public.auction_state;
create policy "auction state readable by everyone"
on public.auction_state for select
to anon, authenticated
using (true);

drop policy if exists "auction state insertable by everyone" on public.auction_state;
create policy "auction state insertable by everyone"
on public.auction_state for insert
to anon, authenticated
with check (true);

drop policy if exists "auction state updatable by everyone" on public.auction_state;
create policy "auction state updatable by everyone"
on public.auction_state for update
to anon, authenticated
using (true)
with check (true);

insert into public.auction_state (id, state)
values (
  'main',
  '{"isSetupComplete":false,"managers":[],"players":[],"currentPlayer":null,"currentBid":0,"currentBidder":null,"bidIncrement":10,"auctionStarted":false,"auctionEnded":false}'::jsonb
)
on conflict (id) do nothing;

-- Realtime needs the table in the publication.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'auction_state'
  ) then
    alter publication supabase_realtime add table public.auction_state;
  end if;
end $$;

-- Public player-card images. The bucket is readable by everyone, while the
-- app uses the anon key to upload. This is intentionally simple for the MVP.
insert into storage.buckets (id, name, public)
values ('player-images', 'player-images', true)
on conflict (id) do update set public = true;

drop policy if exists "player images readable" on storage.objects;
create policy "player images readable"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'player-images');

drop policy if exists "player images uploadable" on storage.objects;
create policy "player images uploadable"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'player-images');

drop policy if exists "player images updatable" on storage.objects;
create policy "player images updatable"
on storage.objects for update
to anon, authenticated
using (bucket_id = 'player-images')
with check (bucket_id = 'player-images');

drop policy if exists "player images deletable" on storage.objects;
create policy "player images deletable"
on storage.objects for delete
to anon, authenticated
using (bucket_id = 'player-images');
