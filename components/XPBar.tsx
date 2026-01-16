'use client'

import { xpProgress } from '@/types/database'

interface XPBarProps {
  xp: number
  level: number
  showDetails?: boolean
}

export default function XPBar({ xp, level, showDetails = true }: XPBarProps) {
  const progress = xpProgress(xp)

  return (
    <div className="w-full">
      {showDetails && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-[#9ca3af] text-sm">Progress to Level {level + 1}</span>
          <span className="text-[#e94560] font-medium text-sm">
            {Math.floor(progress.current)} / {progress.needed} XP
          </span>
        </div>
      )}
      <div className="h-3 bg-[#1a1a2e] rounded-full overflow-hidden">
        <div
          className="xp-bar h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>
    </div>
  )
}
