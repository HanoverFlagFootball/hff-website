-- Hanover Flag Football - Version 34 Team Board Display Names (corrected)
-- Safe to run after the earlier Version 34 display-name SQL failed.

alter table public.hff_profiles
  add column if not exists first_name text,
  add column if not exists last_name text;

-- Backfill names from the existing Supabase Auth metadata used when HFF accounts are created.
update public.hff_profiles p
set
  first_name = coalesce(nullif(trim(p.first_name), ''), nullif(trim(u.raw_user_meta_data ->> 'first_name'), '')),
  last_name  = coalesce(nullif(trim(p.last_name), ''), nullif(trim(u.raw_user_meta_data ->> 'last_name'), ''))
from auth.users u
where u.id = p.user_id;

create or replace function public.hff_team_display_names(
  check_team_id uuid,
  check_user_ids uuid[]
)
returns table(user_id uuid, display_name text)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.user_id,
    case
      when nullif(trim(p.first_name), '') is null then 'Team member'
      when nullif(trim(p.last_name), '') is null then trim(p.first_name)
      else trim(p.first_name) || ' ' || upper(left(trim(p.last_name), 1)) || '.'
    end as display_name
  from public.hff_profiles p
  where public.hff_is_team_member(check_team_id)
    and p.user_id = any(check_user_ids)
    and (
      exists (
        select 1 from public.hff_team_staff s
        where s.team_id = check_team_id and s.user_id = p.user_id
      )
      or exists (
        select 1
        from public.hff_team_players tp
        join public.hff_player_guardians g on g.player_id = tp.player_id
        where tp.team_id = check_team_id
          and coalesce(tp.active, true) = true
          and g.user_id = p.user_id
      )
    );
$$;

grant execute on function public.hff_team_display_names(uuid, uuid[]) to authenticated;
notify pgrst, 'reload schema';
