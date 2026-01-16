'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useProfile } from '@/hooks/useProfile'
import { useQuests } from '@/hooks/useQuests'
import { xpProgress, HunterRank } from '@/types/database'
import QuestCard from '@/components/QuestCard'
import AddQuestModal from '@/components/AddQuestModal'
import LevelUpModal from '@/components/LevelUpModal'
import SystemPanel, { StatCard } from '@/components/ui/SystemPanel'
import XPBar from '@/components/ui/XPBar'
import StreakFlame from '@/components/ui/StreakFlame'
import RankBadge from '@/components/RankBadge'
import FeedbackFAB from '@/components/FeedbackFAB'

export default function DashboardPage() {
  const { profile, loading: profileLoading, error: profileError, refreshProfile } = useProfile()
  const { quests, completedToday, loading: questsLoading, addQuest, deleteQuest, markCompleted } = useQuests()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [completingQuest, setCompletingQuest] = useState<string | null>(null)
  const [levelUpData, setLevelUpData] = useState<{
    show: boolean
    newLevel: number
    newRank: HunterRank
    oldRank?: HunterRank
  }>({ show: false, newLevel: 1, newRank: 'E' })

  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const handleCompleteQuest = async (questId: string) => {
    setCompletingQuest(questId)
    const oldRank = profile?.hunter_rank || 'E'

    try {
      const response = await fetch('/api/complete-quest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quest_id: questId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to complete quest')
      }

      const data = await response.json()

      markCompleted(questId)
      refreshProfile()

      // Show level up modal if leveled up
      if (data.leveled_up) {
        setLevelUpData({
          show: true,
          newLevel: data.new_level,
          newRank: data.new_rank,
          oldRank: oldRank !== data.new_rank ? oldRank : undefined,
        })
      }
    } catch (error) {
      console.error('Error completing quest:', error)
      alert(error instanceof Error ? error.message : 'Failed to complete quest')
    } finally {
      setCompletingQuest(null)
    }
  }

  const handleDeleteQuest = async (questId: string) => {
    if (!confirm('Are you sure you want to delete this quest?')) return

    try {
      await deleteQuest(questId)
    } catch (error) {
      console.error('Error deleting quest:', error)
      alert(error instanceof Error ? error.message : 'Failed to delete quest')
    }
  }

  const loading = profileLoading || questsLoading

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-2 border-[var(--system-blue)] border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (profileError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SystemPanel className="max-w-md">
          <div className="text-center">
            <p className="text-[var(--dungeon-red)] mb-4 font-display">{profileError}</p>
            <button
              onClick={handleSignOut}
              className="btn-system px-6 py-2 rounded-lg"
            >
              Sign Out & Try Again
            </button>
          </div>
        </SystemPanel>
      </div>
    )
  }

  const progress = profile ? xpProgress(profile.xp) : { current: 0, needed: 100, percentage: 0 }

  const activeQuests = quests.filter(q => !completedToday.has(q.id))
  const completedQuests = quests.filter(q => completedToday.has(q.id))

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
                className="text-[var(--system-cyan)] font-display text-sm uppercase tracking-wider"
              >
                Dashboard
              </Link>
              <Link
                href="/leaderboard"
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-display text-sm uppercase tracking-wider transition-colors"
              >
                Leaderboard
              </Link>
              <button
                onClick={handleSignOut}
                className="text-[var(--text-muted)] hover:text-[var(--dungeon-red)] font-display text-sm uppercase tracking-wider transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-display font-bold tracking-wide text-[var(--text-primary)]">
            Welcome, <span className="holo-text">{profile?.display_name || profile?.username || 'Hunter'}</span>
          </h1>
          <p className="text-[var(--text-secondary)] mt-2 font-body">
            Your quest board awaits. Complete quests to gain XP and rank up.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Hunter Rank"
            value=""
            icon={<RankBadge rank={profile?.hunter_rank || 'E'} size="lg" showLabel={false} />}
          />
          <StatCard
            label="Level"
            value={profile?.level || 1}
            accentColor="var(--text-primary)"
          />
          <StatCard
            label="Total XP"
            value={(profile?.xp || 0).toLocaleString()}
            accentColor="var(--system-cyan)"
          />
          <StatCard
            label="Streak"
            value=""
            icon={<StreakFlame count={profile?.streak_count || 0} size="md" />}
          />
        </div>

        {/* XP Progress */}
        <SystemPanel title="Experience Progress" className="mb-8">
          <XPBar
            current={progress.current}
            max={progress.needed}
            level={profile?.level || 1}
          />
        </SystemPanel>

        {/* Quest Board */}
        <SystemPanel
          title="Quest Board"
          subtitle={activeQuests.length > 0 ? `${activeQuests.length} active quest${activeQuests.length !== 1 ? 's' : ''}` : undefined}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsModalOpen(true)}
              className="btn-system px-4 py-2 rounded-lg font-display text-sm uppercase tracking-wider"
            >
              + New Quest
            </motion.button>
          </div>

          {quests.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-lg text-[var(--text-muted)] font-display">No quests yet</p>
              <p className="text-sm text-[var(--text-muted)] mt-2 font-body">
                Create your first quest to start earning XP
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {/* Active Quests */}
              <AnimatePresence mode="popLayout">
                {activeQuests.map((quest) => (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    onComplete={handleCompleteQuest}
                    onDelete={handleDeleteQuest}
                    loading={completingQuest === quest.id}
                  />
                ))}
              </AnimatePresence>

              {/* Completed Quests */}
              {completedQuests.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-display text-[var(--text-secondary)] mb-4 uppercase tracking-wider">
                    Completed Today ({completedQuests.length})
                  </h3>
                  <AnimatePresence mode="popLayout">
                    {completedQuests.map((quest) => (
                      <QuestCard
                        key={quest.id}
                        quest={quest}
                        onComplete={handleCompleteQuest}
                        onDelete={handleDeleteQuest}
                        isCompleted
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}
        </SystemPanel>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SystemPanel title="Quests Completed">
            <div className="flex items-end gap-2">
              <span className="text-4xl font-display font-bold text-[var(--system-cyan)]">
                {profile?.total_quests_completed || 0}
              </span>
              <span className="text-[var(--text-muted)] text-sm mb-1 font-body">total</span>
            </div>
          </SystemPanel>

          <SystemPanel title="Today&apos;s Progress">
            <div className="flex items-end gap-2">
              <span className="text-4xl font-display font-bold text-green-400">
                {completedQuests.length}
              </span>
              <span className="text-[var(--text-muted)] text-sm mb-1 font-body">
                / {quests.length} quests
              </span>
            </div>
          </SystemPanel>
        </div>
      </main>

      {/* Add Quest Modal */}
      <AddQuestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addQuest}
      />

      {/* Level Up Modal */}
      <LevelUpModal
        isOpen={levelUpData.show}
        onClose={() => setLevelUpData(prev => ({ ...prev, show: false }))}
        newLevel={levelUpData.newLevel}
        newRank={levelUpData.newRank}
        oldRank={levelUpData.oldRank}
      />

      {/* Feedback FAB */}
      <FeedbackFAB />
    </div>
  )
}
