-- ============================================================
-- FIFA World Cup 2026 — Full Match Schedule (104 matches)
-- All times stored as UTC. EDT = UTC-4 during Jun-Jul 2026.
-- Run AFTER update-teams-2026.sql has been executed.
-- ============================================================

-- Add note column for knockout-round matchup descriptions
alter table public.matches add column if not exists note text;

-- Clear existing match data (safe re-run)
delete from public.bracket_slots;
delete from public.predictions;
delete from public.chat_messages where match_id is not null;
delete from public.matches;

-- ============================================================
-- GROUP STAGE (72 matches)
-- Teams looked up by code via JOIN
-- ============================================================
insert into public.matches (home_team_id, away_team_id, stage, group_id, match_date, status, venue)
select h.id, a.id, m.stage, m.grp, m.dt::timestamptz, 'scheduled', m.venue
from (values
  -- ── MATCHDAY 1 ──────────────────────────────────────────
  -- Jun 11
  ('MEX','RSA','group','A','2026-06-11 19:00:00+00','Mexico City'),
  ('KOR','CZE','group','A','2026-06-12 02:00:00+00','Guadalajara'),
  -- Jun 12
  ('CAN','BIH','group','B','2026-06-12 19:00:00+00','Toronto'),
  ('USA','PAR','group','D','2026-06-13 01:00:00+00','Los Angeles'),
  -- Jun 13
  ('QAT','SUI','group','B','2026-06-13 19:00:00+00','San Francisco'),
  ('BRA','MAR','group','C','2026-06-13 22:00:00+00','New York/NJ'),
  ('HAI','SCO','group','C','2026-06-14 01:00:00+00','Boston'),
  ('AUS','TUR','group','D','2026-06-14 04:00:00+00','Vancouver'),
  -- Jun 14
  ('GER','CUW','group','E','2026-06-14 17:00:00+00','Houston'),
  ('NED','JPN','group','F','2026-06-14 20:00:00+00','Dallas'),
  ('CIV','ECU','group','E','2026-06-14 23:00:00+00','Philadelphia'),
  ('TUN','SWE','group','F','2026-06-15 02:00:00+00','Monterrey'),
  -- Jun 15
  ('ESP','CPV','group','H','2026-06-15 16:00:00+00','Atlanta'),
  ('BEL','EGY','group','G','2026-06-15 19:00:00+00','Seattle'),
  ('KSA','URU','group','H','2026-06-15 22:00:00+00','Miami'),
  ('IRN','NZL','group','G','2026-06-16 01:00:00+00','Los Angeles'),
  -- Jun 16
  ('FRA','SEN','group','I','2026-06-16 19:00:00+00','New York/NJ'),
  ('IRQ','NOR','group','I','2026-06-16 22:00:00+00','Boston'),
  ('ARG','ALG','group','J','2026-06-17 01:00:00+00','Kansas City'),
  ('AUT','JOR','group','J','2026-06-17 04:00:00+00','San Francisco'),
  -- Jun 17
  ('POR','COD','group','K','2026-06-17 17:00:00+00','Houston'),
  ('ENG','CRO','group','L','2026-06-17 20:00:00+00','Dallas'),
  ('GHA','PAN','group','L','2026-06-17 23:00:00+00','Toronto'),
  ('UZB','COL','group','K','2026-06-18 02:00:00+00','Mexico City'),

  -- ── MATCHDAY 2 ──────────────────────────────────────────
  -- Jun 18
  ('CZE','RSA','group','A','2026-06-18 16:00:00+00','Atlanta'),
  ('SUI','BIH','group','B','2026-06-18 19:00:00+00','Los Angeles'),
  ('CAN','QAT','group','B','2026-06-18 22:00:00+00','Vancouver'),
  ('MEX','KOR','group','A','2026-06-19 01:00:00+00','Guadalajara'),
  -- Jun 19
  ('USA','AUS','group','D','2026-06-19 19:00:00+00','Seattle'),
  ('SCO','MAR','group','C','2026-06-19 19:00:00+00','Boston'),
  ('BRA','HAI','group','C','2026-06-20 01:00:00+00','Philadelphia'),
  ('TUR','PAR','group','D','2026-06-20 04:00:00+00','San Francisco'),
  -- Jun 20
  ('NED','SWE','group','F','2026-06-20 17:00:00+00','Houston'),
  ('GER','CIV','group','E','2026-06-20 20:00:00+00','Toronto'),
  ('ECU','CUW','group','E','2026-06-21 00:00:00+00','Kansas City'),
  ('TUN','JPN','group','F','2026-06-21 04:00:00+00','Monterrey'),
  -- Jun 21
  ('ESP','KSA','group','H','2026-06-21 16:00:00+00','Atlanta'),
  ('BEL','IRN','group','G','2026-06-21 19:00:00+00','Los Angeles'),
  ('URU','CPV','group','H','2026-06-21 22:00:00+00','Miami'),
  ('NZL','EGY','group','G','2026-06-22 01:00:00+00','Vancouver'),
  -- Jun 22
  ('ARG','AUT','group','J','2026-06-22 17:00:00+00','Dallas'),
  ('FRA','IRQ','group','I','2026-06-22 21:00:00+00','Philadelphia'),
  ('NOR','SEN','group','I','2026-06-23 00:00:00+00','New York/NJ'),
  ('JOR','ALG','group','J','2026-06-23 03:00:00+00','San Francisco'),
  -- Jun 23
  ('POR','UZB','group','K','2026-06-23 17:00:00+00','Houston'),
  ('ENG','GHA','group','L','2026-06-23 20:00:00+00','Boston'),
  ('PAN','CRO','group','L','2026-06-23 23:00:00+00','Toronto'),
  ('COL','COD','group','K','2026-06-24 02:00:00+00','Guadalajara'),

  -- ── MATCHDAY 3 (simultaneous kick-offs per group) ───────
  -- Jun 24
  ('SUI','CAN','group','B','2026-06-24 19:00:00+00','Vancouver'),
  ('BIH','QAT','group','B','2026-06-24 19:00:00+00','Seattle'),
  ('BRA','SCO','group','C','2026-06-24 22:00:00+00','Miami'),
  ('MAR','HAI','group','C','2026-06-24 22:00:00+00','Atlanta'),
  ('MEX','CZE','group','A','2026-06-25 01:00:00+00','Mexico City'),
  ('KOR','RSA','group','A','2026-06-25 01:00:00+00','Monterrey'),
  -- Jun 25
  ('ECU','GER','group','E','2026-06-25 20:00:00+00','New York/NJ'),
  ('CUW','CIV','group','E','2026-06-25 20:00:00+00','Philadelphia'),
  ('TUN','NED','group','F','2026-06-25 23:00:00+00','Kansas City'),
  ('JPN','SWE','group','F','2026-06-25 23:00:00+00','Dallas'),
  ('USA','TUR','group','D','2026-06-26 02:00:00+00','Los Angeles'),
  ('PAR','AUS','group','D','2026-06-26 02:00:00+00','San Francisco'),
  -- Jun 26
  ('NOR','FRA','group','I','2026-06-26 19:00:00+00','Boston'),
  ('SEN','IRQ','group','I','2026-06-26 19:00:00+00','Toronto'),
  ('URU','ESP','group','H','2026-06-27 00:00:00+00','Guadalajara'),
  ('CPV','KSA','group','H','2026-06-27 00:00:00+00','Houston'),
  ('NZL','BEL','group','G','2026-06-27 03:00:00+00','Vancouver'),
  ('EGY','IRN','group','G','2026-06-27 03:00:00+00','Seattle'),
  -- Jun 27
  ('PAN','ENG','group','L','2026-06-27 21:00:00+00','New York/NJ'),
  ('CRO','GHA','group','L','2026-06-27 21:00:00+00','Philadelphia'),
  ('COL','POR','group','K','2026-06-27 23:30:00+00','Miami'),
  ('COD','UZB','group','K','2026-06-27 23:30:00+00','Atlanta'),
  ('ARG','JOR','group','J','2026-06-28 02:00:00+00','Dallas'),
  ('ALG','AUT','group','J','2026-06-28 02:00:00+00','Kansas City')
) as m(hc, ac, stage, grp, dt, venue)
join public.teams h on h.code = m.hc
join public.teams a on a.code = m.ac;

