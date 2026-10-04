-- Hanover Flag Football - Version 31 Team Announcements
-- Run once in Supabase SQL Editor. This does not delete or replace existing HFF data.

create table if not exists public.hff_team_announcements (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.hff_teams(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  body text not null check (char_length(body) between 1 and 4000),
  author_user_id uuid not null references auth.users(id) on delete cascade,
  author_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.hff_team_announcement_comments (
  id uuid primary key default gen_random_uuid(),
  announcement_id uuid not null references public.hff_team_announcements(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  author_user_id uuid not null references auth.users(id) on delete cascade,
  author_name text,
  created_at timestamptz not null default now()
);

alter table public.hff_team_announcements enable row level security;
alter table public.hff_team_announcement_comments enable row level security;

-- SECURITY DEFINER helpers avoid exposing other families' guardian/staff records while
-- still allowing Supabase to answer the simple question: is this user on this team?
create or replace function public.hff_is_team_member(check_team_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    exists (
      select 1 from public.hff_team_staff s
      where s.team_id = check_team_id and s.user_id = auth.uid()
    )
    or exists (
      select 1
      from public.hff_team_players tp
      join public.hff_player_guardians g on g.player_id = tp.player_id
      where tp.team_id = check_team_id
        and coalesce(tp.active,true) = true
        and g.user_id = auth.uid()
    );
$$;

create or replace function public.hff_is_team_coach(check_team_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.hff_team_staff s
    where s.team_id = check_team_id
      and s.user_id = auth.uid()
      and s.role in ('coach','assistant_coach')
  );
$$;

grant execute on function public.hff_is_team_member(uuid) to authenticated;
grant execute on function public.hff_is_team_coach(uuid) to authenticated;

-- Announcements: all team members can read; only coaches can create/change/delete.
drop policy if exists "Team members can read announcements" on public.hff_team_announcements;
create policy "Team members can read announcements"
on public.hff_team_announcements for select to authenticated
using (public.hff_is_team_member(team_id));

drop policy if exists "Coaches can create announcements" on public.hff_team_announcements;
create policy "Coaches can create announcements"
on public.hff_team_announcements for insert to authenticated
with check (author_user_id = auth.uid() and public.hff_is_team_coach(team_id));

drop policy if exists "Coaches can update announcements" on public.hff_team_announcements;
create policy "Coaches can update announcements"
on public.hff_team_announcements for update to authenticated
using (public.hff_is_team_coach(team_id))
with check (public.hff_is_team_coach(team_id));

drop policy if exists "Coaches can delete announcements" on public.hff_team_announcements;
create policy "Coaches can delete announcements"
on public.hff_team_announcements for delete to authenticated
using (public.hff_is_team_coach(team_id));

-- Comments: team members can read and add comments. Coaches can remove any comment;
-- a member can remove their own comment.
drop policy if exists "Team members can read announcement comments" on public.hff_team_announcement_comments;
create policy "Team members can read announcement comments"
on public.hff_team_announcement_comments for select to authenticated
using (
  exists (
    select 1 from public.hff_team_announcements a
    where a.id = announcement_id and public.hff_is_team_member(a.team_id)
  )
);

drop policy if exists "Team members can create announcement comments" on public.hff_team_announcement_comments;
create policy "Team members can create announcement comments"
on public.hff_team_announcement_comments for insert to authenticated
with check (
  author_user_id = auth.uid()
  and exists (
    select 1 from public.hff_team_announcements a
    where a.id = announcement_id and public.hff_is_team_member(a.team_id)
  )
);

drop policy if exists "Members can delete own comments and coaches can moderate" on public.hff_team_announcement_comments;
create policy "Members can delete own comments and coaches can moderate"
on public.hff_team_announcement_comments for delete to authenticated
using (
  author_user_id = auth.uid()
  or exists (
    select 1 from public.hff_team_announcements a
    where a.id = announcement_id and public.hff_is_team_coach(a.team_id)
  )
);

create index if not exists hff_team_announcements_team_created_idx
  on public.hff_team_announcements(team_id, created_at desc);
create index if not exists hff_team_announcement_comments_announcement_created_idx
  on public.hff_team_announcement_comments(announcement_id, created_at);

notify pgrst, 'reload schema';
