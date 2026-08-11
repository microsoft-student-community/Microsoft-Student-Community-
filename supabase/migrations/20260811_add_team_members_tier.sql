-- Public /team page groups members by tier (chief / board / member).
-- Live DB was missing this column (exists in full_schema.sql only).

alter table public.team_members
  add column if not exists tier text default 'member';

alter table public.team_members
  drop constraint if exists team_members_tier_check;

alter table public.team_members
  add constraint team_members_tier_check
  check (tier is null or tier in ('chief', 'president', 'board', 'lead', 'member'));

update public.team_members
set tier = 'member'
where tier is null;

create index if not exists team_members_tier_idx on public.team_members(tier);
