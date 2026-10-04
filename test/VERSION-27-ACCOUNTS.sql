-- Hanover Flag Football - Version 27 Accounts / My HFF
-- Run once in Supabase SQL Editor.
-- This does NOT delete or recreate any HFF data.

alter table public.hff_profiles enable row level security;
alter table public.hff_player_guardians enable row level security;
alter table public.hff_team_staff enable row level security;

drop policy if exists "Members can read own profile" on public.hff_profiles;
create policy "Members can read own profile" on public.hff_profiles for select to authenticated using (user_id = auth.uid());
drop policy if exists "Members can create own profile" on public.hff_profiles;
create policy "Members can create own profile" on public.hff_profiles for insert to authenticated with check (user_id = auth.uid() and lower(email) = lower(auth.jwt() ->> 'email'));
drop policy if exists "Members can update own profile" on public.hff_profiles;
create policy "Members can update own profile" on public.hff_profiles for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "Guardians can read own links" on public.hff_player_guardians;
create policy "Guardians can read own links" on public.hff_player_guardians for select to authenticated using (user_id = auth.uid() or lower(guardian_email) = lower(auth.jwt() ->> 'email'));
drop policy if exists "Guardians can claim matching email links" on public.hff_player_guardians;
create policy "Guardians can claim matching email links" on public.hff_player_guardians for update to authenticated using (user_id is null and lower(guardian_email) = lower(auth.jwt() ->> 'email')) with check (user_id = auth.uid() and lower(guardian_email) = lower(auth.jwt() ->> 'email'));

-- Existing hff_team_players and hff_teams access policies are left unchanged.
-- Those tables already power the current Teams/Schedule system.

drop policy if exists "Staff can read own links" on public.hff_team_staff;
create policy "Staff can read own links" on public.hff_team_staff for select to authenticated using (user_id = auth.uid() or lower(email) = lower(auth.jwt() ->> 'email'));
drop policy if exists "Staff can claim matching email links" on public.hff_team_staff;
create policy "Staff can claim matching email links" on public.hff_team_staff for update to authenticated using (user_id is null and lower(email) = lower(auth.jwt() ->> 'email')) with check (user_id = auth.uid() and lower(email) = lower(auth.jwt() ->> 'email'));

-- Players connected to the signed-in guardian may be read in My HFF.
drop policy if exists "Guardians can read their players" on public.hff_players;
create policy "Guardians can read their players" on public.hff_players for select to authenticated using (exists (select 1 from public.hff_player_guardians g where g.player_id=hff_players.id and g.user_id=auth.uid()));

notify pgrst, 'reload schema';
