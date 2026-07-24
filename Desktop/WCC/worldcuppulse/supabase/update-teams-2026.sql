-- FIFA World Cup 2026 Official Group Draw — Team Update
-- Run this in Supabase SQL Editor
-- Fixes foreign key constraint by nulling profiles.primary_team_id first

-- Step 1: Null out foreign keys in profiles that reference teams
update public.profiles set primary_team_id = null;

-- Step 2: Clear dependent tables in safe order
delete from public.bracket_slots;
delete from public.predictions;
delete from public.chat_messages;
delete from public.matches;
delete from public.user_teams;
delete from public.leaderboard;
delete from public.team_stats;
delete from public.teams;

-- Step 3: Insert official 48 teams with correct groups
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

-- Step 4: Re-initialize team_stats for all new teams
insert into public.team_stats (team_id)
select id from public.teams;

-- Step 5: Re-initialize leaderboard rows for existing users
insert into public.leaderboard (user_id)
select id from public.profiles
on conflict (user_id) do nothing;

-- Step 6: Verify — should show 12 groups with 4 teams each
select group_id, count(*) as teams
from public.teams
group by group_id
order by group_id;
