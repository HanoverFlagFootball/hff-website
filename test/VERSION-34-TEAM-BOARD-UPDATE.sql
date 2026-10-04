-- Hanover Flag Football - Version 34 Team Board Update
-- Run once AFTER Version 31. Safe to run again if needed.
-- Allows any authenticated member of a team to create a Team Board post.

-- Remove the old coach-only insert policy.
drop policy if exists "Coaches can create announcements" on public.hff_team_announcements;

-- A connected guardian or team staff member may create a post for that team.
drop policy if exists "Team members can create announcements" on public.hff_team_announcements;
create policy "Team members can create announcements"
on public.hff_team_announcements for insert to authenticated
with check (
  author_user_id = auth.uid()
  and public.hff_is_team_member(team_id)
);

-- Let members delete their own posts; coaches can moderate any team post.
drop policy if exists "Coaches can delete announcements" on public.hff_team_announcements;
drop policy if exists "Members can delete own announcements and coaches can moderate" on public.hff_team_announcements;
create policy "Members can delete own announcements and coaches can moderate"
on public.hff_team_announcements for delete to authenticated
using (
  author_user_id = auth.uid()
  or public.hff_is_team_coach(team_id)
);

notify pgrst, 'reload schema';
