'use client'

import { motion, useSpring, useTransform } from 'framer-motion'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'

interface XPBarProps {
  current: number
  max: number
  level: number
  className?: string
  showLabel?: boolean
}

export default function XPBar({
  current,
  max,
  level,
  className,
  showLabel = true,
}: XPBarProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const percentage = Math.min((current / max) * 100, 100)

  // Spring animation for the progress bar
  const springProgress = useSpring(0, {
    stiffness: 100,
    damping: 10,
  })

  // Transform spring value to percentage
  const width = useTransform(springProgress, (value) => `${value}%`)

  useEffect(() => {
    setIsAnimating(true)
    springProgress.set(percentage)

    const timer = setTimeout(() => setIsAnimating(false), 600)
    return () => clearTimeout(timer)
  }, [percentage, springProgress])

  return (
    <div className={cn('space-y-2', className)}>
      {/* Labels */}
      {showLabel && (
        <div className="flex justify-between items-center">
          <span className="text-sm font-display uppercase tracking-wider text-[var(--text-secondary)]">
            Progress to Level {level + 1}
          </span>
          <span className="text-sm font-bold font-display text-[var(--system-cyan)]">
            {Math.floor(current)} / {max} XP
          </span>
        </div>
      )}

      {/* Bar Container */}
      <div className="xp-bar-container h-4 relative">
        {/* Background glow */}
        <div
          className="absolute inset-0 opacity-30 blur-sm"
          style={{
            background: `linear-gradient(90deg, var(--system-blue) 0%, var(--system-cyan) ${percentage}%, transparent ${percentage}%)`,
          }}
        />

        {/* Main progress bar */}
        <motion.div
          className="xp-bar-fill h-full relative"
          style={{ width }}
        >
          {/* Spark effect at leading edge */}
          <motion.div
            className="absolute right-0 top-0 bottom-0 w-1"
            animate={{
              opacity: isAnimating ? [1, 0.6, 1] : 0.7,
              boxShadow: isAnimating
                ? [
                    '0 0 10px white, 0 0 20px var(--system-cyan)',
                    '0 0 20px white, 0 0 40px var(--system-cyan)',
                    '0 0 10px white, 0 0 20px var(--system-cyan)',
                  ]
                : '0 0 10px white, 0 0 20px var(--system-cyan)',
            }}
            transition={{ duration: 0.3, repeat: isAnimating ? 2 : 0 }}
            style={{
              background: 'white',
            }}
          />
        </motion.div>

        {/* Percentage markers */}
        <div className="absolute inset-0 flex justify-between px-1 pointer-events-none">
          {[25, 50, 75].map((mark) => (
            <div
              key={mark}
              className="w-px h-full bg-[var(--glass-border)] opacity-30"
              style={{ marginLeft: `${mark}%` }}
            />
          ))}
        </div>
      </div>

      {/* Percentage display */}
      <div className="text-right">
        <span className="text-xs text-[var(--text-muted)]">
          {Math.floor(percentage)}% Complete
        </span>
      </div>
    </div>
  )
}

// Mini XP bar for compact displays
interface MiniXPBarProps {
  percentage: number
  className?: string
}

export function MiniXPBar({ percentage, className }: MiniXPBarProps) {
  const springProgress = useSpring(0, {
    stiffness: 100,
    damping: 15,
  })

  const width = useTransform(springProgress, (value) => `${value}%`)

  useEffect(() => {
    springProgress.set(Math.min(percentage, 100))
  }, [percentage, springProgress])

  return (
    <div className={cn('xp-bar-container h-2', className)}>
      <motion.div
        className="h-full bg-gradient-to-r from-[var(--system-blue)] to-[var(--system-cyan)]"
        style={{ width }}
      />
    </div>
  )
}
