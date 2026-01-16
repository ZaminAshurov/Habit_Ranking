'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Bug, Lightbulb, MessageCircle, Send, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

type FeedbackType = 'bug' | 'feature' | 'other'

const feedbackTypes: { type: FeedbackType; label: string; icon: React.ReactNode; color: string }[] = [
  { type: 'bug', label: 'Report Bug', icon: <Bug className="w-5 h-5" />, color: 'var(--penalty-red)' },
  { type: 'feature', label: 'Request Feature', icon: <Lightbulb className="w-5 h-5" />, color: 'var(--prestige-gold)' },
  { type: 'other', label: 'Other', icon: <MessageCircle className="w-5 h-5" />, color: 'var(--system-cyan)' },
]

export default function FeedbackModal({ isOpen, onClose, onSuccess }: FeedbackModalProps) {
  const [type, setType] = useState<FeedbackType>('bug')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Insert feedback
      const { error: feedbackError } = await supabase
        .from('feedback')
        .insert({
          user_id: user.id,
          type,
          message: message.trim(),
        })

      if (feedbackError) throw feedbackError

      // Award XP via API
      await fetch('/api/feedback-reward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xp_amount: 50 }),
      })

      setMessage('')
      setType('bug')
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50
                       w-full max-w-md"
          >
            <div className="system-panel rounded-xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-[var(--glass-border)]">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-[var(--monarch-purple)]" />
                  <h2 className="font-display text-lg text-[var(--text-primary)] uppercase tracking-wider">
                    System Alert
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Type Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-display text-[var(--text-secondary)] uppercase tracking-wider">
                    Report Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {feedbackTypes.map((ft) => (
                      <button
                        key={ft.type}
                        type="button"
                        onClick={() => setType(ft.type)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all
                          ${type === ft.type
                            ? 'border-[var(--monarch-purple)] bg-[var(--monarch-purple)]/10'
                            : 'border-[var(--glass-border)] hover:border-[var(--system-blue)]'
                          }`}
                      >
                        <span style={{ color: type === ft.type ? ft.color : 'var(--text-muted)' }}>
                          {ft.icon}
                        </span>
                        <span className={`text-xs font-display uppercase tracking-wider
                          ${type === ft.type ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
                          {ft.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label className="block text-sm font-display text-[var(--text-secondary)] uppercase tracking-wider">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe the issue or suggestion..."
                    rows={4}
                    required
                    className="w-full px-4 py-3 bg-[var(--abyss-dark)] border border-[var(--glass-border)] rounded-lg
                             text-[var(--text-primary)] placeholder-[var(--text-muted)] font-body
                             focus:outline-none focus:border-[var(--monarch-purple)] focus:ring-1 focus:ring-[var(--monarch-purple)]
                             resize-none transition-colors"
                  />
                </div>

                {/* XP Reward Notice */}
                <div className="flex items-center gap-3 p-3 bg-[var(--prestige-gold)]/10 border border-[var(--prestige-gold)]/30 rounded-lg">
                  <span className="text-[var(--prestige-gold)] font-display font-bold">+50 XP</span>
                  <span className="text-[var(--text-secondary)] text-sm font-body">
                    Reward for system contribution
                  </span>
                </div>

                {/* Error */}
                {error && (
                  <div className="p-3 bg-[var(--penalty-red)]/10 border border-[var(--penalty-red)]/30 rounded-lg">
                    <p className="text-[var(--penalty-red)] text-sm">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !message.trim()}
                  className="w-full py-3 bg-gradient-to-r from-[var(--monarch-purple)] to-[var(--system-blue)]
                           text-white font-display font-semibold uppercase tracking-wider rounded-lg
                           hover:shadow-lg hover:shadow-[var(--monarch-purple)]/30 transition-all
                           disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Report
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
