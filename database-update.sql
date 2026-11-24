-- =====================================================================
-- Egerton Connect: database update
-- Photo approval, richer profiles, chat credits, 10-day request expiry,
-- 30-day retry after a decline, and moderator tools.
-- Run in Supabase > SQL Editor > New query > Snippet. It is safe to re-run.
-- =====================================================================

-- ---------- 0. Remove the pieces that are being replaced ----------
drop policy if exists "clear photos when allowed" on storage.objects;
drop policy if exists "signed-in see blurred photos" on storage.objects;
drop policy if exists "owner manages own photos" on storage.objects;
drop policy if exists "see approved photos" on storage.objects;

drop function if exists public.get_contact(uuid);
drop function if exists public.has_access();
drop function if exists public.get_app_status();
drop function if exists public.unlock_for_testing(uuid);
drop function if exists public.my_chats();

drop table if exists public.contact_views cascade;
drop table if exists public.subscriptions cascade;
drop table if exists public.unlocks cascade;
drop table if exists public.contacts cascade;

-- the old payments table (weekly/monthly plans) is replaced by credit purchases
do $$
begin
  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'payments' and column_name = 'plan') then
    drop table public.payments cascade;
  end if;
end
$$;

-- ---------- 1. Richer profiles ----------
alter table public.profiles drop constraint if exists photos_max_three;
alter table public.profiles drop column if exists photos;
alter table public.profiles drop column if exists blur_photos;

alter table public.profiles add column if not exists paused boolean not null default false;
alter table public.profiles add column if not exists looking_for text;
alter table public.profiles add column if not exists prompts jsonb not null default '[]'::jsonb;
alter table public.profiles add column if not exists vibe jsonb not null default '{}'::jsonb;
alter table public.profiles add column if not exists last_active timestamptz;

alter table public.profiles drop constraint if exists looking_for_values;
alter table public.profiles add constraint looking_for_values
  check (looking_for is null or looking_for in ('friends','dating','serious','open'));
alter table public.profiles drop constraint if exists prompts_max_three;
alter table public.profiles add constraint prompts_max_three
  check (jsonb_typeof(prompts) = 'array' and jsonb_array_length(prompts) <= 3);
alter table public.profiles drop constraint if exists interests_max_eight;
alter table public.profiles add constraint interests_max_eight check (cardinality(interests) <= 8);

-- ---------- 2. Settings, credits, payments ----------
create table if not exists public.app_settings (
  id int primary key default 1 check (id = 1),
  payments_enabled boolean not null default false
);
alter table public.app_settings add column if not exists daily_chat_limit int not null default 10;
alter table public.app_settings add column if not exists request_expiry_days int not null default 10;
alter table public.app_settings add column if not exists retry_after_decline_days int not null default 30;
alter table public.app_settings drop column if exists weekly_price;
alter table public.app_settings drop column if exists monthly_price;
alter table public.app_settings drop column if exists daily_view_limit;
insert into public.app_settings (id) values (1) on conflict (id) do nothing;

create table if not exists public.credit_packs (
  id text primary key,
  name text not null,
  price int not null,
  credits int not null,
  sort int not null default 0,
  active boolean not null default true
);
insert into public.credit_packs (id, name, price, credits, sort) values
  ('starter', 'Starter', 49, 5, 1),
  ('plus', 'Plus', 99, 12, 2)
on conflict (id) do nothing;

create table if not exists public.credit_ledger (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  delta int not null,
  reason text not null,
  ref text,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  pack_id text not null,
  credits int not null,
  amount int not null,
  phone text not null,
  status text not null default 'pending' check (status in ('pending','paid','failed')),
  checkout_id text,
  receipt text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

-- ---------- 3. Chats: new columns ----------
alter table public.conversations add column if not exists declined_at timestamptz;
alter table public.reports add column if not exists evidence jsonb;

-- ---------- 4. Photos, moderators, suspensions ----------
create table if not exists public.profile_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  path text not null unique,
  is_main boolean not null default false,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reject_reason text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid
);
create index if not exists profile_photos_user_idx on public.profile_photos (user_id);

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create table if not exists public.suspensions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  reason text,
  created_at timestamptz not null default now()
);

-- ---------- 5. Row level security ----------
alter table public.app_settings enable row level security;
alter table public.credit_packs enable row level security;
alter table public.credit_ledger enable row level security;
alter table public.payments enable row level security;
alter table public.profile_photos enable row level security;
alter table public.admins enable row level security;
alter table public.suspensions enable row level security;

