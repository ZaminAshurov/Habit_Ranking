'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bug, X, Sparkles, MessageSquare } from 'lucide-react'
import FeedbackModal from './FeedbackModal'

export default function FeedbackFAB() {
  const [isOpen, setIsOpen] = useState(false)
  const [showToast, setShowToast] = useState(false)

  const handleSuccess = () => {
    setIsOpen(false)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 4000)
  }

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full
                   bg-gradient-to-br from-[var(--monarch-purple)] to-[var(--system-blue)]
                   flex items-center justify-center
                   shadow-lg shadow-[var(--monarch-purple)]/30
                   border border-[var(--monarch-purple)]/50
                   hover:shadow-[var(--monarch-purple)]/50 transition-shadow"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <Bug className="w-6 h-6 text-white" />

        {/* Pulse effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-[var(--monarch-purple)]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.button>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={handleSuccess}
      />

      {/* Success Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-24 left-1/2 z-50
                       bg-[var(--glass-dark)] backdrop-blur-xl
                       border border-[var(--prestige-gold)]/50
                       rounded-lg px-6 py-4
                       shadow-lg shadow-[var(--prestige-gold)]/20"
          >
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 0.5, repeat: 3 }}
              >
                <Sparkles className="w-6 h-6 text-[var(--prestige-gold)]" />
              </motion.div>
              <div>
                <p className="text-[var(--prestige-gold)] font-display font-bold">
                  +50 XP
                </p>
                <p className="text-[var(--text-secondary)] text-sm font-body">
                  System Contribution Reward!
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