-- ============================================================
-- ROUND OF 32 (16 matches — teams TBD)
-- ============================================================
insert into public.matches (home_team_id, away_team_id, stage, group_id, match_date, status, venue, note)
values
  (null, null, 'r32', null, '2026-06-28 19:00:00+00', 'scheduled', 'Los Angeles',   'A Runner-up vs B Runner-up'),
  (null, null, 'r32', null, '2026-06-29 17:00:00+00', 'scheduled', 'Houston',        'C Winner vs F Runner-up'),
  (null, null, 'r32', null, '2026-06-29 20:30:00+00', 'scheduled', 'Boston',         'E Winner vs Best 3rd'),
  (null, null, 'r32', null, '2026-06-30 01:00:00+00', 'scheduled', 'Monterrey',      'F Winner vs C Runner-up'),
  (null, null, 'r32', null, '2026-06-30 17:00:00+00', 'scheduled', 'Dallas',         'E Runner-up vs I Runner-up'),
  (null, null, 'r32', null, '2026-06-30 21:00:00+00', 'scheduled', 'New York/NJ',    'I Winner vs Best 3rd'),
  (null, null, 'r32', null, '2026-07-01 01:00:00+00', 'scheduled', 'Mexico City',    'A Winner vs Best 3rd'),
  (null, null, 'r32', null, '2026-07-01 16:00:00+00', 'scheduled', 'Atlanta',        'L Winner vs Best 3rd'),
  (null, null, 'r32', null, '2026-07-01 20:00:00+00', 'scheduled', 'Seattle',        'G Winner vs Best 3rd'),
  (null, null, 'r32', null, '2026-07-02 00:00:00+00', 'scheduled', 'San Francisco',  'D Winner vs Best 3rd'),
  (null, null, 'r32', null, '2026-07-02 19:00:00+00', 'scheduled', 'Los Angeles',    'H Winner vs J Runner-up'),
  (null, null, 'r32', null, '2026-07-02 23:00:00+00', 'scheduled', 'Toronto',        'K Runner-up vs L Runner-up'),
  (null, null, 'r32', null, '2026-07-03 03:00:00+00', 'scheduled', 'Vancouver',      'B Winner vs Best 3rd'),
  (null, null, 'r32', null, '2026-07-03 18:00:00+00', 'scheduled', 'Dallas',         'D Runner-up vs G Runner-up'),
  (null, null, 'r32', null, '2026-07-03 22:00:00+00', 'scheduled', 'Miami',          'J Winner vs H Runner-up'),
  (null, null, 'r32', null, '2026-07-04 01:30:00+00', 'scheduled', 'Kansas City',    'K Winner vs Best 3rd');