drop policy if exists "read settings" on public.app_settings;
drop policy if exists "read packs" on public.credit_packs;
drop policy if exists "see own credits" on public.credit_ledger;
drop policy if exists "see own payments" on public.payments;
drop policy if exists "see photos" on public.profile_photos;
create policy "read settings" on public.app_settings for select to authenticated using (true);
create policy "read packs" on public.credit_packs for select to authenticated using (active);
create policy "see own credits" on public.credit_ledger for select to authenticated using (auth.uid() = user_id);
create policy "see own payments" on public.payments for select to authenticated using (auth.uid() = user_id);
-- (admins and suspensions have no policies: only the functions below can use them)

-- ---------- 6. Helper functions ----------
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid())
$$;

create or replace function public.is_suspended(u uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.suspensions where user_id = u)
$$;

create policy "see photos" on public.profile_photos for select to authenticated
  using (user_id = auth.uid() or public.is_admin()
         or (status = 'approved' and not public.blocked_either_way(user_id)));

-- Paused, blocked or suspended profiles are hidden from other members
drop policy if exists "read profiles" on public.profiles;
create policy "read profiles" on public.profiles for select to authenticated
  using (id = auth.uid()
         or (not paused and not public.blocked_either_way(id) and not public.is_suspended(id)));

create or replace function public.get_app_status()
returns json
language sql stable security definer set search_path = public
as $$
  select json_build_object(
    'payments_enabled', a.payments_enabled,
    'daily_chat_limit', a.daily_chat_limit,
    'request_days', a.request_expiry_days,
    'retry_days', a.retry_after_decline_days,
    'credits', coalesce((select sum(l.delta) from public.credit_ledger l where l.user_id = auth.uid()), 0),
    'packs', coalesce((select json_agg(json_build_object('id', k.id, 'name', k.name, 'price', k.price, 'credits', k.credits) order by k.sort)
                       from public.credit_packs k where k.active), '[]'::json),
    'is_admin', public.is_admin()
  ) from public.app_settings a where a.id = 1
$$;

create or replace function public.touch_active()
returns void
language sql volatile security definer set search_path = public
as $$
  update public.profiles set last_active = now()
  where id = auth.uid() and (last_active is null or last_active < now() - interval '30 minutes')
$$;

-- ---------- 7. Photo functions ----------
create or replace function public.add_photo(p_path text)
returns uuid
language plpgsql volatile security definer set search_path = public
as $$
declare me uuid := auth.uid(); n int; pid uuid; has_main boolean;
begin
  if me is null then raise exception 'not_signed_in'; end if;
  if p_path is null or left(p_path, char_length(me::text) + 1) <> me::text || '/' then
    raise exception 'bad_path';
  end if;
  select count(*) into n from public.profile_photos where user_id = me;
  if n >= 6 then raise exception 'photo_limit'; end if;
  select exists (select 1 from public.profile_photos where user_id = me and is_main) into has_main;
  insert into public.profile_photos (user_id, path, is_main) values (me, p_path, not has_main) returning id into pid;
  return pid;
end
$$;

create or replace function public.remove_photo(p_id uuid)
returns text
language plpgsql volatile security definer set search_path = public
as $$
declare me uuid := auth.uid(); r public.profile_photos;
begin
  delete from public.profile_photos where id = p_id and user_id = me returning * into r;
  if not found then raise exception 'unavailable'; end if;
  if r.is_main then
    update public.profile_photos set is_main = true
    where id = (select x.id from public.profile_photos x where x.user_id = me and x.status = 'approved' order by x.created_at limit 1);
  end if;
  return r.path;
end
$$;

create or replace function public.set_main_photo(p_id uuid)
returns void
language plpgsql volatile security definer set search_path = public
as $$
declare me uuid := auth.uid();
begin
  if not exists (select 1 from public.profile_photos where id = p_id and user_id = me and status = 'approved') then
    raise exception 'unavailable';
  end if;
  update public.profile_photos set is_main = (id = p_id) where user_id = me;
end
$$;

-- ---------- 8. Storage: private bucket, approved photos only ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', false, 2097152, array['image/jpeg'])
on conflict (id) do nothing;

create policy "owner manages own photos" on storage.objects for all to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "see approved photos" on storage.objects for select to authenticated
  using (bucket_id = 'photos' and (
    public.is_admin()
    or exists (select 1 from public.profile_photos pp
               where pp.path = name and pp.status = 'approved' and not public.blocked_either_way(pp.user_id))
  ));

