export type HunterRank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S'
export type QuestCategory = 'study' | 'fitness' | 'coding' | 'health' | 'general'
export type QuestDifficulty = 'E' | 'D' | 'C' | 'B' | 'A' | 'S'
export type FeedbackType = 'bug' | 'feature' | 'other'
export type FeedbackStatus = 'pending' | 'reviewed' | 'resolved'

export interface Profile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  xp: number
  level: number
  hunter_rank: HunterRank
  streak_count: number
  last_active_date: string | null
  total_quests_completed: number
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface Quest {
  id: string
  user_id: string
  title: string
  description: string | null
  xp_reward: number
  difficulty: QuestDifficulty
  category: QuestCategory
  is_daily: boolean
  is_active: boolean
  created_at: string
}

export interface Completion {
  id: string
  user_id: string
  quest_id: string
  xp_earned: number
  completed_at: string
}

export interface Feedback {
  id: string
  user_id: string | null
  type: FeedbackType
  message: string
  status: FeedbackStatus
  created_at: string
}

// XP thresholds for levels
export const XP_PER_LEVEL = 100

// Calculate level from XP
export function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / XP_PER_LEVEL)) + 1
}

// Calculate XP needed for next level
export function xpForNextLevel(currentLevel: number): number {
  return Math.pow(currentLevel, 2) * XP_PER_LEVEL
}

// Calculate XP progress within current level
export function xpProgress(xp: number): { current: number; needed: number; percentage: number } {
  const level = calculateLevel(xp)
  const xpForCurrentLevel = Math.pow(level - 1, 2) * XP_PER_LEVEL
  const xpForNext = xpForNextLevel(level)
  const current = xp - xpForCurrentLevel
  const needed = xpForNext - xpForCurrentLevel
  const percentage = Math.min((current / needed) * 100, 100)

  return { current, needed, percentage }
}

// Calculate hunter rank from level
export function calculateHunterRank(level: number): HunterRank {
  if (level >= 50) return 'S'
  if (level >= 30) return 'A'
  if (level >= 20) return 'B'
  if (level >= 10) return 'C'
  if (level >= 5) return 'D'
  return 'E'
}

// Rank colors for styling
export const RANK_COLORS: Record<HunterRank, string> = {
  E: '#808080',
  D: '#22c55e',
  C: '#3b82f6',
  B: '#a855f7',
  A: '#f97316',
  S: '#ffd700',
}

// Category icons
export const CATEGORY_ICONS: Record<QuestCategory, string> = {
  study: '📚',
  fitness: '💪',
  coding: '💻',
  health: '❤️',
  general: '⚡',
}

// XP rewards by difficulty
export const DIFFICULTY_XP: Record<QuestDifficulty, number> = {
  E: 10,
  D: 20,
  C: 35,
  B: 50,
  A: 75,
  S: 100,
}
