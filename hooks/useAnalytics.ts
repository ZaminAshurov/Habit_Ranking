'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'

interface DAUStat {
  date: string
  users: number
}

interface RetentionData {
  cohort: string
  week: number
  users: number
}

interface TotalStats {
  total_users: number
  total_quests: number
  total_completions: number
  total_xp_awarded: number
  active_today: number
  feedback_pending: number
}

// Log user activity
export function useActivityLogger() {
  const supabase = createClient()

  const logActivity = useCallback(async (eventType: string, metadata: Record<string, unknown> = {}) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          event_type: eventType,
          metadata,
        })
    } catch (error) {
      console.error('Failed to log activity:', error)
    }
  }, [supabase])

  return { logActivity }
}

// Get DAU stats (admin only)
export function useDAUStats(daysBack: number = 7) {
  const [data, setData] = useState<DAUStat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const fetchDAU = async () => {
      try {
        setLoading(true)
        const { data: result, error: rpcError } = await supabase
          .rpc('get_dau_stats', { days_back: daysBack })

        if (rpcError) throw rpcError
        setData(result || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch DAU stats')
      } finally {
        setLoading(false)
      }
    }

    fetchDAU()
  }, [supabase, daysBack])

  return { data, loading, error }
}

// Get retention data (admin only)
export function useRetention() {
  const [data, setData] = useState<RetentionData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const fetchRetention = async () => {
      try {
        setLoading(true)
        const { data: result, error: rpcError } = await supabase
          .rpc('get_weekly_retention')

        if (rpcError) throw rpcError
        setData(result || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch retention data')
      } finally {
        setLoading(false)
      }
    }

    fetchRetention()
  }, [supabase])

  return { data, loading, error }
}

// Get total stats (admin only)
export function useTotalStats() {
  const [data, setData] = useState<TotalStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const { data: result, error: rpcError } = await supabase
          .rpc('get_total_stats')

        if (rpcError) throw rpcError
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch total stats')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [supabase])

  return { data, loading, error }
}

// Get user streak
export function useUserStreak(userId?: string) {
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    const fetchStreak = async () => {
      if (!userId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const { data: result, error: rpcError } = await supabase
          .rpc('get_user_streak', { target_user_id: userId })

        if (rpcError) throw rpcError
        setStreak(result || 0)
      } catch (err) {
        console.error('Failed to fetch streak:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStreak()
  }, [supabase, userId])

  return { streak, loading }
}