-- ---------- 9. Browse ----------
create or replace function public.browse_profiles()
returns table (id uuid, nickname text, gender text, area text, looking_for text, bio text,
               interests text[], prompts jsonb, vibe jsonb, photos text[],
               last_active timestamptz, created_at timestamptz)
language sql stable security definer set search_path = public
as $$
  select p.id, p.nickname, p.gender, p.area, p.looking_for, p.bio, p.interests, p.prompts, p.vibe,
         ph.paths, p.last_active, p.created_at
  from public.profiles p
  join lateral (select array_agg(x.path order by x.is_main desc, x.created_at) as paths
                from public.profile_photos x
                where x.user_id = p.id and x.status = 'approved') ph on ph.paths is not null
  where auth.uid() is not null
    and not public.is_suspended(auth.uid())
    and p.id <> auth.uid()
    and not p.paused
    and not public.is_suspended(p.id)
    and not public.blocked_either_way(p.id)
    and p.gender = any (coalesce((select m.seeking from public.profiles m where m.id = auth.uid()), '{}'::text[]))
  order by (coalesce(jsonb_array_length(p.prompts), 0) + coalesce(cardinality(p.interests), 0) + cardinality(ph.paths)) desc,
           p.last_active desc nulls last
  limit 150
$$;

-- ---------- 10. Chats: credits, expiry, retry rules ----------
create or replace function public.start_chat(target uuid, first_message text)
returns uuid
language plpgsql volatile security definer set search_path = public
as $$
declare
  me uuid := auth.uid(); a uuid; b uuid; conv public.conversations; cfg public.app_settings;
  used int; bal int; existing boolean; msg text := btrim(coalesce(first_message, ''));
begin
  if me is null then raise exception 'not_signed_in'; end if;
  if public.is_suspended(me) then raise exception 'suspended'; end if;
  if target = me then raise exception 'unavailable'; end if;
  if char_length(msg) < 1 or char_length(msg) > 300 then raise exception 'bad_message'; end if;
  if public.blocked_either_way(target) or public.is_suspended(target)
     or not exists (select 1 from public.profiles p where p.id = target and not p.paused) then
    raise exception 'unavailable';
  end if;
  select * into cfg from public.app_settings where id = 1;
  a := least(me, target); b := greatest(me, target);
  select * into conv from public.conversations where user_a = a and user_b = b;
  existing := found;
  if existing then
    if conv.status = 'accepted' then return conv.id; end if;
    if conv.status = 'closed' then raise exception 'unavailable'; end if;
    if conv.status = 'pending' and conv.created_at > now() - make_interval(days => cfg.request_expiry_days) then
      if conv.initiator_id = me then raise exception 'already_sent'; end if;
      -- they asked me first: accepting and replying is free
      update public.conversations set status = 'accepted', last_message_at = now() where id = conv.id;
      insert into public.messages (conversation_id, sender_id, body) values (conv.id, me, msg);
      return conv.id;
    end if;
    if conv.status = 'declined' and conv.declined_at is not null
       and conv.declined_at > now() - make_interval(days => cfg.retry_after_decline_days) then
      raise exception 'declined';
    end if;
    -- otherwise the old request expired or the decline is old enough: a fresh request is allowed
  end if;
  select count(*) into used from public.conversations where initiator_id = me and created_at > now() - interval '1 day';
  if used >= cfg.daily_chat_limit then raise exception 'daily_limit'; end if;
  if cfg.payments_enabled then
    select coalesce(sum(delta), 0) into bal from public.credit_ledger where user_id = me;
    if bal < 1 then raise exception 'credits_required'; end if;
  end if;
  if existing then
    delete from public.messages where conversation_id = conv.id;
    update public.conversations
       set initiator_id = me, status = 'pending', created_at = now(), last_message_at = now(), declined_at = null
     where id = conv.id;
  else
    insert into public.conversations (user_a, user_b, initiator_id) values (a, b, me) returning * into conv;
  end if;
  insert into public.messages (conversation_id, sender_id, body) values (conv.id, me, msg);
  if cfg.payments_enabled then
    insert into public.credit_ledger (user_id, delta, reason, ref) values (me, -1, 'chat_request', conv.id::text);
  end if;
  return conv.id;
end
$$;

