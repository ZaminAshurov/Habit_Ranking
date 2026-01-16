'use client'

import { motion } from 'framer-motion'
import { Profile } from '@/types/database'
import RankBadge from './RankBadge'
import { InlineStreak } from './ui/StreakFlame'
import { cn } from '@/lib/cn'

interface LeaderboardRowProps {
  profile: Profile
  position: number
  isCurrentUser?: boolean
}

export default function LeaderboardRow({ profile, position, isCurrentUser }: LeaderboardRowProps) {
  const getMedalEmoji = (pos: number) => {
    if (pos === 1) return { emoji: '1', color: 'var(--prestige-gold)' }
    if (pos === 2) return { emoji: '2', color: '#c0c0c0' }
    if (pos === 3) return { emoji: '3', color: '#cd7f32' }
    return null
  }

  const medal = getMedalEmoji(position)

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className={cn(
        'system-panel flex items-center gap-4 p-4 rounded-lg transition-all',
        isCurrentUser && 'border-[var(--system-cyan)] system-panel-glow',
        position <= 3 && 'border-opacity-50'
      )}
    >
      {/* Position */}
      <div className="w-12 text-center">
        {medal ? (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-2xl font-display font-black"
            style={{ color: medal.color }}
          >
            #{medal.emoji}
          </motion.span>
        ) : (
          <span className="text-xl font-display font-bold text-[var(--text-muted)]">
            #{position}
          </span>
        )}
      </div>

      {/* Avatar placeholder */}
      <div
        className="w-12 h-12 rounded-lg flex items-center justify-center text-xl font-display font-bold border border-[var(--glass-border)]"
        style={{
          background: `linear-gradient(135deg, var(--system-blue), var(--mana-purple))`,
          color: 'white',
        }}
      >
        {(profile.display_name || profile.username || 'H').charAt(0).toUpperCase()}
      </div>

      {/* User info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3
            className={cn(
              'font-semibold font-body truncate',
              isCurrentUser ? 'text-[var(--system-cyan)]' : 'text-[var(--text-primary)]'
            )}
          >
            {profile.display_name || profile.username}
          </h3>
          {isCurrentUser && (
            <span className="text-[10px] font-display uppercase tracking-wider bg-[var(--system-blue)] text-white px-2 py-0.5 rounded">
              YOU
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1">
          <RankBadge rank={profile.hunter_rank} size="sm" animate={false} />
          <span className="text-[var(--text-secondary)] text-sm font-body">
            Level {profile.level}
          </span>
        </div>
      </div>

      {/* XP */}
      <div className="text-right">
        <p className="text-xl font-display font-bold text-[var(--system-cyan)]">
          {profile.xp.toLocaleString()}
        </p>
        <p className="text-xs text-[var(--text-muted)] font-display uppercase tracking-wider">
          XP
        </p>
      </div>

      {/* Streak */}
      <div className="text-right w-20">
        <InlineStreak count={profile.streak_count} />
        <p className="text-xs text-[var(--text-muted)] font-display uppercase tracking-wider mt-1">
          streak
        </p>
      </div>
    </motion.div>
  )
}