-- ============================================================
-- ROUND OF 16 (8 matches — teams TBD)
-- ============================================================
insert into public.matches (home_team_id, away_team_id, stage, group_id, match_date, status, venue, note)
values
  (null, null, 'r16', null, '2026-07-04 17:00:00+00', 'scheduled', 'Houston',       'R16 Match 1'),
  (null, null, 'r16', null, '2026-07-04 21:00:00+00', 'scheduled', 'Philadelphia',  'R16 Match 2'),
  (null, null, 'r16', null, '2026-07-05 20:00:00+00', 'scheduled', 'New York/NJ',   'R16 Match 3'),
  (null, null, 'r16', null, '2026-07-06 00:00:00+00', 'scheduled', 'Mexico City',   'R16 Match 4'),
  (null, null, 'r16', null, '2026-07-06 19:00:00+00', 'scheduled', 'Dallas',        'R16 Match 5'),
  (null, null, 'r16', null, '2026-07-07 00:00:00+00', 'scheduled', 'Seattle',       'R16 Match 6'),
  (null, null, 'r16', null, '2026-07-07 16:00:00+00', 'scheduled', 'Atlanta',       'R16 Match 7'),
  (null, null, 'r16', null, '2026-07-07 20:00:00+00', 'scheduled', 'Vancouver',     'R16 Match 8');

-- ============================================================
-- QUARTERFINALS (4 matches — teams TBD)
-- ============================================================
insert into public.matches (home_team_id, away_team_id, stage, group_id, match_date, status, venue, note)
values
  (null, null, 'qf', null, '2026-07-09 20:00:00+00', 'scheduled', 'Boston',       'QF Match 1'),
  (null, null, 'qf', null, '2026-07-10 19:00:00+00', 'scheduled', 'Los Angeles',  'QF Match 2'),
  (null, null, 'qf', null, '2026-07-11 21:00:00+00', 'scheduled', 'Miami',        'QF Match 3'),
  (null, null, 'qf', null, '2026-07-12 01:00:00+00', 'scheduled', 'Kansas City',  'QF Match 4');

-- ============================================================
-- SEMIFINALS (2 matches — teams TBD)
-- ============================================================
insert into public.matches (home_team_id, away_team_id, stage, group_id, match_date, status, venue, note)
values
  (null, null, 'sf', null, '2026-07-14 19:00:00+00', 'scheduled', 'Dallas',  'Semi-Final 1'),
  (null, null, 'sf', null, '2026-07-15 19:00:00+00', 'scheduled', 'Atlanta', 'Semi-Final 2');

-- ============================================================
-- 3RD PLACE + FINAL (2 matches — teams TBD)
-- ============================================================
insert into public.matches (home_team_id, away_team_id, stage, group_id, match_date, status, venue, note)
values
  (null, null, 'sf',    null, '2026-07-18 19:00:00+00', 'scheduled', 'Miami',        '3rd Place Play-off'),
  (null, null, 'final', null, '2026-07-19 19:00:00+00', 'scheduled', 'New York/NJ',  'FIFA World Cup Final');

-- ============================================================
-- VERIFY
-- ============================================================
select stage, count(*) as matches
from public.matches
group by stage
order by
  case stage
    when 'group' then 1 when 'r32' then 2 when 'r16' then 3
    when 'qf'    then 4 when 'sf'  then 5 when 'final' then 6
  end;
