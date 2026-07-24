export type TeamStatus = 'active' | 'eliminated'
export type MatchStatus = 'scheduled' | 'live' | 'finished'
export type Stage = 'group' | 'r32' | 'r16' | 'qf' | 'sf' | 'final'

export interface Team {
  id: string
  name: string
  code: string
  flag_emoji: string
  group_id: string
  status: TeamStatus
  stage_reached: string
  created_at: string
}

export interface Match {
  id: string
  home_team_id: string
  away_team_id: string
  home_score: number | null
  away_score: number | null
  stage: Stage
  group_id: string | null
  match_date: string
  status: MatchStatus
  venue: string | null
  note?: string | null        // knockout-round matchup description (e.g. "A Winner vs B Runner-up")
  home_team?: Team
  away_team?: Team
  created_at: string
}

export interface Profile {
  id: string
  username: string | null
  avatar_url: string | null
  primary_team_id: string | null
  has_paid: boolean
  onboarding_complete: boolean
  created_at: string
  updated_at: string
  primary_team?: Team
}

export interface ChatMessage {
  id: string
  user_id: string
  team_id: string | null
  match_id: string | null
  content: string
  created_at: string
  profiles?: { username: string | null; avatar_url: string | null }
}

export interface Prediction {
  id: string
  user_id: string
  match_id: string
  predicted_winner_id: string | null
  is_correct: boolean | null
  points_earned: number
  created_at: string
  match?: Match
  predicted_winner?: Team
}

export interface TeamStats {
  id: string
  team_id: string
  played: number
  won: number
  drawn: number
  lost: number
  goals_for: number
  goals_against: number
  goal_difference: number
  points: number
  form: string
  performance_trend: { round: string; points: number }[]
  trend_insight: string | null
  updated_at: string
  team?: Team
}

export interface LeaderboardEntry {
  id: string
  user_id: string
  total_points: number
  correct_predictions: number
  total_predictions: number
  updated_at: string
  profiles?: { username: string | null; avatar_url: string | null }
}

export interface BracketSlot {
  id: string
  stage: Stage
  slot_number: number
  team_id: string | null
  match_id: string | null
  team?: Team
  match?: Match
}
