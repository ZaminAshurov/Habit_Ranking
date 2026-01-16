'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'

interface StreakFlameProps {
  count: number
  className?: string
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function StreakFlame({
  count,
  className,
  showLabel = true,
  size = 'md',
}: StreakFlameProps) {
  // Determine intensity based on streak count
  const intensity = count >= 7 ? 'intense' : count >= 3 ? 'medium' : 'low'

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  }

  const flameStyles = {
    low: 'opacity-60',
    medium: 'streak-flame-icon',
    intense: 'streak-flame-intense',
  }

  return (
    <motion.div
      className={cn('streak-flame', className)}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 10 }}
    >
      {/* Blue Flame Icon */}
      <motion.span
        className={cn(sizeClasses[size], flameStyles[intensity])}
        animate={
          intensity === 'intense'
            ? {
                scale: [1, 1.1, 1],
                rotate: [0, 2, -2, 0],
              }
            : {}
        }
        transition={{
          duration: 1,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-[1em] h-[1em] inline-block"
          style={{
            filter:
              intensity === 'intense'
                ? 'drop-shadow(0 0 8px var(--system-cyan)) drop-shadow(0 0 16px var(--system-blue))'
                : intensity === 'medium'
                  ? 'drop-shadow(0 0 4px var(--system-cyan))'
                  : 'none',
          }}
        >
          <defs>
            <linearGradient id="flameGradient" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="var(--system-blue)" />
              <stop offset="50%" stopColor="var(--system-cyan)" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
          </defs>
          <path
            d="M12 2C12 2 8 6 8 10C8 12.21 9.79 14 12 14C14.21 14 16 12.21 16 10C16 6 12 2 12 2Z"
            fill="url(#flameGradient)"
          />
          <path
            d="M12 8C12 8 10 10 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10 12 8 12 8Z"
            fill="white"
            fillOpacity="0.6"
          />
          <path
            d="M8 14C8 14 6 16 6 18C6 20.21 8.69 22 12 22C15.31 22 18 20.21 18 18C18 16 16 14 16 14C16 16 14.21 18 12 18C9.79 18 8 16 8 14Z"
            fill="url(#flameGradient)"
            fillOpacity="0.8"
          />
        </svg>
      </motion.span>

      {/* Streak Count */}
      {showLabel && (
        <motion.span
          className={cn(
            'font-display font-bold',
            sizeClasses[size],
            intensity === 'intense'
              ? 'text-[var(--system-cyan)]'
              : intensity === 'medium'
                ? 'text-[var(--system-blue)]'
                : 'text-[var(--text-secondary)]'
          )}
          key={count} // Animate on count change
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        >
          {count}
        </motion.span>
      )}

      {/* Days label */}
      {showLabel && (
        <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider ml-1">
          day{count !== 1 ? 's' : ''}
        </span>
      )}
    </motion.div>
  )
}

// Compact inline streak display
interface InlineStreakProps {
  count: number
  className?: string
}

export function InlineStreak({ count, className }: InlineStreakProps) {
  const isIntense = count >= 7

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-display font-bold',
        isIntense ? 'text-[var(--system-cyan)]' : 'text-[var(--prestige-gold)]',
        className
      )}
    >
      <span className={isIntense ? 'streak-flame-intense' : 'streak-flame-icon'}>
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-4 h-4"
        >
          <path d="M12 2C12 2 8 6 8 10C8 12.21 9.79 14 12 14C14.21 14 16 12.21 16 10C16 6 12 2 12 2Z" />
          <path d="M8 14C8 14 6 16 6 18C6 20.21 8.69 22 12 22C15.31 22 18 20.21 18 18C18 16 16 14 16 14C16 16 14.21 18 12 18C9.79 18 8 16 8 14Z" opacity="0.7" />
        </svg>
      </span>
      {count}
    </span>
  )
}
