-- Hanover Flag Football - Version 28 Guardian Access Requests
-- Run once in Supabase SQL Editor. Does not delete or replace existing HFF data.

create table if not exists public.hff_guardian_access_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  requester_user_id uuid not null references auth.users(id) on delete cascade,
  requester_email text not null,
  requester_name text,
  registration_email text not null,
  request_type text not null default 'find' check (request_type in ('find','invite')),
  player_ids uuid[],
  token_hash text not null unique,
  expires_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending','approved','expired','cancelled')),
  approved_at timestamptz
);

alter table public.hff_guardian_access_requests enable row level security;
-- Requests are created/read/approved only by the HFF backend using its service-role key.
notify pgrst, 'reload schema';