create or replace function public.send_message(conv uuid, body text)
returns void
language plpgsql volatile security definer set search_path = public
as $$
declare me uuid := auth.uid(); c public.conversations; msg text := btrim(coalesce(body, '')); recent int; other uuid;
begin
  if me is null then raise exception 'not_signed_in'; end if;
  if public.is_suspended(me) then raise exception 'suspended'; end if;
  select * into c from public.conversations where id = conv and me in (user_a, user_b);
  if not found or c.status <> 'accepted' then raise exception 'unavailable'; end if;
  other := case when c.user_a = me then c.user_b else c.user_a end;
  if public.blocked_either_way(other) then raise exception 'unavailable'; end if;
  if char_length(msg) < 1 or char_length(msg) > 1000 then raise exception 'bad_message'; end if;
  select count(*) into recent from public.messages where sender_id = me and created_at > now() - interval '1 minute';
  if recent >= 20 then raise exception 'slow_down'; end if;
  insert into public.messages (conversation_id, sender_id, body) values (conv, me, msg);
  update public.conversations set last_message_at = now() where id = conv;
end
$$;

create or replace function public.respond_chat(conv uuid, approve boolean)
returns void
language plpgsql volatile security definer set search_path = public
as $$
declare me uuid := auth.uid(); days int;
begin
  select request_expiry_days into days from public.app_settings where id = 1;
  update public.conversations
     set status = case when approve then 'accepted' else 'declined' end,
         declined_at = case when approve then null else now() end,
         last_message_at = now()
   where id = conv and status = 'pending' and me in (user_a, user_b) and initiator_id <> me
     and created_at > now() - make_interval(days => days);
  if not found then raise exception 'unavailable'; end if;
end
$$;

create or replace function public.my_chats()
returns table (id uuid, other_id uuid, other_name text, status text, initiated_by_me boolean,
               last_body text, last_at timestamptz, unread int, expires_at timestamptz)
language sql stable security definer set search_path = public
as $$
  select c.id,
         o.oid,
         coalesce(p.nickname, 'Member'),
         c.status,
         c.initiator_id = auth.uid(),
         (select m.body from public.messages m where m.conversation_id = c.id order by m.id desc limit 1),
         c.last_message_at,
         (select count(*)::int from public.messages m
           where m.conversation_id = c.id and m.sender_id <> auth.uid()
             and m.created_at > coalesce((select r.read_at from public.chat_reads r
                                           where r.conversation_id = c.id and r.user_id = auth.uid()), 'epoch'::timestamptz)),
         case when c.status = 'pending' then c.created_at + make_interval(days => s.request_expiry_days) end
  from public.conversations c
  cross join public.app_settings s
  cross join lateral (select case when c.user_a = auth.uid() then c.user_b else c.user_a end as oid) o
  left join public.profiles p on p.id = o.oid
  where s.id = 1
    and auth.uid() in (c.user_a, c.user_b)
    and c.status <> 'closed'
    and not (c.status = 'pending' and c.created_at < now() - make_interval(days => s.request_expiry_days))
    and not (c.status = 'declined' and (c.declined_at is null or c.declined_at < now() - make_interval(days => s.retry_after_decline_days)))
  order by c.last_message_at desc
$$;

-- ---------- 11. Moderator functions (only accounts listed in "admins") ----------
create or replace function public.admin_pending_photos()
returns table (id uuid, user_id uuid, path text, nickname text, created_at timestamptz)
language plpgsql stable security definer set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  return query
    select ph.id, ph.user_id, ph.path, coalesce(p.nickname, 'Member'), ph.created_at
    from public.profile_photos ph
    left join public.profiles p on p.id = ph.user_id
    where ph.status = 'pending'
    order by ph.created_at
    limit 100;
end
$$;

create or replace function public.admin_review_photo(p_id uuid, approve boolean, reason text)
returns void
language plpgsql volatile security definer set search_path = public
as $$
declare r public.profile_photos;
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  update public.profile_photos
     set status = case when approve then 'approved' else 'rejected' end,
         reject_reason = case when approve then null else left(coalesce(reason, ''), 120) end,
         reviewed_at = now(), reviewed_by = auth.uid()
   where id = p_id
   returning * into r;
  if not found then raise exception 'unavailable'; end if;
  if approve then
    if not exists (select 1 from public.profile_photos x where x.user_id = r.user_id and x.is_main) then
      update public.profile_photos set is_main = true where id = p_id;
    end if;
  elsif r.is_main then
    update public.profile_photos set is_main = false where id = p_id;
    update public.profile_photos set is_main = true
     where id = (select x.id from public.profile_photos x where x.user_id = r.user_id and x.status = 'approved' order by x.created_at limit 1);
  end if;
