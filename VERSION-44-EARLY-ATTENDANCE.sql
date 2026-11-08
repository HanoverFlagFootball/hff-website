-- HFF Version 44 - Allow early attendance responses from Schedule & Results
-- Run once in Supabase SQL Editor after Version 40 attendance setup.
-- Attendance Opens still controls when an event appears in the dedicated Attendance section.
-- This update allows a guardian to record a response earlier from Schedule & Results.

create or replace function public.hff_set_attendance(check_event_id uuid, check_team_id uuid, check_player_id uuid, check_response text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'Sign in required'; end if;
  if check_response not in ('going','not_going') then raise exception 'Invalid attendance response'; end if;

  if not exists (
    select 1
    from public.hff_event_teams et
    join public.hff_events e on e.id=et.event_id
    where et.event_id=check_event_id and et.team_id=check_team_id and e.event_date >= current_date
  ) then raise exception 'This future event is not linked to this team'; end if;

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

grant execute on function public.hff_set_attendance(uuid,uuid,uuid,text) to authenticated;
