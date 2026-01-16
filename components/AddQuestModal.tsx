'use client'

import { useState } from 'react'
import { QuestCategory, QuestDifficulty, CATEGORY_ICONS, DIFFICULTY_XP } from '@/types/database'

interface AddQuestModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (quest: {
    title: string
    description: string
    category: QuestCategory
    difficulty: QuestDifficulty
    is_daily: boolean
  }) => void
}

export default function AddQuestModal({ isOpen, onClose, onAdd }: AddQuestModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<QuestCategory>('general')
  const [difficulty, setDifficulty] = useState<QuestDifficulty>('E')
  const [isDaily, setIsDaily] = useState(true)
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    try {
      await onAdd({
        title: title.trim(),
        description: description.trim(),
        category,
        difficulty,
        is_daily: isDaily,
      })
      // Reset form
      setTitle('')
      setDescription('')
      setCategory('general')
      setDifficulty('E')
      setIsDaily(true)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const categories: QuestCategory[] = ['study', 'fitness', 'coding', 'health', 'general']
  const difficulties: QuestDifficulty[] = ['E', 'D', 'C', 'B', 'A', 'S']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#16213e] border border-[#374151] rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
        <h2 className="text-xl font-bold text-[#eaeaea] mb-6">Create New Quest</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">
              Quest Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Study for 1 hour"
              required
              className="w-full px-4 py-3 bg-[#1a1a2e] border border-[#374151] rounded-lg
                       text-[#eaeaea] placeholder-[#6b7280]
                       focus:outline-none focus:border-[#e94560] focus:ring-1 focus:ring-[#e94560]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details..."
              rows={2}
              className="w-full px-4 py-3 bg-[#1a1a2e] border border-[#374151] rounded-lg
                       text-[#eaeaea] placeholder-[#6b7280] resize-none
                       focus:outline-none focus:border-[#e94560] focus:ring-1 focus:ring-[#e94560]"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all
                    ${category === cat
                      ? 'bg-[#e94560] text-white'
                      : 'bg-[#1a1a2e] text-[#9ca3af] hover:text-[#eaeaea] border border-[#374151]'
                    }`}
                >
                  {CATEGORY_ICONS[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">
              Difficulty (XP Reward)
            </label>
            <div className="flex flex-wrap gap-2">
              {difficulties.map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setDifficulty(diff)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all
                    ${difficulty === diff
                      ? 'bg-[#e94560] text-white'
                      : 'bg-[#1a1a2e] text-[#9ca3af] hover:text-[#eaeaea] border border-[#374151]'
                    }`}
                >
                  {diff} (+{DIFFICULTY_XP[diff]} XP)
                </button>
              ))}
            </div>
          </div>

          {/* Daily Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#9ca3af]">Daily Quest (resets each day)</span>
            <button
              type="button"
              onClick={() => setIsDaily(!isDaily)}
              className={`w-12 h-6 rounded-full transition-colors relative
                ${isDaily ? 'bg-[#e94560]' : 'bg-[#374151]'}`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform
                  ${isDaily ? 'left-7' : 'left-1'}`}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-[#374151] text-[#9ca3af] rounded-lg
                       hover:text-[#eaeaea] hover:border-[#eaeaea] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="flex-1 px-4 py-3 bg-[#e94560] text-white font-semibold rounded-lg
                       hover:bg-[#ff6b6b] transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Quest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
