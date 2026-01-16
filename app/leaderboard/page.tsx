'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import LeaderboardRow from '@/components/LeaderboardRow'
import SystemPanel from '@/components/ui/SystemPanel'
import type { Profile } from '@/types/database'

export default function LeaderboardPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        setCurrentUserId(user?.id || null)

        // Fetch top 50 users by XP
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .order('xp', { ascending: false })
          .limit(50)

        if (fetchError) throw fetchError

        setProfiles(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard')
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [supabase])

  // Find current user's position
  const currentUserPosition = currentUserId
    ? profiles.findIndex(p => p.id === currentUserId) + 1
    : null

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-[var(--glass-border)] bg-[var(--glass-dark)] backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-display font-bold tracking-wider">
                <span className="holo-text">SHADOW</span>
                <span className="text-[var(--text-primary)]">RANK</span>
              </span>
            </Link>

            <div className="flex items-center gap-6">
              <Link
                href="/dashboard"
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-display text-sm uppercase tracking-wider transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/leaderboard"
                className="text-[var(--system-cyan)] font-display text-sm uppercase tracking-wider"
              >
                Leaderboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-display font-bold text-[var(--text-primary)] tracking-wide mb-2">
            Hunter <span className="holo-text">Leaderboard</span>
          </h1>
          <p className="text-[var(--text-secondary)] font-body">Top hunters ranked by total XP</p>

          {/* Current user position */}
          {currentUserPosition && currentUserPosition > 0 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-6 inline-block"
            >
              <SystemPanel className="px-8 py-4" chamfer={true} glow={true}>
                <p className="text-[var(--text-secondary)] text-sm font-display uppercase tracking-wider mb-1">
                  Your Position
                </p>
                <p className="text-3xl font-display font-bold text-[var(--system-cyan)]">
                  #{currentUserPosition}
                </p>
              </SystemPanel>
            </motion.div>
          )}
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-10 h-10 border-2 border-[var(--system-blue)] border-t-transparent rounded-full"
            />
          </div>
        )}

        {/* Error State */}
        {error && (
          <SystemPanel className="text-center py-12">
            <p className="text-[var(--dungeon-red)] font-display">{error}</p>
          </SystemPanel>
        )}

        {/* Empty State */}
        {!loading && !error && profiles.length === 0 && (
          <SystemPanel className="text-center py-12">
            <p className="text-lg text-[var(--text-muted)] font-display">No hunters yet</p>
            <p className="text-sm text-[var(--text-muted)] mt-2 font-body">Be the first to join!</p>
          </SystemPanel>
        )}

        {/* Leaderboard */}
        {!loading && !error && profiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <AnimatePresence>
              {profiles.map((profile, index) => (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <LeaderboardRow
                    profile={profile}
                    position={index + 1}
                    isCurrentUser={profile.id === currentUserId}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Footer note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-[var(--text-muted)] text-sm font-display uppercase tracking-wider">
            // Leaderboard updates in real-time
          </p>
        </motion.div>
      </main>
    </div>
  )
}
