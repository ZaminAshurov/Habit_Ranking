'use client'

import { useEffect, useState } from 'react'
import { HunterRank, RANK_COLORS } from '@/types/database'

interface LevelUpModalProps {
  isOpen: boolean
  onClose: () => void
  newLevel: number
  newRank: HunterRank
  oldRank?: HunterRank
}

export default function LevelUpModal({ isOpen, onClose, newLevel, newRank, oldRank }: LevelUpModalProps) {
  const [showAnimation, setShowAnimation] = useState(false)
  const rankChanged = oldRank && oldRank !== newRank

  useEffect(() => {
    if (isOpen) {
      setShowAnimation(true)
      // Auto-close after 3 seconds
      const timer = setTimeout(() => {
        onClose()
      }, 4000)
      return () => clearTimeout(timer)
    } else {
      setShowAnimation(false)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const rankColor = RANK_COLORS[newRank]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with particles effect */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative text-center p-8 ${showAnimation ? 'level-up-animation' : ''}`}>
        {/* Glow effect */}
        <div
          className="absolute inset-0 blur-3xl opacity-30"
          style={{ backgroundColor: rankColor }}
        />

        {/* Content */}
        <div className="relative">
          {/* Stars decoration */}
          <div className="text-4xl mb-4">✨</div>

          {/* Level Up Text */}
          <h2 className="text-5xl font-bold text-[#ffd700] mb-4 drop-shadow-lg">
            LEVEL UP!
          </h2>

          {/* New Level */}
          <div className="text-8xl font-black text-white mb-4 drop-shadow-2xl">
            {newLevel}
          </div>

          {/* Rank Badge */}
          {rankChanged ? (
            <div className="space-y-2">
              <p className="text-[#9ca3af]">Rank Promotion!</p>
              <div className="flex items-center justify-center gap-3">
                <span
                  className="rank-badge text-lg opacity-50"
                  style={{
                    background: `linear-gradient(135deg, ${RANK_COLORS[oldRank!]}, ${RANK_COLORS[oldRank!]}dd)`,
                    color: oldRank === 'S' ? '#1a1a2e' : 'white'
                  }}
                >
                  {oldRank}-Rank
                </span>
                <span className="text-[#ffd700] text-2xl">→</span>
                <span
                  className="rank-badge text-lg scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${rankColor}, ${rankColor}dd)`,
                    color: newRank === 'S' ? '#1a1a2e' : 'white',
                    boxShadow: `0 0 20px ${rankColor}50`
                  }}
                >
                  {newRank}-Rank
                </span>
              </div>
            </div>
          ) : (
            <div
              className="rank-badge text-lg inline-block"
              style={{
                background: `linear-gradient(135deg, ${rankColor}, ${rankColor}dd)`,
                color: newRank === 'S' ? '#1a1a2e' : 'white',
                boxShadow: `0 0 20px ${rankColor}50`
              }}
            >
              {newRank}-Rank Hunter
            </div>
          )}

          {/* Motivational message */}
          <p className="text-[#9ca3af] mt-6 text-lg">
            {newRank === 'S' ? 'You have reached the pinnacle!' :
             newRank === 'A' ? 'Elite hunter status achieved!' :
             newRank === 'B' ? 'You are becoming formidable!' :
             newRank === 'C' ? 'Your strength grows!' :
             newRank === 'D' ? 'Keep pushing forward!' :
             'The journey has just begun!'}
          </p>

          {/* Close button */}
          <button
            onClick={onClose}
            className="mt-6 px-6 py-2 bg-[#e94560] text-white rounded-lg hover:bg-[#ff6b6b] transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}