end
$$;

create or replace function public.admin_reports()
returns table (id uuid, created_at timestamptz, reporter_name text, reported_id uuid, reported_name text,
               reason text, details text, evidence jsonb, status text, suspended boolean)
language plpgsql stable security definer set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  return query
    select r.id, r.created_at, coalesce(a.nickname, 'Member'), r.reported_id, coalesce(b.nickname, 'Member'),
           r.reason, r.details, r.evidence, r.status, public.is_suspended(r.reported_id)
    from public.reports r
    left join public.profiles a on a.id = r.reporter_id
    left join public.profiles b on b.id = r.reported_id
    order by (r.status = 'open') desc, r.created_at desc
    limit 100;
end
$$;

create or replace function public.admin_resolve_report(p_id uuid)
returns void
language plpgsql volatile security definer set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  update public.reports set status = 'resolved' where id = p_id;
end
$$;

create or replace function public.admin_set_suspended(target uuid, flag boolean, why text)
returns void
language plpgsql volatile security definer set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  if flag then
    insert into public.suspensions (user_id, reason) values (target, left(coalesce(why, ''), 200))
    on conflict (user_id) do nothing;
  else
    delete from public.suspensions where user_id = target;
  end if;
end
$$;

create or replace function public.admin_grant_credits(target uuid, n int)
returns void
language plpgsql volatile security definer set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  insert into public.credit_ledger (user_id, delta, reason, ref) values (target, n, 'grant', auth.uid()::text);
end
$$;

-- ---------- 12. Who can call what ----------
revoke all on function public.is_admin() from public, anon;
revoke all on function public.is_suspended(uuid) from public, anon;
revoke all on function public.get_app_status() from public, anon;
revoke all on function public.touch_active() from public, anon;
revoke all on function public.add_photo(text) from public, anon;
revoke all on function public.remove_photo(uuid) from public, anon;
revoke all on function public.set_main_photo(uuid) from public, anon;
revoke all on function public.browse_profiles() from public, anon;
revoke all on function public.start_chat(uuid, text) from public, anon;
revoke all on function public.send_message(uuid, text) from public, anon;
revoke all on function public.respond_chat(uuid, boolean) from public, anon;
revoke all on function public.my_chats() from public, anon;
revoke all on function public.admin_pending_photos() from public, anon;
revoke all on function public.admin_review_photo(uuid, boolean, text) from public, anon;
revoke all on function public.admin_reports() from public, anon;
revoke all on function public.admin_resolve_report(uuid) from public, anon;
revoke all on function public.admin_set_suspended(uuid, boolean, text) from public, anon;
revoke all on function public.admin_grant_credits(uuid, int) from public, anon;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_suspended(uuid) to authenticated;
grant execute on function public.get_app_status() to authenticated;
grant execute on function public.touch_active() to authenticated;
grant execute on function public.add_photo(text) to authenticated;
grant execute on function public.remove_photo(uuid) to authenticated;
grant execute on function public.set_main_photo(uuid) to authenticated;
grant execute on function public.browse_profiles() to authenticated;
grant execute on function public.start_chat(uuid, text) to authenticated;
grant execute on function public.send_message(uuid, text) to authenticated;
grant execute on function public.respond_chat(uuid, boolean) to authenticated;
grant execute on function public.my_chats() to authenticated;
grant execute on function public.admin_pending_photos() to authenticated;
grant execute on function public.admin_review_photo(uuid, boolean, text) to authenticated;
grant execute on function public.admin_reports() to authenticated;
grant execute on function public.admin_resolve_report(uuid) to authenticated;
grant execute on function public.admin_set_suspended(uuid, boolean, text) to authenticated;
grant execute on function public.admin_grant_credits(uuid, int) to authenticated;

-- Makes Supabase notice the new columns and functions right away
notify pgrst, 'reload schema';

-- =====================================================================
-- AFTER the script above succeeds, make yourself a moderator by running
-- this on its own, with YOUR login email in place of the example:
--
--   insert into public.admins (user_id)
--   select id from auth.users where email = 'your-email@example.com'
--   on conflict do nothing;
-- =====================================================================
