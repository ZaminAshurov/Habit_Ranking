import type { HunterRank } from '@/types/database'

// XP thresholds for levels (same formula as in types/database.ts but for server use)
export const XP_PER_LEVEL = 100

// Calculate level from XP
export function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / XP_PER_LEVEL)) + 1
}

// Calculate XP needed for next level
export function xpForNextLevel(currentLevel: number): number {
  return Math.pow(currentLevel, 2) * XP_PER_LEVEL
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

// Check if user leveled up
export function checkLevelUp(oldXp: number, newXp: number): {
  leveledUp: boolean
  oldLevel: number
  newLevel: number
  newRank: HunterRank
} {
  const oldLevel = calculateLevel(oldXp)
  const newLevel = calculateLevel(newXp)
  const leveledUp = newLevel > oldLevel
  const newRank = calculateHunterRank(newLevel)

  return { leveledUp, oldLevel, newLevel, newRank }
}

// Calculate streak
export function calculateStreak(lastActiveDate: string | null, currentStreak: number): {
  newStreak: number
  streakBroken: boolean
} {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (!lastActiveDate) {
    // First activity ever
    return { newStreak: 1, streakBroken: false }
  }

  const lastActive = new Date(lastActiveDate)
  lastActive.setHours(0, 0, 0, 0)

  const diffTime = today.getTime() - lastActive.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    // Same day - no change
    return { newStreak: currentStreak, streakBroken: false }
  } else if (diffDays === 1) {
    // Consecutive day - increment streak
    return { newStreak: currentStreak + 1, streakBroken: false }
  } else {
    // Streak broken - reset to 1
    return { newStreak: 1, streakBroken: true }
  }
}
