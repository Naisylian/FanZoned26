-- WorldCupPulse Database Schema
-- Safe to re-run: drops everything and rebuilds cleanly

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- DROP EXISTING TABLES (safe re-run)
-- ============================================
drop table if exists public.bracket_slots cascade;
drop table if exists public.leaderboard cascade;
drop table if exists public.team_stats cascade;
drop table if exists public.predictions cascade;
drop table if exists public.chat_messages cascade;
drop table if exists public.user_teams cascade;
drop table if exists public.profiles cascade;
drop table if exists public.matches cascade;
drop table if exists public.teams cascade;

-- Drop trigger on auth.users (not dropped by table cascade above)
drop trigger if exists on_auth_user_created on auth.users;
-- Note: profiles_updated_at trigger is dropped automatically by CASCADE on profiles table

-- Drop functions
drop function if exists public.handle_new_user() cascade;
drop function if exists public.update_updated_at() cascade;

-- ============================================
-- TEAMS TABLE
-- ============================================
create table public.teams (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  code text not null unique,
  flag_emoji text not null,
  group_id text not null,
  status text not null default 'active',       -- active | eliminated
  stage_reached text default 'group',           -- group | r32 | r16 | qf | sf | final | winner
  created_at timestamptz default now()
);

-- ============================================
-- MATCHES TABLE
-- ============================================
create table public.matches (
  id uuid primary key default uuid_generate_v4(),
  home_team_id uuid references public.teams(id),
  away_team_id uuid references public.teams(id),
  home_score integer,
  away_score integer,
  stage text not null,       -- group | r32 | r16 | qf | sf | final
  group_id text,
  match_date timestamptz not null,
  status text not null default 'scheduled',    -- scheduled | live | finished
  venue text,
  created_at timestamptz default now()
);

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  avatar_url text,
  primary_team_id uuid references public.teams(id),
  has_paid boolean default false,
  onboarding_complete boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- USER FOLLOWED TEAMS
-- ============================================
create table public.user_teams (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  team_id uuid references public.teams(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, team_id)
);

-- ============================================
-- CHAT MESSAGES TABLE
-- ============================================
create table public.chat_messages (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  team_id uuid references public.teams(id) on delete cascade,
  match_id uuid references public.matches(id) on delete cascade,
  content text not null,
  created_at timestamptz default now(),
  check (
    (team_id is not null and match_id is null) or
    (team_id is null and match_id is not null)
  )
);

-- ============================================
-- PREDICTIONS TABLE
-- ============================================
create table public.predictions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  match_id uuid references public.matches(id) on delete cascade,
  predicted_winner_id uuid references public.teams(id),
  is_correct boolean,
  points_earned integer default 0,
  created_at timestamptz default now(),
  unique(user_id, match_id)
);

-- ============================================
-- TEAM STATS TABLE
-- ============================================
create table public.team_stats (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid references public.teams(id) on delete cascade unique,
  played integer default 0,
  won integer default 0,
  drawn integer default 0,
  lost integer default 0,
  goals_for integer default 0,
  goals_against integer default 0,
  goal_difference integer generated always as (goals_for - goals_against) stored,
  points integer generated always as (won * 3 + drawn) stored,
  form text default '',
  performance_trend jsonb default '[]',
  trend_insight text,
  updated_at timestamptz default now()
);

-- ============================================
-- LEADERBOARD
-- ============================================
create table public.leaderboard (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade unique,
  total_points integer default 0,
  correct_predictions integer default 0,
  total_predictions integer default 0,
  updated_at timestamptz default now()
);

