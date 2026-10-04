-- HFF Version 40 - Attendance confirmations
-- Run once in Supabase SQL Editor before testing Version 40.

alter table public.hff_events
  add column if not exists attendance_open_date date;

create table if not exists public.hff_event_attendance (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.hff_events(id) on delete cascade,
  team_id uuid not null references public.hff_teams(id) on delete cascade,
  player_id uuid not null references public.hff_players(id) on delete cascade,
  response text not null check (response in ('going','not_going')),
  responded_by uuid not null references auth.users(id) on delete cascade,
  responded_at timestamptz not null default now(),
  unique(event_id,team_id,player_id)
);

alter table public.hff_event_attendance enable row level security;

-- Direct table access is intentionally not required by the player page.
-- These RPCs validate team membership/guardian access and keep attendance team-private.
create or replace function public.hff_team_attendance(check_event_id uuid, check_team_id uuid)
returns table(player_id uuid, player_name text, response text, responded_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'Sign in required'; end if;

  if not exists (
    select 1
    from public.hff_event_teams et
    where et.event_id=check_event_id and et.team_id=check_team_id
  ) then raise exception 'Event is not linked to this team'; end if;

  if not (
    exists (
      select 1 from public.hff_team_staff s
      where s.team_id=check_team_id and s.user_id=auth.uid()
    )
    or exists (
      select 1
      from public.hff_team_players tp
      join public.hff_player_guardians pg on pg.player_id=tp.player_id
      where tp.team_id=check_team_id and tp.active is not false and pg.user_id=auth.uid()
    )
  ) then raise exception 'Not connected to this team'; end if;

  return query
  select p.id,
         trim(coalesce(p.first_name,'') || ' ' || coalesce(p.last_name,''))::text,
         a.response,
         a.responded_at
  from public.hff_team_players tp
  join public.hff_players p on p.id=tp.player_id
  left join public.hff_event_attendance a
    on a.event_id=check_event_id and a.team_id=check_team_id and a.player_id=p.id
  where tp.team_id=check_team_id and tp.active is not false
  order by p.first_name,p.last_name;
end;
$$;

create or replace function public.hff_set_attendance(check_event_id uuid, check_team_id uuid, check_player_id uuid, check_response text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare open_date date;
begin
  if auth.uid() is null then raise exception 'Sign in required'; end if;
  if check_response not in ('going','not_going') then raise exception 'Invalid attendance response'; end if;

  select e.attendance_open_date into open_date
  from public.hff_events e
  join public.hff_event_teams et on et.event_id=e.id
  where e.id=check_event_id and et.team_id=check_team_id;

  if not found then raise exception 'Event is not linked to this team'; end if;
  if open_date is null or current_date < open_date then raise exception 'Attendance is not open for this event'; end if;

  if not exists (
    select 1 from public.hff_player_guardians pg
    join public.hff_team_players tp on tp.player_id=pg.player_id
    where pg.user_id=auth.uid() and pg.player_id=check_player_id
      and tp.team_id=check_team_id and tp.active is not false
  ) then raise exception 'You cannot set attendance for this player'; end if;

  insert into public.hff_event_attendance(event_id,team_id,player_id,response,responded_by,responded_at)
  values(check_event_id,check_team_id,check_player_id,check_response,auth.uid(),now())
  on conflict(event_id,team_id,player_id)
  do update set response=excluded.response,responded_by=excluded.responded_by,responded_at=excluded.responded_at;
end;
$$;

grant execute on function public.hff_team_attendance(uuid,uuid) to authenticated;
grant execute on function public.hff_set_attendance(uuid,uuid,uuid,text) to authenticated;
