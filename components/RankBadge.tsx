'use client'

import { motion } from 'framer-motion'
import { HunterRank } from '@/types/database'
import { cn } from '@/lib/cn'

interface RankBadgeProps {
  rank: HunterRank
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  animate?: boolean
}

export default function RankBadge({
  rank,
  size = 'md',
  showLabel = true,
  animate = true,
}: RankBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  }

  // Map rank to CSS class (defined in globals.css)
  const rankClass = `rank-${rank.toLowerCase()}`

  if (animate) {
    return (
      <motion.span
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        className={cn('rank-badge', sizeClasses[size], rankClass)}
      >
        {rank}
        {showLabel && '-Rank'}
      </motion.span>
    )
  }

  return (
    <span className={cn('rank-badge', sizeClasses[size], rankClass)}>
      {rank}
      {showLabel && '-Rank'}
    </span>
  )
}

// Larger display badge for profile/level-up screens
interface LargeRankBadgeProps {
  rank: HunterRank
  level?: number
}

export function LargeRankBadge({ rank, level }: LargeRankBadgeProps) {
  const rankClass = `rank-${rank.toLowerCase()}`

  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      className="relative inline-flex flex-col items-center"
    >
      {/* Main badge */}
      <motion.div
        animate={
          rank === 'S'
            ? {
                boxShadow: [
                  '0 0 30px rgba(243, 230, 0, 0.5), 0 0 60px rgba(243, 230, 0, 0.3)',
                  '0 0 40px rgba(243, 230, 0, 0.7), 0 0 80px rgba(243, 230, 0, 0.4)',
                  '0 0 30px rgba(243, 230, 0, 0.5), 0 0 60px rgba(243, 230, 0, 0.3)',
                ],
              }
            : {}
        }
        transition={{ duration: 1.5, repeat: Infinity }}
        className={cn(
          'rank-badge text-3xl px-8 py-3 font-display font-black',
          rankClass
        )}
      >
        {rank}-RANK
      </motion.div>

      {/* Level indicator */}
      {level !== undefined && (
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-2 text-sm font-display text-[var(--text-secondary)] uppercase tracking-wider"
        >
          Level {level}
        </motion.div>
      )}

      {/* Decorative corners for S-Rank */}
      {rank === 'S' && (
        <>
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-[var(--prestige-gold)]"
          />
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-[var(--prestige-gold)]"
          />
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-[var(--prestige-gold)]"
          />
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
            className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-[var(--prestige-gold)]"
          />
        </>
      )}
    </motion.div>
  )
}
