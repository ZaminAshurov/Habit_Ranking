'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Users, Swords, CheckCircle, Zap, Activity, MessageSquare, Shield } from 'lucide-react'
import SystemPanel from '@/components/ui/SystemPanel'
import DAUChart from '@/components/admin/DAUChart'
import RetentionChart from '@/components/admin/RetentionChart'
import StatsCard from '@/components/admin/StatsCard'
import { useDAUStats, useRetention, useTotalStats } from '@/hooks/useAnalytics'
import type { Profile, Feedback } from '@/types/database'

export default function AdminDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)

  const router = useRouter()
  const supabase = createClient()

  const { data: dauData, loading: dauLoading } = useDAUStats(7)
  const { data: retentionData, loading: retentionLoading } = useRetention()
  const { data: totalStats, loading: statsLoading } = useTotalStats()

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error || !profileData) {
          router.push('/dashboard')
          return
        }

        if (!profileData.is_admin) {
          router.push('/dashboard')
          return
        }

        setProfile(profileData)

        // Fetch recent feedback
        const { data: feedbackData } = await supabase
          .from('feedback')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10)

        setFeedback(feedbackData || [])
      } catch (err) {
        console.error('Admin check error:', err)
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    checkAdmin()
  }, [supabase, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-2 border-[var(--monarch-purple)] border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (!profile?.is_admin) {
    return null
  }

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
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--monarch-purple)]/20 border border-[var(--monarch-purple)]/50">
                <Shield className="w-4 h-4 text-[var(--monarch-purple)]" />
                <span className="text-[var(--monarch-purple)] font-display text-sm uppercase tracking-wider">
                  Admin
                </span>
              </div>
              <Link
                href="/dashboard"
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-display text-sm uppercase tracking-wider transition-colors"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-display font-bold tracking-wide text-[var(--text-primary)]">
            Admin <span className="text-[var(--monarch-purple)]">Analytics</span>
          </h1>
          <p className="text-[var(--text-secondary)] mt-2 font-body">
            System overview and user engagement metrics
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <StatsCard
            title="Total Hunters"
            value={totalStats?.total_users || 0}
            icon={Users}
            color="var(--system-cyan)"
          />
          <StatsCard
            title="Total Quests"
            value={totalStats?.total_quests || 0}
            icon={Swords}
            color="var(--prestige-gold)"
          />
          <StatsCard
            title="Completions"
            value={totalStats?.total_completions || 0}
            icon={CheckCircle}
            color="var(--rank-d)"
          />
          <StatsCard
            title="XP Awarded"
            value={totalStats?.total_xp_awarded || 0}
            icon={Zap}
            color="var(--mana-cyan)"
          />
          <StatsCard
            title="Active Today"
            value={totalStats?.active_today || 0}
            icon={Activity}
            color="var(--monarch-purple)"
          />
          <StatsCard
            title="Pending Feedback"
            value={totalStats?.feedback_pending || 0}
            icon={MessageSquare}
            color="var(--penalty-red)"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SystemPanel title="Daily Active Users" subtitle="Last 7 days">
            <DAUChart data={dauData} loading={dauLoading} />
          </SystemPanel>

          <SystemPanel title="Weekly Retention" subtitle="Cohort analysis">
            <RetentionChart data={retentionData} loading={retentionLoading} />
          </SystemPanel>
        </div>

        {/* Recent Feedback */}
        <SystemPanel title="Recent Feedback" subtitle={`${feedback.length} reports`}>
          {feedback.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[var(--text-muted)] font-display">No feedback yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {feedback.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-4 p-4 bg-[var(--abyss-dark)]/50 rounded-lg border border-[var(--glass-border)]"
                >
                  <div className={`px-2 py-1 rounded text-xs font-display uppercase tracking-wider
                    ${item.type === 'bug' ? 'bg-[var(--penalty-red)]/20 text-[var(--penalty-red)]' :
                      item.type === 'feature' ? 'bg-[var(--prestige-gold)]/20 text-[var(--prestige-gold)]' :
                      'bg-[var(--system-cyan)]/20 text-[var(--system-cyan)]'}`}
                  >
                    {item.type}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[var(--text-primary)] font-body">{item.message}</p>
                    <p className="text-[var(--text-muted)] text-sm mt-1 font-body">
                      {new Date(item.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-display uppercase
                    ${item.status === 'pending' ? 'bg-[var(--text-muted)]/20 text-[var(--text-muted)]' :
                      item.status === 'reviewed' ? 'bg-[var(--system-blue)]/20 text-[var(--system-blue)]' :
                      'bg-green-500/20 text-green-400'}`}
                  >
                    {item.status}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </SystemPanel>
      </main>
    </div>
  )
}