-- ============================================
-- KNOCKOUT BRACKET
-- ============================================
create table public.bracket_slots (
  id uuid primary key default uuid_generate_v4(),
  stage text not null,
  slot_number integer not null,
  team_id uuid references public.teams(id),
  match_id uuid references public.matches(id),
  created_at timestamptz default now(),
  unique(stage, slot_number)
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table public.teams enable row level security;
alter table public.matches enable row level security;
alter table public.profiles enable row level security;
alter table public.user_teams enable row level security;
alter table public.chat_messages enable row level security;
alter table public.predictions enable row level security;
alter table public.team_stats enable row level security;
alter table public.leaderboard enable row level security;
alter table public.bracket_slots enable row level security;

-- Teams & matches: public read
create policy "Teams are publicly readable"   on public.teams      for select using (true);
create policy "Matches are publicly readable" on public.matches     for select using (true);
create policy "Team stats are publicly readable" on public.team_stats for select using (true);
create policy "Leaderboard is publicly readable" on public.leaderboard for select using (true);
create policy "Bracket is publicly readable"  on public.bracket_slots for select using (true);

-- Profiles
create policy "Users can view own profile"   on public.profiles for select using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- User teams
create policy "Users can view own teams"   on public.user_teams for select using (auth.uid() = user_id);
create policy "Users can insert own teams" on public.user_teams for insert with check (auth.uid() = user_id);
create policy "Users can delete own teams" on public.user_teams for delete using (auth.uid() = user_id);

-- Chat: paid users only
create policy "Paid users can read chat" on public.chat_messages for select
  using (exists (select 1 from public.profiles where id = auth.uid() and has_paid = true));
create policy "Paid users can insert chat" on public.chat_messages for insert
  with check (
    auth.uid() = user_id and
    exists (select 1 from public.profiles where id = auth.uid() and has_paid = true)
  );

-- Predictions: paid users only
create policy "Paid users can view predictions" on public.predictions for select
  using (exists (select 1 from public.profiles where id = auth.uid() and has_paid = true));
create policy "Paid users can insert predictions" on public.predictions for insert
  with check (
    auth.uid() = user_id and
    exists (select 1 from public.profiles where id = auth.uid() and has_paid = true)
  );
create policy "Paid users can update own predictions" on public.predictions for update
  using (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-create profile + leaderboard row on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- Wrapped in separate exception blocks so a failure never blocks user creation
  begin
    insert into public.profiles (id, username)
    values (new.id, new.raw_user_meta_data->>'username')
    on conflict (id) do nothing;
  exception when others then null;
  end;

  begin
    insert into public.leaderboard (user_id)
    values (new.id)
    on conflict (user_id) do nothing;
  exception when others then null;
  end;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Update profiles.updated_at automatically
create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at();

-- ============================================
-- SEED: 48 TEAMS — Official FIFA WC 2026 Draw
-- ============================================
insert into public.teams (name, code, flag_emoji, group_id) values
-- Group A
('Mexico',             'MEX', '🇲🇽', 'A'),
('South Africa',       'RSA', '🇿🇦', 'A'),
('Korea Republic',     'KOR', '🇰🇷', 'A'),
('Czechia',            'CZE', '🇨🇿', 'A'),
-- Group B
('Canada',             'CAN', '🇨🇦', 'B'),
('Bosnia-Herzegovina', 'BIH', '🇧🇦', 'B'),
('Qatar',              'QAT', '🇶🇦', 'B'),
('Switzerland',        'SUI', '🇨🇭', 'B'),
-- Group C
('Brazil',             'BRA', '🇧🇷', 'C'),
('Morocco',            'MAR', '🇲🇦', 'C'),
('Haiti',              'HAI', '🇭🇹', 'C'),
('Scotland',           'SCO', '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'C'),
-- Group D
('USA',                'USA', '🇺🇸', 'D'),
('Paraguay',           'PAR', '🇵🇾', 'D'),
('Australia',          'AUS', '🇦🇺', 'D'),
('Turkiye',            'TUR', '🇹🇷', 'D'),
-- Group E
('Germany',            'GER', '🇩🇪', 'E'),
('Curacao',            'CUW', '🇨🇼', 'E'),
('Cote d''Ivoire',     'CIV', '🇨🇮', 'E'),
('Ecuador',            'ECU', '🇪🇨', 'E'),
-- Group F
('Netherlands',        'NED', '🇳🇱', 'F'),
('Japan',              'JPN', '🇯🇵', 'F'),
('Sweden',             'SWE', '🇸🇪', 'F'),
('Tunisia',            'TUN', '🇹🇳', 'F'),
-- Group G
('Belgium',            'BEL', '🇧🇪', 'G'),
('Egypt',              'EGY', '🇪🇬', 'G'),
('IR Iran',            'IRN', '🇮🇷', 'G'),
('New Zealand',        'NZL', '🇳🇿', 'G'),
-- Group H
('Spain',              'ESP', '🇪🇸', 'H'),
('Cabo Verde',         'CPV', '🇨🇻', 'H'),
('Saudi Arabia',       'KSA', '🇸🇦', 'H'),
('Uruguay',            'URU', '🇺🇾', 'H'),
-- Group I
('France',             'FRA', '🇫🇷', 'I'),
('Senegal',            'SEN', '🇸🇳', 'I'),
('Iraq',               'IRQ', '🇮🇶', 'I'),
('Norway',             'NOR', '🇳🇴', 'I'),
-- Group J
('Argentina',          'ARG', '🇦🇷', 'J'),
('Algeria',            'ALG', '🇩🇿', 'J'),
('Austria',            'AUT', '🇦🇹', 'J'),
('Jordan',             'JOR', '🇯🇴', 'J'),
-- Group K
('Portugal',           'POR', '🇵🇹', 'K'),
('Congo DR',           'COD', '🇨🇩', 'K'),
('Uzbekistan',         'UZB', '🇺🇿', 'K'),
('Colombia',           'COL', '🇨🇴', 'K'),
-- Group L
('England',            'ENG', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'L'),
('Croatia',            'CRO', '🇭🇷', 'L'),
('Ghana',              'GHA', '🇬🇭', 'L'),
('Panama',             'PAN', '🇵🇦', 'L');

-- Initialize team_stats row for every team
insert into public.team_stats (team_id)
select id from public.teams;
