'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Quest, CATEGORY_ICONS, RANK_COLORS, QuestDifficulty } from '@/types/database'
import { cn } from '@/lib/cn'

interface QuestCardProps {
  quest: Quest
  onComplete: (questId: string) => void
  onDelete: (questId: string) => void
  isCompleted?: boolean
  loading?: boolean
}

export default function QuestCard({ quest, onComplete, onDelete, isCompleted, loading }: QuestCardProps) {
  const difficultyColor = RANK_COLORS[quest.difficulty as QuestDifficulty]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{
        opacity: 0,
        x: 100,
        scale: 0.9,
        filter: 'blur(10px)',
        transition: { duration: 0.3 }
      }}
      whileHover={!isCompleted ? { scale: 1.01 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={cn(
        'quest-card rounded-lg p-5 relative',
        isCompleted && 'quest-card-completed'
      )}
    >
      {/* Holographic sheen on hover - handled by CSS */}

      <div className="flex items-start justify-between gap-4 relative z-10">
        <div className="flex-1">
          {/* Category & Difficulty */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{CATEGORY_ICONS[quest.category]}</span>
            <span
              className="text-xs font-display font-bold px-2 py-0.5 rounded uppercase tracking-wider"
              style={{
                backgroundColor: `${difficultyColor}20`,
                color: difficultyColor,
                borderLeft: `2px solid ${difficultyColor}`,
              }}
            >
              {quest.difficulty}-Rank
            </span>
            {quest.is_daily && (
              <span className="text-xs text-[var(--text-muted)] bg-[var(--abyss-dark)] px-2 py-0.5 rounded font-display uppercase tracking-wider">
                Daily
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            className={cn(
              'font-semibold text-lg font-body',
              isCompleted
                ? 'line-through text-[var(--text-muted)]'
                : 'text-[var(--text-primary)]'
            )}
          >
            {quest.title}
          </h3>

          {/* Description */}
          {quest.description && (
            <p className="text-[var(--text-secondary)] text-sm mt-1 font-body">
              {quest.description}
            </p>
          )}

          {/* XP Reward */}
          <motion.div
            className="mt-3 flex items-center gap-1"
            animate={loading ? { opacity: [1, 0.5, 1] } : {}}
            transition={{ repeat: Infinity, duration: 0.8 }}
          >
            <span className="text-[var(--system-cyan)] font-bold font-display">
              +{quest.xp_reward} XP
            </span>
          </motion.div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <AnimatePresence mode="wait">
            {!isCompleted ? (
              <motion.button
                key="complete"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onComplete(quest.id)}
                disabled={loading}
                className={cn(
                  'btn-system px-4 py-2 text-sm font-medium rounded-lg',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {loading ? (
                  <motion.span
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ repeat: Infinity, duration: 0.6 }}
                  >
                    ...
                  </motion.span>
                ) : (
                  'Complete'
                )}
              </motion.button>
            ) : (
              <motion.span
                key="done"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-4 py-2 bg-green-500/20 text-green-400 text-sm font-medium font-display rounded-lg text-center border border-green-500/30"
              >
                Done
              </motion.span>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ color: 'var(--dungeon-red)' }}
            onClick={() => onDelete(quest.id)}
            className="px-4 py-2 text-[var(--text-muted)] text-sm transition-colors font-body"
          >
            Delete
          </motion.button>
        </div>
      </div>

      {/* Completion effect overlay */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.05), transparent)',
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
